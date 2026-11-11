"""Excel sütun eşleştirme: başlıktan otomatik atama (sıra farklı, ayrı ad/soyad, fazladan sütun), elle düzeltme, hatırlama, başlıksız dosyada sıra yedeği."""
import os
import sys
import tempfile

import openpyxl

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

d = tempfile.mkdtemp()
# karışık sıra, farklı başlık adları, ayrı Ad/Soyad, tanınmayan sütun
y1 = os.path.join(d, "karisik.xlsx")
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Personel"
ws.append(["Sicil", "Ad", "Soyad", "Cep Telefonu", "E-Posta", "Departman", "Görev", "Dahili No", "Doğum Tarihi", "Kan Grubu"])
ws.append([1001, "Ayşe", "Çağlar", "0532 111 22 33", "ayse@o.com", "Tasarım", "Mühendis", "4101", "05.05.1980", "A Rh+"])
ws.append([1002, "Ali", "Veli", "0555 000 11 22", "ali@o.com", "Muhasebe", "Uzman", "4102", "07.03.1975", "0 Rh-"])
wb.save(y1)
# başlığı hiç tanınmayan dosya -> sütun sırası yedeği
y2 = os.path.join(d, "basliksiz.xlsx")
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Liste"
ws.append(["A", "B", "C", "D"])
ws.append(["Deniz Kaya", "", "0533 222 33 44", ""])
wb.save(y2)
# yanlış tahmin: "Telefon Notu" gibi başlık
y3 = os.path.join(d, "tahmin.xlsx")
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Liste"
ws.append(["Adı Soyadı", "Cep Tel No", "Cep Tel Notu"])
ws.append(["Veli Demir", "0544 111 22 33", "akşam ara"])
wb.save(y3)

with sayfa_ac() as s:
    s.set_input_files("#fileExcel", y1)
    s.wait_for_function("VCARD.D.satirlar.length>0")
    sat = s.evaluate("VCARD.D.satirlar")
    kontrol("2 kişi, ad+soyad birleşti", [r["name"] for r in sat] == ["Ayşe Çağlar", "Ali Veli"], [r["name"] for r in sat])
    kontrol("cep/mail/kurum/unvan/dahili/doğum başlıktan atandı", (sat[0]["cell"], sat[0]["mail"], sat[0]["org"], sat[0]["title"], sat[0]["ext"], sat[0]["bday"]) == ("0532 111 22 33", "ayse@o.com", "Tasarım", "Mühendis", "4101", "19800505"), sat[0])
    kontrol("tanınmayan sütunlar (Sicil, Kan Grubu) hiçbir alana girmedi", all("A Rh" not in str(v) and "1001" not in str(v) for v in sat[0].values() if isinstance(v, str)), sat[0])
    kontrol("eşleştirme paneli göründü", s.is_visible("#exPanel"))
    kontrol("panel: Mobil → D: Cep Telefonu", s.evaluate("document.querySelector('[data-ex=cell]').selectedOptions[0].textContent") == "D: Cep Telefonu")
    kontrol("kullanılmayan sütunlar listelendi", "Sicil" in s.inner_text("#exNot") and "Kan Grubu" in s.inner_text("#exNot"), s.inner_text("#exNot"))

    # elle düzeltme: Not alanına Kan Grubu ver, Ad Soyadı düzelt
    s.select_option('[data-ex="note"]', label="J: Kan Grubu")
    sat = s.evaluate("VCARD.D.satirlar")
    kontrol("elle seçim listeyi hemen yeniledi (Not = kan grubu)", sat[0]["note"] == "A Rh+" and len(sat) == 2, sat[0])
    s.select_option('[data-ex="_soyad"]', value="-1")
    kontrol("soyad sütunu kaldırılınca yalnızca ad", s.evaluate("VCARD.D.satirlar[0].name") == "Ayşe")
    s.select_option('[data-ex="_soyad"]', label="C: Soyad")

    # hatırlama: aynı başlıklı dosya tekrar yüklenince elle seçim kullanılır
    s.set_input_files("#fileExcel", y1)
    s.wait_for_function("VCARD.D.satirlar.length>0")
    kontrol("aynı başlık düzeni için elle eşleştirme hatırlandı", s.evaluate("VCARD.D.satirlar[0].note") == "A Rh+")
    s.click("#exOto")
    kontrol("'Otomatik eşleştirmeye dön' elle seçimi siler", s.evaluate("VCARD.D.satirlar[0].note") == "")

    # başlıksız: sıraya göre yedek + uyarı
    s.set_input_files("#fileExcel", y2)
    s.wait_for_function("VCARD.D.satirlar.length>0 && VCARD.D.satirlar[0].name==='Deniz Kaya'")
    kontrol("tanınmayan başlıklarda sütun sırasına dönüldü", s.evaluate("VCARD.D.satirlar[0].cell") == "0533 222 33 44")
    kontrol("sıraya göre uyarısı", "sütun sırasına göre" in s.inner_text("#msgKaynak"), s.inner_text("#msgKaynak"))

    # tahmin rozeti + düzeltme
    s.set_input_files("#fileExcel", y3)
    s.wait_for_function("VCARD.D.satirlar[0] && VCARD.D.satirlar[0].name==='Veli Demir'")
    kontrol("'Cep Tel No' tam eşleşmeyle mobil", s.evaluate("VCARD.D.satirlar[0].cell") == "0544 111 22 33")
    kontrol("'Cep Tel Notu' mobil olmadı", "akşam" not in s.evaluate("VCARD.D.satirlar[0].cell"))

    # 'sona ekle' modunda yeniden eşleştirme eski kayıtları bozmaz
    s.select_option("#yukleMod", "ekle")
    s.set_input_files("#fileExcel", y1)
    s.wait_for_function("VCARD.D.satirlar.length===3")
    s.select_option('[data-ex="note"]', label="J: Kan Grubu")
    kontrol("sona ekle: yeniden eşleştirince kayıt sayısı sabit (3), eskisi korundu", s.evaluate("VCARD.D.satirlar.length") == 3 and s.evaluate("VCARD.D.satirlar[0].name") == "Veli Demir")
bitir()
