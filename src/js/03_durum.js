/* ===== 03 Durum ===== */
const D={
  satirlar:[],      // kişi kayıtları: ALANLAR anahtarları + _img (JPEG dataURL | null)
  sayfa:0,
  sayfaBoyu:100,
  vcf:'',           // son üretilen vCard metni
  wb:null,          // son okunan Excel çalışma kitabı
  sq:null           // {db, tablolar:{ad:[sütunlar]}, tablo}
};
function listeyeYaz(yeni,mod){
  D.satirlar=(mod==='ekle')?D.satirlar.concat(yeni):yeni;
  D.sayfa=0;
  tabloCiz();grupListesiYenile();otoSaklaYaz();
}
function modOku(){return $('yukleMod').value}
