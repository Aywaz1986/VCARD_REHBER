"""2.1 / 3.0 / 4.0 üretimi ve geri okuma turu (fotoğraf, katlama, QP)."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

JS = """
(v)=>{
  const r=(o)=>Object.assign({_img:null,name:'',disp:'',cell:'',work:'',fax:'',home:'',mail:'',addr:'',org:'',title:'',url:'',cat:'',photo:'',bday:''},o);
  const img='data:image/jpeg;base64,'+'/9j/4AAQSkZJRgABAQ'.repeat(40);
  const sat=[r({name:'Şule Ğ. İpek',cell:'+905321234567',mail:'a@b.co',addr:'Sok, No:1; Daire 2\\nAnkara',org:'Firma; Bölge',title:'Müdür',cat:'A,B',bday:'19990101',_img:img}),
             r({name:'Kısa Ad',work:'1234'})];
  const o={bosAtla:true,fnYedek:true,ayir:false,tel:true,dahil:{}};
  const u=VCARD.vcfUret(sat,v,o);
  const d=VCARD.vcfDogrula(sat,u.metin,o);
  const geri=VCARD.vcfOku(u.metin);
  return {metin:u.metin,kart:u.kart,sorun:d.sorun,geri};
}
"""

with sayfa_ac() as s:
    for v in ("2.1", "3.0", "4.0"):
        print("-- vCard", v)
        x = s.evaluate(JS, v)
        m = x["metin"]
        kontrol(v + " 2 kart", x["kart"] == 2)
        kontrol(v + " VERSION", ("VERSION:" + v + "\r\n") in m)
        kontrol(v + " geri okuma farksız", not x["sorun"], x["sorun"])
        g = x["geri"][0]
        kontrol(v + " ad turu", g["name"] == "Şule Ğ. İpek", g["name"])
        kontrol(v + " adres turu (virgül, noktalı virgül, satır sonu)", g["addr"] == "Sok, No:1; Daire 2\nAnkara", repr(g["addr"]))
        kontrol(v + " kurum/grup turu", g["title"] == "Müdür" and g["cat"] == "A,B", (g["title"], g["cat"]))
        kontrol(v + " BDAY turu", g["bday"] == "19990101", g["bday"])
        kontrol(v + " fotoğraf turu", (g["_img"] or "").startswith("data:image/jpeg;base64,/9j/"))
        kontrol(v + " dahili numara +90'a çevrilmedi", x["geri"][1]["work"] == "1234", x["geri"][1]["work"])
        if v != "2.1":
            kontrol(v + " satırlar 75 karakteri aşmıyor (katlama)", all(len(l) <= 76 for l in m.split("\r\n")), max(len(l) for l in m.split("\r\n")))
        else:
            kontrol("2.1 PHOTO sonrası boş satır", "\r\n\r\nEND:VCARD" in m)
            kontrol("2.1 N alanı QP", "N;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:;" in m)
        if v == "4.0":
            kontrol("4.0 PHOTO data URI", "PHOTO:data:image/jpeg;base64," in m.replace("\r\n ", ""))
            kontrol("4.0 TEL TYPE=cell", "TEL;TYPE=cell:+905321234567" in m)
    # ad/soyad ayırma
    x = s.evaluate("""()=>{const r={_img:null,name:'Ali Can Yılmaz',disp:'',cell:'',work:'',fax:'',home:'',mail:'',addr:'',org:'',title:'',url:'',cat:'',photo:'',bday:''};
      return VCARD.vcfUret([r],'3.0',{bosAtla:true,fnYedek:true,ayir:true,tel:true,dahil:{}}).metin}""")
    kontrol("ad/soyad ayırma (N:Yılmaz;Ali Can)", "N:Yılmaz;Ali Can;;;" in x, x)
    kontrol("FN yedek: Görünen Ad boşsa Ad Soyad", "FN:Ali Can Yılmaz" in x)
bitir()
