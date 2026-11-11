"""Fotoğraf aktarımı: Özlük'te metin (base64/data URI) fotoğraf, Excel dosya adı uyarısı, klasörden eşleştirme, vCard'a yazım."""
import base64
import io
import os
import sqlite3
import sys
import tempfile

import openpyxl
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

d = tempfile.mkdtemp()
buf = io.BytesIO(); Image.new("RGB", (300, 200), (200, 30, 30)).save(buf, "JPEG"); jpg = buf.getvalue()
buf = io.BytesIO(); Image.new("RGB", (120, 120), (30, 30, 200)).save(buf, "PNG"); png = buf.getvalue()
b64 = base64.b64encode(jpg).decode()

# Özlük: BLOB, düz base64 metin, data URI, dosya adı
yol = os.path.join(d, "o.sqlite")
db = sqlite3.connect(yol)
db.execute("CREATE TABLE personeller(adi_soyadi TEXT, gsm_no TEXT, foto BLOB)")
db.executemany("INSERT INTO personeller VALUES(?,?,?)", [
    ("Blob Kişi", "05320000001", jpg),
    ("Base64 Kişi", "05320000002", b64),
    ("Uri Kişi", "05320000003", "data:image/jpeg;base64," + b64),
    ("Adli Kişi", "05320000004", "adli.jpg"),
    ("Bozuk Kişi", "05320000005", b"not an image at all"),
])
db.commit(); db.close()

# Excel: dosya adı var, resim yok
xl = os.path.join(d, "l.xlsx")
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Liste"
ws.append(["Adı Soyadı", "Görünen Ad", "Mobil", "İş", "Fax", "Ev", "Mail", "Adres", "Firma", "Unvan", "Web", "Grup", "Foto", "BDAY"])
ws.append(["Ali Veli", None, "05321112233", None, None, None, None, None, None, None, None, None, "ali.png", None])
ws.append(["Ayşe Kaya", None, "05321112244", None, None, None, None, None, None, None, None, None, "yok.jpg", None])
wb.save(xl)
fd = os.path.join(d, "fotolar"); os.makedirs(fd)
open(os.path.join(fd, "ali.jpg"), "wb").write(jpg)   # uzantı farklı (.png ↔ .jpg)

with sayfa_ac() as s:
    s.click('[data-kaynak="sqlite"]')
    s.set_input_files("#fileSqlite", yol)
    s.wait_for_function("document.getElementById('sqTablo').options.length>0")
    s.select_option("#sqTablo", "personeller")
    s.click("#eslesOner")
    s.click("#sqYukle")
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('kayıt yüklendi')")
    sat = s.evaluate("VCARD.D.satirlar.map(r=>({n:r.name,img:!!r._img,p:r.photo.slice(0,20)}))")
    img = {x["n"]: x["img"] for x in sat}
    kontrol("BLOB fotoğraf alındı", img["Blob Kişi"])
    kontrol("düz base64 metin fotoğraf alındı", img["Base64 Kişi"], sat)
    kontrol("data URI metin fotoğraf alındı", img["Uri Kişi"])
    kontrol("dosya adı fotoğraf olmaz, ad alanda kalır", not img["Adli Kişi"] and sat[3]["p"] == "adli.jpg", sat[3])
    msg = s.inner_text("#msgKaynak")
    kontrol("3 fotoğraf alındı + okunamayan/dosya adlı kişiler bildirildi", "3 fotoğraf alındı" in msg and "okunamadı" in msg and "dosya adı var" in msg, msg)
    s.select_option("#ver", "3.0"); s.click("#genBtn")
    out = s.inner_text("#out").replace("\n ", "")
    kontrol("vCard'da 3 PHOTO satırı", out.count("PHOTO;ENCODING=b;TYPE=JPEG:") == 3, out.count("PHOTO"))

    # Excel + klasör
    s.click('[data-kaynak="excel"]')
    s.select_option("#yukleMod", "degistir")
    s.set_input_files("#fileExcel", xl)
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('okundu')")
    msg = s.inner_text("#msgKaynak")
    kontrol("Excel: resim yüklenmemiş kişiler için klasör uyarısı", "2 kişide fotoğraf dosya adı var" in msg and "Fotoğraf klasörü seç" in msg, msg)
    s.set_input_files("#photoDir", fd)
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('fotoğraf eşleşti')")
    msg = s.inner_text("#msgKaynak")
    kontrol("uzantı farklı olsa da (ali.png ↔ ali.jpg) eşleşti", "1 fotoğraf eşleşti" in msg and s.evaluate("!!VCARD.D.satirlar[0]._img"), msg)
    kontrol("eşleşmeyen ad bildirildi", "1 kişinin fotoğraf adı" in msg and "bulunamadı" in msg, msg)
    s.select_option("#ver", "2.1"); s.click("#genBtn")
    out = s.inner_text("#out")
    kontrol("2.1 PHOTO yazıldı", out.count("PHOTO;ENCODING=BASE64;JPEG:") == 1)
bitir()
