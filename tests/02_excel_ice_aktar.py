"""Excel içe aktarma: sütun sırası, tarih (saat dilimi kayması yok), çok satırlı adres, .vcf çıktısı."""
import datetime
import os
import sys
import tempfile

import openpyxl

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

d = tempfile.mkdtemp()
yol = os.path.join(d, "test.xlsx")
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Liste"
ws.append(["Adı Soyadı", "Görünen Ad", "Mobil", "İş", "Fax", "Ev", "Mail", "Adres", "Firma", "Unvan", "Web", "Grup", "Foto", "BDAY"])
ws.append(["Ayşe Çağlar Öztürk", None, "0532 111 22 33", None, None, None, "ayse@ornek.com", "Gül Sk. No:1\nÇankaya Ankara", "Test A.Ş. - Ar-Ge", "Mühendis", None, "GRUP-A", None, datetime.datetime(1966, 5, 5)])
ws.append(["Ali Veli", "Ali V.", "+905001112244", "3125550000", None, None, None, None, None, None, None, "GRUP-B", None, "07.03.1980"])
ws.append([None] * 14)  # boş satır atlanmalı
wb.create_sheet("Başka")
wb.save(yol)

with sayfa_ac() as s:
    s.set_input_files("#fileExcel", yol)
    s.wait_for_function("VCARD.D.satirlar.length>0")
    sat = s.evaluate("VCARD.D.satirlar")
    kontrol("2 kişi okundu (boş satır atlandı)", len(sat) == 2, len(sat))
    kontrol("Liste sayfası seçildi", s.input_value("#sheetSel") == "Liste")
    kontrol("Excel tarihi doğru gün (UTC kayması yok)", sat[0]["bday"] == "19660505", sat[0]["bday"])
    kontrol("gg.aa.yyyy metni normalize", sat[1]["bday"] == "19800307", sat[1]["bday"])
    kontrol("çok satırlı adres korundu", sat[0]["addr"] == "Gül Sk. No:1\nÇankaya Ankara", sat[0]["addr"])

    s.select_option("#ver", "2.1")
    s.click("#genBtn")
    out = s.evaluate("VCARD.D.vcf") if False else s.inner_text("#out")
    kontrol("2.1 BEGIN/END sayısı", out.count("BEGIN:VCARD") == 2 and out.count("END:VCARD") == 2)
    kontrol("telefon +90 biçiminde", "TEL;CELL:+905321112233" in out)
    kontrol("kısa/sabit numara +90 alan koduyla", "TEL;WORK:+903125550000" in out)
    kontrol("BDAY YYYYMMDD", "BDAY:19660505" in out)
    kontrol("boş alanlar yazılmadı (web sitesi/FAX yok; tek URL harita bağlantısı)", out.count("URL:") == 1 and "URL:https://www.google.com/maps/search/?api=1&query=" in out and "FAX" not in out)
    kontrol("Türkçe karakter QP (ş=C5=9F)", "=C5=9F" in out)
    kontrol("kendini sınama geçti", "Kendini sınama geçti" in s.inner_text("#dogrulaSonuc"), s.inner_text("#dogrulaSonuc"))

    s.select_option("#ver", "3.0")
    s.click("#genBtn")
    out = s.inner_text("#out")
    kontrol("3.0 UTF-8 ad", "FN:Ali V." in out and "Ayşe Çağlar Öztürk" in out)
    kontrol("3.0 BDAY ISO", "BDAY:1966-05-05" in out)
    kontrol("3.0 adres \\n kaçışlı", "Gül Sk. No:1\\nÇankaya Ankara" in out.replace("\n ", ""))

    # sütunu rehberden çıkar
    s.uncheck('[data-dahil="addr"]')
    s.click("#genBtn")
    kontrol("işareti kaldırılan alan yazılmıyor", "ADR" not in s.inner_text("#out"))

    with s.expect_download() as dl:
        s.click("#dlBtn")
    ad = dl.value.suggested_filename
    kontrol("indirilen dosya rehberiniz.vcf", ad == "rehberiniz.vcf", ad)
    kontrol("CRLF satır sonu", b"\r\n" in open(dl.value.path(), "rb").read())
bitir()
