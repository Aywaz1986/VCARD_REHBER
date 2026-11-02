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

/* Mükerrer: aynı telefon (son 10 hane) veya aynı ad -> bağlı gruplar */
function mukerrerGruplar(){
  const ebeveyn=D.satirlar.map((_,i)=>i);
  const bul=x=>{while(ebeveyn[x]!==x){ebeveyn[x]=ebeveyn[ebeveyn[x]];x=ebeveyn[x]}return x};
  const birles=(a,b)=>{a=bul(a);b=bul(b);if(a!==b)ebeveyn[b]=a};
  const harita=new Map();
  const ekle=(anah,i)=>{if(!anah)return;if(harita.has(anah))birles(harita.get(anah),i);else harita.set(anah,i)};
  D.satirlar.forEach((r,i)=>{
    TEL_ALANLARI.forEach(k=>{
      const d=String(r[k]).replace(/\D/g,'');
      if(d.length>=7)ekle('t'+d.slice(-10),i);
    });
    const ad=anahtar(r.name||r.disp);
    if(ad)ekle('a'+ad,i);
  });
  const g=new Map();
  D.satirlar.forEach((_,i)=>{const k=bul(i);if(!g.has(k))g.set(k,[]);g.get(k).push(i)});
  return [...g.values()].filter(x=>x.length>1);
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
  _mukerrer=mukerrerGruplar();
  $('mukerrerBirlestir').disabled=!_mukerrer.length;
  $('kontrolOzet').textContent=_mukerrer.length?'— '+_mukerrer.length+' mükerrer grup':'— mükerrer yok';
  $('kontrolSonuc').innerHTML=_mukerrer.length?_mukerrer.map((g,gi)=>
    '<div class="grup"><div class="row"><b>Grup '+(gi+1)+'</b><button data-birles="'+gi+'">Birleştir</button></div>'
    +g.map(i=>'<div class="sorun"><b>#'+(i+1)+'</b><span>'+esc(D.satirlar[i].name||D.satirlar[i].disp)+' · '+esc(D.satirlar[i].cell||D.satirlar[i].work||D.satirlar[i].home)+'</span><button data-git="'+i+'">Git</button></div>').join('')+'</div>'
  ).join(''):'<p class="ok">Mükerrer kayıt bulunmadı.</p>';
}
function mukerrerBirlestir(gruplar){
  const sil=new Set();
  gruplar.forEach(g=>kayitBirlestir(g).forEach(i=>sil.add(i)));
  D.satirlar=D.satirlar.filter((_,i)=>!sil.has(i));
  tabloCiz();grupListesiYenile();otoSaklaYaz();
  mukerrerGoster();
  return sil.size;
}
