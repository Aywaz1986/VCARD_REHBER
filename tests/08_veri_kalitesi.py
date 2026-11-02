"""v2.1 veri kalitesi: ad biçimi (Türkçe i/İ), boşluk, e-posta, unvan sözlüğü, önizlemeli toplu düzeltme, benzer ad mükerrer."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

BOS = "{_img:null,name:'',disp:'',cell:'',work:'',fax:'',home:'',mail:'',mail2:'',addr:'',city:'',zip:'',org:'',title:'',url:'',cat:'',photo:'',bday:'',ext:'',nick:'',note:''}"

with sayfa_ac() as s:
    ab = lambda x, m: s.evaluate("([x,m])=>VCARD.adBicimle(x,m)", [x, m])
    kontrol("ad biçimi 'ilk': ayşe çağlar ÖZTÜRK", ab("ayşe çağlar ÖZTÜRK", "ilk") == "Ayşe Çağlar Öztürk", ab("ayşe çağlar ÖZTÜRK", "ilk"))
    kontrol("ad biçimi 'ilk': Türkçe İ/ı (iBRAHİM ılgaz)", ab("iBRAHİM ılgaz", "ilk") == "İbrahim Ilgaz", ab("iBRAHİM ılgaz", "ilk"))
    kontrol("ad biçimi 'soyad': Murat ÜNAL", ab("murat ünal", "soyad") == "Murat ÜNAL", ab("murat ünal", "soyad"))
    kontrol("ad biçimi 'soyad': tek sözcükte büyütme yok", ab("sezen", "soyad") == "Sezen", ab("sezen", "soyad"))
    kontrol("ad biçimi 'buyuk': AYŞE İNCİ", ab("ayşe inci", "buyuk") == "AYŞE İNCİ", ab("ayşe inci", "buyuk"))
    kontrol("ad biçimi: tire/kesme korunur", ab("ali-can o'neil", "ilk") == "Ali-Can O'Neil", ab("ali-can o'neil", "ilk"))
    kontrol("ad biçimi 'yok' dokunmaz", ab("aLi veLi", "yok") == "aLi veLi")

    kontrol("boşluk: NBSP, sıfır genişlik, çift boşluk", s.evaluate("VCARD.bosluklariTemizle('  Ali  Ve​li  ')") == "Ali Veli")
    kontrol("e-posta: büyük harf, mailto, sondaki ;", s.evaluate("[' Ali@Ornek.COM; ','mailto:X@Y.com'].map(VCARD.epostaTemizle)") == ["ali@ornek.com", "x@y.com"])
    sz = s.evaluate("""()=>{const k=VCARD.sozlukAyristir('# yorum\\nMuh.=Mühendis\\nUz=Uzman\\nbaş tekn.=Baş Teknisyen\\nbozuk satır');
      return [k.length,VCARD.sozlukUygula('Baş Muh. Uzman Uz',k),VCARD.sozlukUygula('BAŞ TEKN. Ali',k),VCARD.sozlukUygula('Muhasebe',k)]}""")
    kontrol("sözlük: 3 geçerli kural (yorum ve bozuk satır atlanır)", sz[0] == 3, sz)
    kontrol("sözlük: tüm sözcük eşleşir ('Uzman' bozulmaz)", sz[1] == "Baş Mühendis Uzman Uzman", sz[1])
    kontrol("sözlük: büyük/küçük harf duyarsız, çok sözcüklü", sz[2] == "Baş Teknisyen Ali", sz[2])
    kontrol("sözlük: sözcük içi eşleşme yok", sz[3] == "Muhasebe", sz[3])

    # --- önizlemeli toplu düzeltme (arayüz) ---
    s.evaluate("""()=>{const B=()=>(""" + BOS + """);const D=VCARD.D;
      D.satirlar=[Object.assign(B(),{name:'  ayşe  çağlar ÖZTÜRK ',mail:' Ayse@Ornek.COM ',cell:'0532 111 22 33',title:'Muh.'}),
                  Object.assign(B(),{name:'Zeynep Kaya',mail:'z@o.com',title:'Uz'}),
                  Object.assign(B(),{name:'Düzgün KİŞİ',mail:'d@o.com',cell:'+905001112233'})];VCARD.tabloCiz();}""")
    s.select_option("#duzAd", "soyad")
    s.check("#duzTel")
    s.check("#duzUnvan")
    s.fill("#unvanSozluk", "Muh.=Mühendis\nUz=Uzman")
    s.click("#duzOnizle")
    metin = s.inner_text("#duzSonuc")
    kontrol("önizleme değişiklik sayısını gösteriyor", "değişiklik önerildi" in metin, metin[:120])
    kontrol("önizleme: eski ve yeni değerler", "Ayşe Çağlar ÖZTÜRK" in metin and "ayse@ornek.com" in metin and "+905321112233" in metin and "Mühendis" in metin, metin)
    kontrol("önizleme: değişmeyen kişi listede yok", "Düzgün" not in metin)
    kontrol("önizleme listelendi ama liste henüz değişmedi", s.evaluate("VCARD.D.satirlar[0].name") == "  ayşe  çağlar ÖZTÜRK ")
    # unvan değişikliğini (Zeynep, Uz→Uzman) işaretsiz bırak
    s.evaluate("""()=>{const kutular=[...document.querySelectorAll('[data-duz]')];
      kutular.forEach(c=>{const tr=c.closest('tr');if(tr.textContent.includes('Uzman'))c.checked=false})}""")
    s.click("#duzUygula")
    sat = s.evaluate("VCARD.D.satirlar.map(r=>[r.name,r.mail,r.cell,r.title])")
    kontrol("uygulandı: ad/e-posta/telefon/unvan", sat[0] == ["Ayşe Çağlar ÖZTÜRK", "ayse@ornek.com", "+905321112233", "Mühendis"], sat[0])
    kontrol("işareti kaldırılan değişiklik uygulanmadı", sat[1][3] == "Uz", sat[1])
    kontrol("düzgün kişiye dokunulmadı", sat[2] == ["Düzgün KİŞİ", "d@o.com", "+905001112233", ""], sat[2])
    s.evaluate("document.getElementById('unvanSozluk').dispatchEvent(new Event('change'))")
    kontrol("sözlük localStorage'a yazıldı", "Muh.=Mühendis" in (s.evaluate("localStorage.getItem('vcard.sozluk.v1')") or ""))

    # --- benzer ad mükerrer ---
    s.evaluate("""()=>{const B=()=>(""" + BOS + """);const D=VCARD.D;
      const n=(ad,tel)=>Object.assign(B(),{name:ad,cell:tel||''});
      D.satirlar=[n('Mehmet Yılmaz'),n('Yılmaz Mehmet'),n('Ahmet Karaca'),n('Ahmet Karacaa'),n('Ali Can'),n('Ali Cam'),n('Ayşe Tek','5321110000'),n('Başka Kişi','5321110000'),n('Tamamen Farklı')];VCARD.tabloCiz();}""")
    kes = s.evaluate("VCARD.mukerrerGruplar(false)")
    kontrol("benzer kapalıyken yalnızca kesin (aynı telefon)", len(kes) == 1 and kes[0]["tur"] == "kesin" and kes[0]["idx"] == [6, 7], kes)
    ben = s.evaluate("VCARD.mukerrerGruplar(true)")
    turler = sorted((g["tur"], tuple(g["idx"])) for g in ben)
    kontrol("benzer: sözcük sırası farkı olası grup", ("olasi", (0, 1)) in turler, turler)
    kontrol("benzer: 1 harf fazla yazım farkı olası grup", ("olasi", (2, 3)) in turler, turler)
    kontrol("benzer: çok kısa adlar (Ali Can/Ali Cam) eşleşmez", not any(4 in g["idx"] or 5 in g["idx"] for g in ben), turler)
    kontrol("benzer: kesin grup 'kesin' kalır", ("kesin", (6, 7)) in turler, turler)
    s.check("#mukBenzer")
    s.click("#mukerrerBtn")
    kontrol("özet kesin/olası sayar", "1 kesin, 2 olası" in s.inner_text("#kontrolOzet"), s.inner_text("#kontrolOzet"))
    s.once("dialog", lambda d: d.accept())
    s.click("#mukerrerBirlestir")
    adlar = s.evaluate("VCARD.D.satirlar.map(r=>r.name)")
    kontrol("toplu birleştirme yalnızca kesin grubu birleştirdi", len(adlar) == 8 and "Mehmet Yılmaz" in adlar and "Yılmaz Mehmet" in adlar, adlar)
bitir()
