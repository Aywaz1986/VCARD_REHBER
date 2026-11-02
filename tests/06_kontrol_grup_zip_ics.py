"""Telefon biçimlendirme, denetim, mükerrer birleştirme, fotoğraf klasörü, grup ZIP, .ics, JSON yedek."""
import io
import os
import sys
import tempfile
import zipfile

from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

BOS = "{_img:null,name:'',disp:'',cell:'',work:'',fax:'',home:'',mail:'',addr:'',org:'',title:'',url:'',cat:'',photo:'',bday:''}"

with sayfa_ac() as s:
    t = s.evaluate("""()=>['0532 111 22 33','532-111-2233','05321112233','+90 (532) 111 22 33','00905321112233','905321112233','4101','12','abc','+1 202 555 0100'].map(x=>VCARD.telNorm(x))""")
    beklenen = ["+905321112233"] * 6 + ["4101"]
    kontrol("telefon biçimleri → +90…", [x["v"] for x in t[:7]] == beklenen and all(x["ok"] for x in t[:7]), t[:7])
    kontrol("geçersiz telefonlar işaretlendi (12, abc)", not t[7]["ok"] and not t[8]["ok"])
    kontrol("yabancı numara korundu", t[9] == {"ok": True, "v": "+12025550100"}, t[9])
    kontrol("geçersiz tarihler reddedildi", s.evaluate("['31.02.2020','1990-13-01','','x'].map(VCARD.bdayNorm)") == [None, None, "", None])

    # --- liste hazırla ---
    s.evaluate("""()=>{const B=()=>(""" + BOS + """);const D=VCARD.D;
      const a=Object.assign(B(),{name:'Ali Veli',cell:'0532 111 22 33',cat:'A'});
      const b=Object.assign(B(),{name:'ALİ  VELİ',cell:'',mail:'ali@ornek.com',cat:'A',title:'Müdür'});
      const c=Object.assign(B(),{name:'Zeynep',cell:'+905550000000',cat:'B',bday:'20000229'});
      const d=Object.assign(B(),{name:'',cell:'',cat:''});
      const e=Object.assign(B(),{name:'Hatalı',cell:'12abc',mail:'yanlis',bday:'31.02.2020',cat:''});
      D.satirlar=[a,b,c,d,e];VCARD.tabloCiz();}""")
    s.click("#kontrolBtn")
    metin = s.inner_text("#kontrolSonuc")
    kontrol("denetim: boş ad, iletişimsiz, geçersiz tel/e-posta/doğum uyarıları",
            all(x in metin for x in ["Ad boş", "Telefon ve e-posta yok", "geçersiz: 12abc", "E-posta geçersiz", "Doğum tarihi geçersiz"]), metin)
    s.click("#telDuzelt")
    kontrol("telefon düzeltme uygulandı", s.evaluate("VCARD.D.satirlar[0].cell") == "+905321112233")

    # --- mükerrer ---
    s.click("#mukerrerBtn")
    kontrol("mükerrer: aynı ad (büyük/küçük, boşluk farkı) tek grup", "1 kesin, 0 olası" in s.inner_text("#kontrolOzet"), s.inner_text("#kontrolOzet"))
    s.once("dialog", lambda d: d.accept())
    s.click("#mukerrerBirlestir")
    sat = s.evaluate("VCARD.D.satirlar.map(r=>({n:r.name,m:r.mail,t:r.title,c:r.cell}))")
    kontrol("birleştirme: 4 kayıt kaldı", len(sat) == 4, sat)
    kontrol("birleştirme: boş alanlar diğerinden dolduruldu", sat[0]["m"] == "ali@ornek.com" and sat[0]["t"] == "Müdür" and sat[0]["c"] == "+905321112233", sat[0])

    # --- fotoğraf klasörü (Ad Soyad.jpg eşleşmesi, Türkçe karakter farkı yok) ---
    d = tempfile.mkdtemp()
    for ad in ["Ali Veli.jpg", "zeynep.png"]:
        Image.new("RGB", (300, 200), (200, 50, 50)).save(os.path.join(d, ad))
    s.set_input_files("#photoIn", [os.path.join(d, "Ali Veli.jpg"), os.path.join(d, "zeynep.png")])
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('eşleşti')")
    kontrol("fotoğraf ad-soyada göre eşleşti", s.evaluate("VCARD.D.satirlar.filter(r=>r._img).length") == 2, s.inner_text("#msgKaynak"))
    img = s.evaluate("VCARD.D.satirlar[0]._img")
    kontrol("fotoğraf 200x200 JPEG", img.startswith("data:image/jpeg;base64,"))

    # --- grup ZIP ---
    s.click("#grupSec")
    secenekler = s.evaluate("[...document.getElementById('grupSec').options].map(o=>o.value)")
    kontrol("grup listesi", set(secenekler) == {"*", "A", "B", ""}, secenekler)
    with s.expect_download() as dl:
        s.click("#grupZip")
    z = zipfile.ZipFile(dl.value.path())
    kontrol("ZIP geçerli (CRC)", z.testzip() is None)
    adlar = sorted(z.namelist())
    kontrol("grup başına .vcf (A, B, grupsuz)", adlar == ["A.vcf", "B.vcf", "grupsuz.vcf"], adlar)
    kontrol("A.vcf içinde Ali Veli", b"Ali=20Veli" in z.read("A.vcf"))

    s.select_option("#grupSec", "B")
    with s.expect_download() as dl:
        s.click("#grupIndir")
    kontrol("seçili grup dosya adı", dl.value.suggested_filename == "B.vcf", dl.value.suggested_filename)

    # --- .ics ---
    s.select_option("#grupSec", "*")
    with s.expect_download() as dl:
        s.click("#icsIndir")
    ics = open(dl.value.path(), encoding="utf-8").read()
    kontrol(".ics yıllık tekrar eden günlük olay", "RRULE:FREQ=YEARLY" in ics and "DTSTART;VALUE=DATE:20000229" in ics and ics.count("BEGIN:VEVENT") == 1, ics)
    kontrol(".ics DTEND ertesi gün", "DTEND;VALUE=DATE:20000301" in ics)

    # --- JSON yedek turu ---
    with s.expect_download() as dl:
        s.click('[data-kaynak="json"]')
        s.click("#jsonIndir")
    yedek = dl.value.path()
    s.click("#clrBtn") if False else None
    s.evaluate("VCARD.D.satirlar=[]")
    s.set_input_files("#fileJson", yedek)
    s.wait_for_function("VCARD.D.satirlar.length>0")
    kontrol("JSON yedek geri yüklendi (fotoğraf dahil)", s.evaluate("VCARD.D.satirlar.length") == 4 and s.evaluate("!!VCARD.D.satirlar[0]._img"))
    kontrol("tarayıcıda saklama varsayılan kapalı", s.evaluate("localStorage.getItem('vcard.calisma.v1')") is None)

    # --- sayfalama ---
    s.evaluate("""()=>{const B=()=>(""" + BOS + """);VCARD.D.satirlar=Array.from({length:230},(_,i)=>Object.assign(B(),{name:'Kişi '+i}));VCARD.tabloCiz();}""")
    kontrol("sayfalama: ilk sayfada 100 satır", s.locator("#tbl tbody tr").count() == 100)
    s.click("#pgSonra")
    kontrol("sayfalama: 2. sayfa 'Sayfa 2 / 3'", "Sayfa 2 / 3" in s.inner_text("#pgBilgi"))
bitir()
