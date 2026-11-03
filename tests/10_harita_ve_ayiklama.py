"""v2.2: adres -> Google Haritalar bağlantısı (vCard, QR, 📍 düğmesi) ve yüklerken otomatik mükerrer ayıklama (CSV/Excel/vcf, geri al)."""
import os
import sys
import tempfile
import urllib.parse

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

BOS = "{_img:null,name:'',disp:'',cell:'',work:'',fax:'',home:'',mail:'',mail2:'',addr:'',city:'',zip:'',org:'',title:'',url:'',cat:'',photo:'',bday:'',ext:'',nick:'',note:''}"
ON = "https://www.google.com/maps/search/?api=1&query="

with sayfa_ac() as s:
    # ---- harita bağlantısı ----
    u = s.evaluate("VCARD.haritaBaglantisi('Gül Sk. No:1\\nÇankaya','Ankara','06680')")
    kontrol("bağlantı adresi doğru kodluyor", u == ON + urllib.parse.quote("Gül Sk. No:1, Çankaya, Ankara, 06680", safe=""), u)
    kontrol("adres ve şehir yoksa bağlantı yok", s.evaluate("VCARD.haritaBaglantisi('','','06680')") == "")

    JS = """([v,opt])=>{const r=Object.assign(""" + BOS + """,{name:'Ayşe Öztürk',cell:'05321112233',addr:'Gül Sk. No:1',city:'Ankara',url:'https://ornek.com'});
      const o=Object.assign({bosAtla:true,fnYedek:true,ayir:false,tel:true,dahil:{},dahiliMod:'ayri',orgBilesen:false,dispSablon:'',harita:true},opt||{});
      const u=VCARD.vcfUret([r],v,o);return {m:u.metin.replace(/\\r\\n /g,''),geri:VCARD.vcfOku(u.metin)[0],sorun:VCARD.vcfDogrula([r],u.metin,o).sorun}}"""
    for v in ("2.1", "3.0", "4.0"):
        x = s.evaluate(JS, [v, {}])
        kontrol(v + " vCard'da harita bağlantısı var", "URL:" + ON in x["m"], x["m"][-300:])
        kontrol(v + " web sitesi korunur, harita bağlantısı web sitesi sanılmaz (geri okuma)", x["geri"]["url"] == "https://ornek.com" and not x["sorun"], (x["geri"]["url"], x["sorun"]))
    x = s.evaluate(JS, ["3.0", {"harita": False}])
    kontrol("seçenek kapalıyken bağlantı yok", "google.com/maps" not in x["m"])
    x = s.evaluate(JS, ["3.0", {"dahil": {"addr": False, "city": False}}])
    kontrol("adres alanları rehberden çıkarılınca bağlantı da yok", "google.com/maps" not in x["m"])
    x = s.evaluate("""()=>{const r=Object.assign(""" + BOS + """,{name:'Yalnız Ad',cell:'5321112233'});
      return VCARD.vcfUret([r],'3.0',{bosAtla:true,fnYedek:true,tel:true,dahil:{},harita:true}).metin}""")
    kontrol("adresi olmayan kişide bağlantı yok", "maps" not in x)
    kontrol("onay kutusu varsayılan açık", s.is_checked("#optHarita"))

    # arayüz: 📍 düğmesi yeni sekmede Google Haritalar açar
    s.evaluate("""()=>{VCARD.D.satirlar=[Object.assign(""" + BOS + """,{name:'A',addr:'Gül Sk. No:1',city:'Ankara'}),Object.assign(""" + BOS + """,{name:'B'})];VCARD.tabloCiz();}""")
    kontrol("adresi olmayan satırda 📍 pasif", s.is_disabled('#tbl tbody tr:nth-child(2) button[data-harita]') and not s.is_disabled('#tbl tbody tr:nth-child(1) button[data-harita]'))
    s.context.route("https://www.google.com/**", lambda r: r.fulfill(status=200, body="harita"))
    with s.context.expect_page() as yeni:
        s.click('#tbl tbody tr:nth-child(1) button[data-harita]')
    kontrol("📍 Google Haritalar'ı yeni sekmede açar", yeni.value.url.startswith(ON) and "Ankara" in urllib.parse.unquote(yeni.value.url), yeni.value.url)
    yeni.value.close()

    # QR içinde de harita bağlantısı var
    kontrol("QR içeriğine de eklenir", "google.com/maps/search" in s.evaluate("VCARD.qrVcfMetni(VCARD.D.satirlar[0])").replace("\r\n ", ""))

    # ---- CSV yükleyince mükerrer ayıklama ----
    d = tempfile.mkdtemp()
    yol = os.path.join(d, "rehber.csv")
    satirlar = [
        "Adı Soyadı,Görünen Ad,Mobil,İş,Fax,Ev,Mail,Adres,Firma,Unvan,Web,Grup,Foto,BDAY",
        "Ali Yılmaz,,0532 111 22 33,,,,ali@o.com,,,,,A,,",
        "ALİ  YILMAZ,,+905321112233,,,,,Gül Sk. 1,,Mühendis,,,,",       # aynı kişi (aynı tel, boşlukları farklı)
        "Ali Yılmaz,,,,,,,,,,,,,",                                       # aynı kişi, telefonsuz
        "Ali Yılmaz,,0555 000 00 00,,,,,,,,,,,",                         # aynı ad, FARKLI telefon -> ayrı kişi
        "Veli Kaya,,0544 111 11 11,,,,,,,,,,,",
        "Veli Kaya,,0544 111 11 11,,,,,,,,,,,",                          # birebir tekrar
        "Ayşe Demir,,0533 222 22 22,,,,,,,,,,,",
        "Fatma Demir,,0533 222 22 22,,,,,,,,,,,",                        # aynı telefon, farklı kişi -> birleştirilmez
        "Zeynep Ak,,,,,,z@o.com,,,,,,,",
        "Zeynep Ak,,,,,,baska@o.com,,,,,,,",                             # aynı ad, farklı e-posta -> ayrı kişi
    ]
    open(yol, "w", encoding="utf-8-sig").write("\n".join(satirlar) + "\n")
    kontrol("ayıklama onay kutusu varsayılan açık", s.is_checked("#optAyikla"))
    s.set_input_files("#fileExcel", yol)
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('okundu')")
    ad = s.evaluate("VCARD.D.satirlar.map(r=>r.name+'|'+r.cell)")
    msg = s.inner_text("#msgKaynak")
    kontrol("CSV: 10 satır okundu, mükerrerler ayıklandı → 7 kişi kaldı", len(ad) == 7, ad)
    kontrol("CSV: aynı kişinin 3 kaydı tek kayıtta birleşti, boş alanlar dolduruldu", s.evaluate("(()=>{const a=VCARD.D.satirlar.find(r=>r.cell==='0532 111 22 33'||r.cell.includes('532'));return [a.mail,a.addr,a.title,a.cat]})()") == ["ali@o.com", "Gül Sk. 1", "Mühendis", "A"], s.evaluate("VCARD.D.satirlar.slice(0,2)"))
    kontrol("CSV: aynı adlı ama farklı telefonlu kişi ayrı kaldı", sum(1 for x in ad if x.startswith("Ali Yılmaz")) == 2, ad)
    kontrol("CSV: aynı telefonlu farklı kişiler (Ayşe/Fatma) birleşmedi", any(x.startswith("Ayşe Demir") for x in ad) and any(x.startswith("Fatma Demir") for x in ad), ad)
    kontrol("CSV: aynı ad, farklı e-posta ayrı kaldı", sum(1 for x in ad if x.startswith("Zeynep Ak")) == 2, ad)
    kontrol("CSV: birebir tekrar tek kayda indi", sum(1 for x in ad if x.startswith("Veli Kaya")) == 1, ad)
    kontrol("mesaj ayıklanan sayıyı ve ayrı bırakılanı söylüyor", "3 mükerrer kayıt ayıklandı" in msg and "ayrı bırakıldı" in msg, msg)
    kontrol("'Ayıklamayı geri al' düğmesi göründü", s.is_visible("#mukGeriAl"))
    s.click("#mukGeriAl")
    kontrol("geri al: 10 kayıt geri geldi", s.evaluate("VCARD.D.satirlar.length") == 10 and not s.is_visible("#mukGeriAl"), s.evaluate("VCARD.D.satirlar.length"))

    # kutu kapalıyken ayıklanmaz
    s.uncheck("#optAyikla")
    s.set_input_files("#fileExcel", yol)
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('10 kişi okundu')")
    kontrol("ayıklama kapalıyken 10 kayıt aynen kalır", s.evaluate("VCARD.D.satirlar.length") == 10 and "ayıklandı" not in s.inner_text("#msgKaynak"))
    s.check("#optAyikla")

    # 'sona ekle' modunda aynı dosya ikinci kez yüklenince tekrarlar ayıklanır
    s.select_option("#yukleMod", "ekle")
    s.set_input_files("#fileExcel", yol)
    s.wait_for_function("document.getElementById('msgKaynak').textContent.includes('okundu')")
    kontrol("'sona ekle' + aynı dosya: liste büyümez (7 kişi)", s.evaluate("VCARD.D.satirlar.length") == 7, s.evaluate("VCARD.D.satirlar.length"))
bitir()
