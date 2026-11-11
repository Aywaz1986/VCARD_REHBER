/* ===== 03 Durum ===== */
const D={
  satirlar:[],      // kişi kayıtları: ALANLAR anahtarları + _img (JPEG dataURL | null)
  sayfa:0,
  sayfaBoyu:100,
  vcf:'',           // son üretilen vCard metni
  wb:null,          // son okunan Excel çalışma kitabı
  sq:null,          // {db, tablolar:{ad:[sütunlar]}, tablo}
  geriAl:null,      // son otomatik ayıklamadan önceki liste
  ex:null           // son okunan Excel sayfası: {ad,veri,bas,es,imza,oncesi}
};
/* ayikla=true: yüklenen kayıtlarda (ve listede) aynı kişiyi tekrar edenler otomatik birleştirilir.
   Dönüş: {ayiklanan, ayri} — ayıklanan kayıt sayısı, "aynı ad ama farklı telefon/e-posta" nedeniyle ayrı bırakılan kayıt sayısı. */
function listeyeYaz(yeni,mod,ayikla){
  D.satirlar=(mod==='ekle')?D.satirlar.concat(yeni):yeni;
  D.sayfa=0;D.geriAl=null;
  let sonuc={ayiklanan:0,ayri:0};
  if(ayikla&&$('optAyikla').checked){
    const once=D.satirlar.map(r=>Object.assign({},r));          // ayıklamadan önceki hali (geri alma için)
    sonuc=otomatikMukerrer();
    if(sonuc.ayiklanan)D.geriAl=once;
  }
  $('mukGeriAl').hidden=!D.geriAl;
  tabloCiz();grupListesiYenile();otoSaklaYaz();
  return sonuc;
}
function ayiklamaNotu(s){
  if(!s||(!s.ayiklanan&&!s.ayri))return '';
  return (s.ayiklanan?' '+s.ayiklanan+' mükerrer kayıt ayıklandı.':'')
    +(s.ayri?' '+s.ayri+' kayıt aynı adlı ama farklı telefon/e-postalı olduğu için ayrı bırakıldı.':'');
}
function ayiklamayiGeriAl(){
  if(!D.geriAl)return;
  D.satirlar=D.geriAl;D.geriAl=null;D.sayfa=0;
  $('mukGeriAl').hidden=true;
  tabloCiz();grupListesiYenile();otoSaklaYaz();
  say('msgKaynak','Ayıklama geri alındı ('+D.satirlar.length+' kişi).','ok');
}
function modOku(){return $('yukleMod').value}
