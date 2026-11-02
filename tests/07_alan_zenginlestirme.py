"""v2.1 alan ve biçim zenginleştirme: yeni alanlar, dahili modları, bileşenli ORG, yapılandırılmış adres, görünen ad şablonu, Excel 20 sütun."""
import datetime
import os
import sys
import tempfile

import openpyxl

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

JS = """
([v,opt])=>{
  const r={_img:null,name:'Ayşe Öztürk',disp:'',cell:'0532 111 22 33',work:'03125550000',fax:'',home:'',mail:'a@b.co',mail2:'ikinci@b.co',
    addr:'Gül Sk. No:1; D:2',city:'Çankaya / Ankara',zip:'06680',org:'Test A.Ş. > Ar-Ge Müdürlüğü > Yazılım Birimi',title:'Mühendis',
    url:'',cat:'GRUP',photo:'',bday:'19900101',ext:'4101',nick:'Aşo',note:'Sicil: 1001\\nNot; virgül, test'};
  const o=Object.assign({bosAtla:true,fnYedek:true,ayir:false,tel:true,dahil:{},dahiliMod:'ayri',orgBilesen:true,dispSablon:''},opt||{});
  const u=VCARD.vcfUret([r],v,o);
  return {metin:u.metin,geri:VCARD.vcfOku(u.metin)[0],sorun:VCARD.vcfDogrula([r],u.metin,o).sorun};
}
"""

with sayfa_ac() as s:
    for v in ("2.1", "3.0", "4.0"):
        print("-- vCard", v)
        x = s.evaluate(JS, [v, {}])
        g = x["geri"]
        kontrol(v + " kendini sınama farksız (yeni alanlar dahil)", not x["sorun"], x["sorun"])
        kontrol(v + " ikinci e-posta/takma ad/not turu", (g["mail2"], g["nick"], g["note"]) == ("ikinci@b.co", "Aşo", "Sicil: 1001\nNot; virgül, test"), (g["mail2"], g["nick"], g["note"]))
        kontrol(v + " yapılandırılmış adres (sokak/şehir/posta) turu", (g["addr"], g["city"], g["zip"]) == ("Gül Sk. No:1; D:2", "Çankaya / Ankara", "06680"), (g["addr"], g["city"], g["zip"]))
        kontrol(v + " ORG bileşenli yol turu", g["org"] == "Test A.Ş. > Ar-Ge Müdürlüğü > Yazılım Birimi", g["org"])
        kontrol(v + " dahili ayrı iş numarası turu", (g["work"], g["ext"]) == ("+903125550000", "4101"), (g["work"], g["ext"]))
        m = x["metin"].replace("\r\n ", "")
        kontrol(v + " NICKNAME/NOTE satırı", "NICKNAME" in m and "NOTE" in m)
        if v != "2.1":
            kontrol(v + " ORG ';' ile bileşenli", "ORG:Test A.Ş.;Ar-Ge Müdürlüğü;Yazılım Birimi" in m, [l for l in m.split("\r\n") if l.startswith("ORG")])

    # dahili: ana numaraya ekle
    x = s.evaluate(JS, ["3.0", {"dahiliMod": "ekle"}])
    kontrol("dahili 'ekle': TEL:+903125550000,4101", "TEL;TYPE=WORK:+903125550000,4101" in x["metin"], x["metin"][:400])
    kontrol("dahili 'ekle': geri okumada ana numara + dahili ayrışır", (x["geri"]["work"], x["geri"]["ext"]) == ("+903125550000", "4101") and not x["sorun"], (x["geri"]["work"], x["geri"]["ext"], x["sorun"]))
    # ORG bileşenli kapalı
    x = s.evaluate(JS, ["3.0", {"orgBilesen": False}])
    kontrol("ORG bileşenli kapalıyken tek bileşen (> korunur)", "ORG:Test A.Ş. > Ar-Ge Müdürlüğü > Yazılım Birimi" in x["metin"].replace("\r\n ", ""), [l for l in x["metin"].split("\r\n") if l.startswith("ORG")])
    # alan kapatma
    x = s.evaluate(JS, ["3.0", {"dahil": {"note": False, "city": False, "zip": False, "mail2": False}}])
    kontrol("kapatılan yeni alanlar yazılmıyor", "NOTE" not in x["metin"] and "ikinci@b.co" not in x["metin"] and "Ankara" not in x["metin"] and "06680" not in x["metin"])
    # görünen ad şablonu
    x = s.evaluate(JS, ["3.0", {"dispSablon": "{name} ({org})"}])
    kontrol("görünen ad şablonu", "FN:Ayşe Öztürk (Test A.Ş. > Ar-Ge Müdürlüğü > Yazılım Birimi)" in x["metin"].replace("\r\n ", ""), [l for l in x["metin"].split("\r\n") if l.startswith("FN")])
    t = s.evaluate("""()=>VCARD.vcfUret([{_img:null,name:'Ali Veli',disp:'',cell:'',work:'',fax:'',home:'',mail:'',mail2:'',addr:'',city:'',zip:'',org:'',title:'',url:'',cat:'',photo:'',bday:'',ext:'',nick:'',note:''}],'3.0',
      {bosAtla:true,fnYedek:true,ayir:false,tel:true,dahil:{},dahiliMod:'ayri',orgBilesen:false,dispSablon:'{name} ({org})'}).metin""")
    kontrol("şablonda boş alan parantezi temizlenir", "FN:Ali Veli\r\n" in t, t)
    # ana numara yok: dahili tek başına
    x = s.evaluate(JS, ["2.1", {}])
    y = s.evaluate("""()=>{const r={_img:null,name:'Dahili Kişi',disp:'',cell:'',work:'',fax:'',home:'',mail:'',mail2:'',addr:'',city:'',zip:'',org:'',title:'',url:'',cat:'',photo:'',bday:'',ext:'4102',nick:'',note:''};
      const o={bosAtla:true,fnYedek:true,ayir:false,tel:true,dahil:{},dahiliMod:'ayri',orgBilesen:false,dispSablon:''};
      const u=VCARD.vcfUret([r],'3.0',o);return {g:VCARD.vcfOku(u.metin)[0],s:VCARD.vcfDogrula([r],u.metin,o).sorun}}""")
    kontrol("ana numara yoksa dahili tek başına iş numarası", y["g"]["work"] == "4102" and not y["s"], y)

# Excel: 20 sütunlu şablon ve eski 14 sütunlu dosya birlikte çalışır
d = tempfile.mkdtemp()
yeni = os.path.join(d, "yeni.xlsx")
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Liste"
ws.append(["h"] * 20)
ws.append(["Yeni Kişi", None, None, None, None, None, "y@o.com", None, "Firma > Birim", None, None, None, None, datetime.datetime(1991, 2, 3), "iki@o.com", "4105", "Tak", "Not", "İzmir", "35000"])
wb.save(yeni)
eski = os.path.join(d, "eski.xlsx")
wb = openpyxl.Workbook(); ws = wb.active; ws.title = "Liste"
ws.append(["h"] * 14)
ws.append(["Eski Kişi", None, "05321112233", None, None, None, None, None, None, None, None, None, None, None])
wb.save(eski)
with sayfa_ac() as s:
    s.set_input_files("#fileExcel", yeni)
    s.wait_for_function("VCARD.D.satirlar.length===1")
    r = s.evaluate("VCARD.D.satirlar[0]")
    kontrol("Excel 15-20. sütunlar okundu", (r["mail2"], r["ext"], r["nick"], r["note"], r["city"], r["zip"]) == ("iki@o.com", "4105", "Tak", "Not", "İzmir", "35000"), r)
    s.set_input_files("#fileExcel", eski)
    s.wait_for_function("VCARD.D.satirlar.length===1 && VCARD.D.satirlar[0].name==='Eski Kişi'")
    r = s.evaluate("VCARD.D.satirlar[0]")
    kontrol("eski 14 sütunlu dosya geriye dönük uyumlu", r["cell"] == "05321112233" and r["mail2"] == "" and r["ext"] == "", r)
    kontrol("tabloda yeni sütun başlıkları", s.locator("#tbl thead th").count() == 22)  # # + 20 alan + işlem
bitir()
