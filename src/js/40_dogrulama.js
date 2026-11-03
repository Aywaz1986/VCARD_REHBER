/* ===== 40 Denetim, telefon düzeltme, mükerrer ===== */
function denetle(){
  const sorun=[];
  D.satirlar.forEach((r,i)=>{
    const ad=r.name.trim()||r.disp.trim();
    if(!ad)sorun.push({i,t:'bad',m:'Ad boş'});
    const telVar=TEL_ALANLARI.some(k=>String(r[k]).trim()!=='');
    if(!telVar&&!r.mail.trim())sorun.push({i,t:'warn',m:'Telefon ve e-posta yok'});
    TEL_ALANLARI.forEach(k=>{
      const v=String(r[k]).trim();
      if(v&&!telNorm(v).ok)sorun.push({i,t:'warn',m:ALANLAR.find(a=>a.k===k).e+' geçersiz: '+v});
    });
    if(r.mail.trim()&&!epostaGecerli(r.mail))sorun.push({i,t:'warn',m:'E-posta geçersiz: '+r.mail});
    if(bdayHatali(r))sorun.push({i,t:'warn',m:'Doğum tarihi geçersiz: '+r.bday});
  });
  return sorun;
}
function denetimGoster(){
  const s=denetle();
  const hata=s.filter(x=>x.t==='bad').length;
  $('kontrolOzet').textContent=s.length?'— '+s.length+' uyarı':'— sorun yok';
  const goster=s.slice(0,200);
  $('kontrolSonuc').innerHTML=(s.length?'':'<p class="ok">Listede sorun bulunmadı ('+D.satirlar.length+' kişi).</p>')
    +goster.map(x=>'<div class="sorun"><b class="'+x.t+'">#'+(x.i+1)+'</b><span>'+esc(x.m)+'</span><button data-git="'+x.i+'">Git</button></div>').join('')
    +(s.length>200?'<p class="hint">İlk 200 uyarı gösteriliyor.</p>':'');
  return {toplam:s.length,hata};
}
function telefonlariDuzelt(){
  let n=0,gecersiz=0;
  D.satirlar.forEach(r=>TEL_ALANLARI.forEach(k=>{
    const v=String(r[k]).trim();if(!v)return;
    const t=telNorm(v);
    if(!t.ok){gecersiz++;return}
    if(t.v!==r[k]){r[k]=t.v;n++}
  }));
  tabloCiz();otoSaklaYaz();
  $('kontrolOzet').textContent='— '+n+' numara düzeltildi'+(gecersiz?', '+gecersiz+' numara düzeltilemedi':'');
  return {n,gecersiz};
}

/* Mükerrer: aynı telefon (son 10 hane) veya aynı ad -> "kesin" gruplar.
   benzer=true ise sözcük sırası farkı ve 1 harflik yazım farkı da bağlanır -> yalnızca "olası" grup (otomatik birleştirilmez).
   Dönüş: [{idx:[...], tur:'kesin'|'olasi'}] */
function ufKur(n){
  const e=Array.from({length:n},(_,i)=>i);
  const bul=x=>{while(e[x]!==x){e[x]=e[e[x]];x=e[x]}return x};
  return {bul,birles:(a,b)=>{a=bul(a);b=bul(b);if(a!==b)e[b]=a}};
}
function gruplaUF(uf,n){
  const g=new Map();
  for(let i=0;i<n;i++){const k=uf.bul(i);if(!g.has(k))g.set(k,[]);g.get(k).push(i)}
  return [...g.values()].filter(x=>x.length>1);
}
function mukerrerGruplar(benzer){
  const n=D.satirlar.length,uf=ufKur(n),harita=new Map();
  const ekle=(anah,i)=>{if(!anah)return;if(harita.has(anah))uf.birles(harita.get(anah),i);else harita.set(anah,i)};
  D.satirlar.forEach((r,i)=>{
    TEL_ALANLARI.forEach(k=>{
      const d=String(r[k]).replace(/\D/g,'');
      if(d.length>=7)ekle('t'+d.slice(-10),i);
    });
    const ad=anahtar(r.name||r.disp);
    if(ad)ekle('a'+ad,i);
  });
  const kesin=gruplaUF(uf,n);
  const sonuc=kesin.map(idx=>({idx,tur:'kesin'}));
  if(!benzer)return sonuc;
  // olası: sözcük sırası farkı + 1 harf yazım farkı (uzunluğa göre kovalanmış karşılaştırma)
  const uf2=ufKur(n);
  kesin.forEach(g=>g.slice(1).forEach(i=>uf2.birles(g[0],i)));
  const anahtarlar=D.satirlar.map(r=>adSiraliAnahtar(r.name||r.disp));
  const kova=new Map();
  anahtarlar.forEach((k,i)=>{
    if(!k)return;
    if(!kova.has(k.length))kova.set(k.length,[]);
    kova.get(k.length).push(i);
  });
  const ayni=new Map();
  anahtarlar.forEach((k,i)=>{if(!k)return;if(ayni.has(k))uf2.birles(ayni.get(k),i);else ayni.set(k,i)});
  const uzunluklar=[...kova.keys()];
  uzunluklar.forEach(L=>{
    if(L<8)return; // çok kısa adlarda yazım farkı güvenilir değil
    const kendi=kova.get(L),komsu=(kova.get(L+1)||[]);
    for(let x=0;x<kendi.length;x++){
      for(let y=x+1;y<kendi.length;y++)if(anahtarlar[kendi[x]]!==anahtarlar[kendi[y]]&&uzaklikEnFazla(anahtarlar[kendi[x]],anahtarlar[kendi[y]],1))uf2.birles(kendi[x],kendi[y]);
      for(let y=0;y<komsu.length;y++)if(uzaklikEnFazla(anahtarlar[kendi[x]],anahtarlar[komsu[y]],1))uf2.birles(kendi[x],komsu[y]);
    }
  });
  const kesinAnahtar=new Set(kesin.map(g=>g.join(',')));
  return gruplaUF(uf2,n).map(idx=>({idx,tur:kesinAnahtar.has(idx.join(','))?'kesin':'olasi'}));
}
function kayitBirlestir(idxler){ // ilk kayıt korunur, boş alanlar diğerlerinden doldurulur
  const ana=D.satirlar[idxler[0]];
  idxler.slice(1).forEach(i=>{
    const d=D.satirlar[i];
    ALANLAR.forEach(a=>{if(String(ana[a.k]).trim()===''&&String(d[a.k]).trim()!=='')ana[a.k]=d[a.k]});
    if(!ana._img&&d._img)ana._img=d._img;
  });
  return idxler.slice(1);
}
let _mukerrer=[];
function mukerrerGoster(){
  _mukerrer=mukerrerGruplar($('mukBenzer').checked);
  const kesin=_mukerrer.filter(g=>g.tur==='kesin').length,olasi=_mukerrer.length-kesin;
  $('mukerrerBirlestir').disabled=!kesin;
  $('kontrolOzet').textContent=_mukerrer.length?'— '+kesin+' kesin, '+olasi+' olası mükerrer grup':'— mükerrer yok';
  $('kontrolSonuc').innerHTML=_mukerrer.length?_mukerrer.map((g,gi)=>
    '<div class="grup"><div class="row"><b>Grup '+(gi+1)+'</b><span class="'+(g.tur==='kesin'?'bad':'warn')+'">'+(g.tur==='kesin'?'kesin':'olası')+'</span><button data-birles="'+gi+'">Birleştir</button></div>'
    +g.idx.map(i=>'<div class="sorun"><b>#'+(i+1)+'</b><span>'+esc(D.satirlar[i].name||D.satirlar[i].disp)+' · '+esc(D.satirlar[i].cell||D.satirlar[i].work||D.satirlar[i].home)+'</span><button data-git="'+i+'">Git</button></div>').join('')+'</div>'
  ).join(''):'<p class="ok">Mükerrer kayıt bulunmadı.</p>';
}
function mukerrerBirlestir(gruplar){ // gruplar: [{idx}] veya [[idx]]
  const sil=new Set();
  gruplar.forEach(g=>kayitBirlestir(g.idx||g).forEach(i=>sil.add(i)));
  D.satirlar=D.satirlar.filter((_,i)=>!sil.has(i));
  tabloCiz();grupListesiYenile();otoSaklaYaz();
  mukerrerGoster();
  return sil.size;
}

/* Yüklerken otomatik ayıklama — ihtiyatlı kural: aynı ad VE çakışan telefon/e-posta yok.
   (Aynı telefonu paylaşan farklı kişiler, ya da aynı adlı farklı kişiler birleştirilmez.) */
function telAnahtarlari(r){
  const o={};
  TEL_ALANLARI.forEach(k=>{const d=String(r[k]).replace(/\D/g,'');if(d.length>=7)o[k]=d.slice(-10)});
  return o;
}
function telCakisir(a,b){return TEL_ALANLARI.some(k=>a[k]&&b[k]&&a[k]!==b[k])}
function otomatikMukerrer(){
  const kova=new Map();
  D.satirlar.forEach((r,i)=>{const k=anahtar(r.name||r.disp);if(!k)return;if(!kova.has(k))kova.set(k,[]);kova.get(k).push(i)});
  const sil=new Set();let ayri=0;
  kova.forEach(idxler=>{
    if(idxler.length<2)return;
    const kumeler=[];
    idxler.forEach(i=>{
      const r=D.satirlar[i],t=telAnahtarlari(r),m=String(r.mail).trim().toLowerCase();
      const k=kumeler.find(c=>!telCakisir(c.tel,t)&&(!c.mail||!m||c.mail===m));
      if(k){k.uyeler.push(i);Object.keys(t).forEach(f=>{if(!k.tel[f])k.tel[f]=t[f]});if(!k.mail)k.mail=m}
      else kumeler.push({uyeler:[i],tel:Object.assign({},t),mail:m});
    });
    if(kumeler.length>1)ayri+=kumeler.length;
    kumeler.forEach(c=>{if(c.uyeler.length>1)kayitBirlestir(c.uyeler).forEach(i=>sil.add(i))});
  });
  D.satirlar=D.satirlar.filter((_,i)=>!sil.has(i));
  return {ayiklanan:sil.size,ayri};
}
