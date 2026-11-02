"""Özlük (SQLite) kaynağı: tablo okuma, eşleştirme, süzgeç, fotoğraf BLOB, hassas alanlara dokunmama."""
import io
import os
import sqlite3
import sys
import tempfile

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

d = tempfile.mkdtemp()
yol = os.path.join(d, "ozluk_test.sqlite")
db = sqlite3.connect(yol)
db.execute("""CREATE TABLE personeller(id INTEGER PRIMARY KEY, sicil_no TEXT, adi_soyadi TEXT, bolum TEXT, unvan TEXT,
  dahili TEXT, gsm_no TEXT, tc_kimlik_no TEXT, dogum_tarihi TEXT, kan_grubu TEXT, ev_adresi TEXT, e_mail TEXT, e_mail_int TEXT,
  ayrilis_tarihi TEXT, foto BLOB)""")
buf = io.BytesIO()
Image.new("RGB", (320, 240), (30, 90, 200)).save(buf, "JPEG")
foto = buf.getvalue()
db.executemany("INSERT INTO personeller(sicil_no,adi_soyadi,bolum,unvan,dahili,gsm_no,tc_kimlik_no,dogum_tarihi,kan_grubu,ev_adresi,e_mail,e_mail_int,ayrilis_tarihi,foto) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [
    ("1001", "Test Kişi Bir", "Tasarım", "Mühendis", "4101", "05321110001", "11111111110", "1980-02-03", "A Rh+", "Gizli Mah. 1", "bir@ornek.com", "bir@int", None, foto),
    ("1002", "Test Kişi İki", "Program", "Teknisyen", "4102", "5321110002", "22222222220", "15.06.1975", "0 Rh-", "Gizli Mah. 2", "iki@ornek.com", "iki@int", None, None),
    ("1003", "Ayrılan Kişi", "Program", "Uzman", "4103", "5321110003", "33333333330", "1970-01-01", "B Rh+", "Gizli Mah. 3", "uc@ornek.com", "uc@int", "2024-01-01", None),
])
db.commit()
db.close()

# SQLite olmayan dosya
sahte = os.path.join(d, "sifreli.sqlite")
open(sahte, "wb").write(os.urandom(4096))

with sayfa_ac() as s:
    s.click('[data-kaynak="sqlite"]')
    s.set_input_files("#fileSqlite", sahte)
    s.wait_for_function("document.getElementById('msgKaynak').textContent.length>0")
    kontrol("şifreli/SQLite olmayan dosya anlaşılır hata verir", "şifresiz" in s.inner_text("#msgKaynak"), s.inner_text("#msgKaynak"))

    s.set_input_files("#fileSqlite", yol)
    s.wait_for_function("!document.getElementById('eslesPanel').hidden")
    kontrol("'personeller' tablosu otomatik seçildi", s.input_value("#sqTablo") == "personeller")
    kontrol("eşleştirme satırı her alan için var", s.locator("[data-map]").count() == 20)

    s.click("#eslesOner")
    sec = s.evaluate("Object.fromEntries([...document.querySelectorAll('[data-map]')].map(e=>[e.dataset.map,e.value]))")
    kontrol("öneri: ad", sec["name"] == "adi_soyadi", sec)
    kontrol("öneri: mobil/bölüm/unvan/foto/doğum", (sec["cell"], sec["org"], sec["title"], sec["photo"], sec["bday"]) == ("gsm_no", "bolum", "unvan", "foto", "dogum_tarihi"), sec)
    kontrol("öneri: e_mail (e_mail_int değil)", sec["mail"] == "e_mail", sec["mail"])
    kontrol("ev adresi otomatik önerilmedi (gizlilik)", sec["addr"] == "", sec["addr"])
    kontrol("öneri: dahili → Dahili, e_mail_int → İkinci E-posta", (sec["ext"], sec["mail2"]) == ("dahili", "e_mail_int"), (sec["ext"], sec["mail2"]))

    # el ile eşleştirme: iş telefonu için de dahili sütunu, şablonla görünen ad, ikinci e-posta eşleşmesini kaldır
    s.select_option('[data-map="work"]', "dahili")
    s.select_option('[data-map="mail2"]', "")
    s.fill('[data-sab="disp"]', "{adi_soyadi} ({bolum})")
    # süzgeç: ayrılış tarihi boş
    s.select_option("#sfSutun", "ayrilis_tarihi")
    s.select_option("#sfOp", "bos")
    s.click("#sqYukle")
    s.wait_for_function("VCARD.D.satirlar.length>0")
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('yüklendi')")
    sat = s.evaluate("VCARD.D.satirlar.map(r=>({...r,_img:!!r._img}))")
    kontrol("süzgeç sonrası 2 kayıt (ayrılan hariç)", len(sat) == 2, [r["name"] for r in sat])
    kontrol("şablonla görünen ad", sat[0]["disp"] == "Test Kişi Bir (Tasarım)", sat[0]["disp"])
    kontrol("dahili iş telefonuna yazıldı", sat[0]["work"] == "4101")
    kontrol("doğum tarihi ISO ve gg.aa.yyyy normalize", (sat[0]["bday"], sat[1]["bday"]) == ("19800203", "19750615"), (sat[0]["bday"], sat[1]["bday"]))
    kontrol("fotoğraf BLOB okundu (yalnızca olan kayıtta)", sat[0]["_img"] and not sat[1]["_img"])

    s.click("#genBtn")
    out = s.inner_text("#out")
    kontrol("eşleştirilmeyen hassas veri çıktıda yok (TC, kan grubu, ev adresi)",
            "11111111110" not in out and "Gizli Mah" not in out and "A Rh" not in out)
    kontrol("e-posta çıktıda, dahili e-posta yok", "bir@ornek.com" in out and "bir@int" not in out)
    kontrol("kendini sınama geçti", "geçti" in s.inner_text("#dogrulaSonuc"), s.inner_text("#dogrulaSonuc"))

    # eşleştirme kaydet / uygula
    s.once("dialog", lambda dlg: dlg.accept("Özlük varsayılan"))
    s.click("#eslesKaydet")
    s.click("#eslesTemizle")
    kontrol("temizle çalışıyor", s.input_value('[data-map="name"]') == "")
    s.select_option("#eslesKayitli", "Özlük varsayılan")
    s.click("#eslesUygula")
    kontrol("kayıtlı eşleştirme uygulandı", s.input_value('[data-map="name"]') == "adi_soyadi" and s.input_value('[data-sab="disp"]').startswith("{adi_soyadi}"))

    # listeye ekle modu
    s.select_option("#yukleMod", "ekle")
    s.click("#sqYukle")
    s.wait_for_function("VCARD.D.satirlar.length===4")
    kontrol("'sona ekle' modu", s.evaluate("VCARD.D.satirlar.length") == 4)
bitir()
