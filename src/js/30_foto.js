/* ===== 30 Fotoğraf ===== */
function toJpeg200(blob){
  return new Promise((res,rej)=>{
    const url=URL.createObjectURL(blob),im=new Image();
    im.onload=()=>{
      const S=200,cv=document.createElement('canvas');cv.width=cv.height=S;
      const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,S,S);
      const m=Math.min(im.width,im.height),sx=(im.width-m)/2,sy=(im.height-m)/2; // ortadan kare kırp
      x.drawImage(im,sx,sy,m,m,0,0,S,S);
      URL.revokeObjectURL(url);res(cv.toDataURL('image/jpeg',0.85));
    };
    im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('Resim açılamadı'))};
    im.src=url;
  });
}
async function fotoAta(i,file,adiYaz){
  try{D.satirlar[i]._img=await toJpeg200(file);if(adiYaz)D.satirlar[i].photo=file.name;tabloCiz()}
  catch(e){say('msgKaynak',file.name+': '+e.message,'bad')}
}
/* Eşleştirme: önce "Fotoğraf" sütunundaki dosya adı, sonra "Ad Soyad" (uzantısız, Türkçe karakter ve boşluk farkı yok sayılır) */
async function fotoTopluEsle(dosyalar){
  const adMap=new Map(),stemMap=new Map();
  dosyalar.forEach(f=>{
    adMap.set(f.name.toLowerCase(),f);
    stemMap.set(anahtar(uzantisiz(f.name)),f);
  });
  let ok=0,hata=0,eslesmeyen=0;
  for(let i=0;i<D.satirlar.length;i++){
    const r=D.satirlar[i];
    let f=r.photo&&adMap.get(dosyaAdi(r.photo).toLowerCase());
    if(!f&&r.photo&&r.photo!=='(vcf)'&&r.photo!=='(veritabanı)')f=stemMap.get(anahtar(uzantisiz(dosyaAdi(r.photo)))); // uzantı farklıysa (ali.jpg ↔ ali.png)
    if(!f&&r.name)f=stemMap.get(anahtar(r.name));
    if(!f&&r.disp)f=stemMap.get(anahtar(r.disp));
    if(!f){if(r.photo&&!r._img)eslesmeyen++;continue}
    try{r._img=await toJpeg200(f);if(!r.photo)r.photo=f.name;ok++}catch(_){hata++}
    if(ok%20===0)say('msgKaynak','Fotoğraflar işleniyor… '+ok,'');
  }
  tabloCiz();otoSaklaYaz();
  say('msgKaynak',ok+' fotoğraf eşleşti ('+dosyalar.length+' dosya seçildi).'
    +(eslesmeyen?' '+eslesmeyen+' kişinin fotoğraf adı seçilen dosyalarda bulunamadı.':'')
    +(hata?' '+hata+' dosya açılamadı (HEIC/TIFF gibi tarayıcının okuyamadığı biçimler olabilir; JPG/PNG\'ye çevirin).':''),(ok&&!eslesmeyen&&!hata)?'ok':'warn');
}
