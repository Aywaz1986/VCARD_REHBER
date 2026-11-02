"""v2.1 çıktı biçimleri: Outlook/Google CSV, tek kişilik QR (gerçek okuma), yazdırılabilir rehber."""
import base64
import csv
import io
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

BOS = "{_img:null,name:'',disp:'',cell:'',work:'',fax:'',home:'',mail:'',mail2:'',addr:'',city:'',zip:'',org:'',title:'',url:'',cat:'',photo:'',bday:'',ext:'',nick:'',note:''}"
LISTE = """()=>{const B=()=>(""" + BOS + """);const D=VCARD.D;
  D.satirlar=[Object.assign(B(),{name:'Ayşe Çağlar Öztürk',cell:'0532 111 22 33',work:'03125550000',ext:'4101',mail:'a@o.com',mail2:'b@o.com',
      org:'Test A.Ş. > Ar-Ge > Yazılım',title:'Mühendis, Kıdemli',addr:'Gül Sk. "No:1"\\nÇankaya',city:'Ankara',zip:'06680',cat:'GRUP-A',bday:'19900305',note:'=cmd|calc',nick:'Aşo'}),
              Object.assign(B(),{name:'Ali',cell:'+905001112233',cat:'GRUP-B'}),
              Object.assign(B(),{name:'Ğ Ü Ş',cat:'GRUP-A',bday:'20000229'})];VCARD.tabloCiz();}"""

with sayfa_ac() as s:
    s.evaluate(LISTE)
    s.evaluate("document.querySelector('[data-k=cat]').dispatchEvent(new Event('change',{bubbles:true}))")  # grup listesini yenile

    # ---- Outlook CSV ----
    with s.expect_download() as dl:
        s.click("#outlookCsv")
    kontrol("Outlook CSV dosya adı", dl.value.suggested_filename == "rehber_outlook.csv", dl.value.suggested_filename)
    ham = open(dl.value.path(), "rb").read()
    kontrol("Outlook CSV UTF-8 BOM", ham.startswith(b"\xef\xbb\xbf"))
    rows = list(csv.reader(io.StringIO(ham.decode("utf-8-sig"))))
    kontrol("Outlook CSV her satırda aynı sütun sayısı", len({len(r) for r in rows}) == 1 and len(rows) == 4, [len(r) for r in rows])
    h = {k: i for i, k in enumerate(rows[0])}
    r = rows[1]
    kontrol("Outlook: ad/soyad ayrımı", (r[h["First Name"]], r[h["Last Name"]]) == ("Ayşe Çağlar", "Öztürk"), r[:2])
    kontrol("Outlook: kurum yolu Company/Department", (r[h["Company"]], r[h["Department"]]) == ("Test A.Ş.", "Ar-Ge / Yazılım"), (r[h["Company"]], r[h["Department"]]))
    kontrol("Outlook: virgül ve tırnaklı alan doğru kaçışlı", r[h["Job Title"]] == "Mühendis, Kıdemli" and r[h["Business Street"]] == 'Gül Sk. "No:1"\nÇankaya', (r[h["Job Title"]], r[h["Business Street"]]))
    kontrol("Outlook: telefonlar +90 ve dahili Business Phone 2", (r[h["Mobile Phone"]], r[h["Business Phone"]], r[h["Business Phone 2"]]) == ("+905321112233", "+903125550000", "4101"))
    kontrol("Outlook: doğum tarihi gg.aa.yyyy", r[h["Birthday"]] == "05.03.1990", r[h["Birthday"]])
    kontrol("Outlook: formül enjeksiyonu etkisiz (=cmd)", r[h["Notes"]] == "'=cmd|calc", r[h["Notes"]])
    kontrol("Outlook: ikinci e-posta, takma ad, grup", (r[h["E-mail 2 Address"]], r[h["Nickname"]], r[h["Categories"]]) == ("b@o.com", "Aşo", "GRUP-A"))
    s.select_option("#csvTarih", "aa/gg/yyyy")
    with s.expect_download() as dl:
        s.click("#outlookCsv")
    rows = list(csv.reader(io.StringIO(open(dl.value.path(), "rb").read().decode("utf-8-sig"))))
    kontrol("Outlook: tarih biçimi seçilebilir (aa/gg/yyyy)", rows[1][h["Birthday"]] == "03/05/1990", rows[1][h["Birthday"]])
    # alan kapatma CSV'ye de uygulanır
    s.uncheck('[data-dahil="bday"]'); s.uncheck('[data-dahil="addr"]')
    with s.expect_download() as dl:
        s.click("#outlookCsv")
    rows = list(csv.reader(io.StringIO(open(dl.value.path(), "rb").read().decode("utf-8-sig"))))
    kontrol("rehbere yazılacak alan seçimi CSV'de de geçerli", rows[1][h["Birthday"]] == "" and rows[1][h["Business Street"]] == "")
    s.check('[data-dahil="bday"]'); s.check('[data-dahil="addr"]')

    # ---- Google CSV ----
    with s.expect_download() as dl:
        s.click("#googleCsv")
    kontrol("Google CSV dosya adı", dl.value.suggested_filename == "rehber_google.csv")
    rows = list(csv.reader(io.StringIO(open(dl.value.path(), "rb").read().decode("utf-8-sig"))))
    kontrol("Google CSV her satırda aynı sütun sayısı", len({len(r) for r in rows}) == 1 and len(rows) == 4, [len(r) for r in rows])
    g = {k: i for i, k in enumerate(rows[0])}
    r = rows[1]
    kontrol("Google: ad, kurum, unvan, doğum (yyyy-aa-gg)", (r[g["First Name"]], r[g["Last Name"]], r[g["Organization Name"]], r[g["Organization Department"]], r[g["Birthday"]]) == ("Ayşe Çağlar", "Öztürk", "Test A.Ş.", "Ar-Ge / Yazılım", "1990-03-05"), r[:8])
    kontrol("Google: telefonlar etiketli", (r[g["Phone 1 - Label"]], r[g["Phone 1 - Value"]], r[g["Phone 2 - Label"]], r[g["Phone 3 - Label"]], r[g["Phone 3 - Value"]]) == ("Mobile", "+905321112233", "Work", "Work Extension", "4101"))
    kontrol("Google: etiket (Labels) ve e-postalar", (r[g["Labels"]], r[g["E-mail 1 - Value"]], r[g["E-mail 2 - Value"]]) == ("GRUP-A", "a@o.com", "b@o.com"))
    # grup kapsamı
    s.select_option("#grupSec", "GRUP-B")
    with s.expect_download() as dl:
        s.click("#googleCsv")
    rows = list(csv.reader(io.StringIO(open(dl.value.path(), "rb").read().decode("utf-8-sig"))))
    kontrol("CSV seçili grup kapsamında", len(rows) == 2 and rows[1][0] == "Ali", rows)
    s.select_option("#grupSec", "*")

    # ---- QR: gerçekten okunuyor mu? ----
    s.click('#tbl tbody tr:first-child button[data-qr]')
    kontrol("QR penceresi açıldı", s.is_visible("#qrDlg") and s.inner_text("#qrBaslik") == "Ayşe Çağlar Öztürk")
    png = s.evaluate("document.getElementById('qrCanvas').toDataURL('image/png')").split(",")[1]
    img = cv2.imdecode(np.frombuffer(base64.b64decode(png), np.uint8), cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
    metin, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
    kontrol("QR okundu (OpenCV): BEGIN:VCARD / VERSION:3.0", metin.startswith("BEGIN:VCARD") and "VERSION:3.0" in metin, repr(metin[:60]))
    kontrol("QR içeriği: Türkçe ad ve +90 telefon", "Ayşe Çağlar Öztürk" in metin and "+905321112233" in metin, repr(metin[:300]))
    kontrol("QR fotoğrafsız", "PHOTO" not in metin)
    kontrol("QR bilgi satırı bayt sayısını gösteriyor", "bayt" in s.inner_text("#qrBilgi"))
    s.click("#qrKapat")
    kontrol("QR penceresi kapandı", not s.is_visible("#qrDlg"))
    # PNG indirme
    s.click('#tbl tbody tr:first-child button[data-qr]')
    with s.expect_download() as dl:
        s.click("#qrDl")
    kontrol("QR PNG indirildi", dl.value.suggested_filename.endswith("_qr.png"), dl.value.suggested_filename)
    s.click("#qrKapat")
    # çok uzun kayıt: anlaşılır uyarı
    s.evaluate("VCARD.D.satirlar[1].note='x'.repeat(4000)")
    s.click('#tbl tbody tr:nth-child(2) button[data-qr]')
    kontrol("QR'a sığmayan kayıt anlaşılır uyarı verir", "sığmıyor" in s.inner_text("#qrBilgi") and s.is_disabled("#qrDl"), s.inner_text("#qrBilgi"))
    s.click("#qrKapat")
    s.evaluate("VCARD.D.satirlar[1].note=''")

    # ---- Yazdırılabilir rehber ----
    s.evaluate("VCARD.yazdirHazirla()")
    s.emulate_media(media="print")
    kontrol("yazdırma stilinde ana arayüz gizli, rehber görünür", s.evaluate("getComputedStyle(document.querySelector('main')).display") == "none" and s.evaluate("getComputedStyle(document.getElementById('yazdirAlani')).display") == "block")
    kontrol("yazdırılabilir rehber: 2 grup başlığı, 3 kişi", s.locator("#yazdirAlani h2").count() == 2 and s.locator("#yazdirAlani tbody tr").count() == 3)
    txt = s.inner_text("#yazdirAlani")
    kontrol("yazdırılabilir rehber: telefon/dahili/e-posta", "Mobil: +905321112233" in txt and "Dahili: 4101" in txt and "a@o.com" in txt, txt[:400])
    pdf = s.pdf()
    kontrol("PDF üretilebiliyor", pdf[:4] == b"%PDF" and len(pdf) > 1500, len(pdf))
    s.emulate_media(media="screen")
    kontrol("ekranda yazdırma alanı gizli", s.evaluate("getComputedStyle(document.getElementById('yazdirAlani')).display") == "none")
bitir()
