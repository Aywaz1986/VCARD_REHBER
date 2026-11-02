/* ===== 50 vCard üretimi (2.1 / 3.0 / 4.0) ===== */
function qp(s){ // UTF-8 → Quoted-Printable (ASCII dışı, boşluk, '=' ve ';' → =XX; ';' alan ayırıcıyla karışmasın)
  if(!s)return '';
  let o='';
  for(const x of new TextEncoder().encode(s)){
    if(x>=33&&x<=126&&x!==61&&x!==59)o+=String.fromCharCode(x);
    else o+='='+x.toString(16).toUpperCase().padStart(2,'0');
  }
  return o;
}
function esc34(s){return String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function katla(satir){ // 3.0 / 4.0: 75 karakterlik satırlar, devam satırı boşlukla başlar
  if(satir.length<=75)return [satir];
  const o=[satir.slice(0,75)];let p=75;
  while(p<satir.length){o.push(' '+satir.slice(p,p+74));p+=74}
  return o;
}
const TEL_ONEK={
  '2.1':{cell:'TEL;CELL',work:'TEL;WORK',fax:'TEL;WORK;FAX;PREF',home:'TEL;HOME'},
  '3.0':{cell:'TEL;TYPE=CELL',work:'TEL;TYPE=WORK',fax:'TEL;TYPE=WORK,FAX',home:'TEL;TYPE=HOME'},
  '4.0':{cell:'TEL;TYPE=cell',work:'TEL;TYPE=work',fax:'TEL;TYPE=work,fax',home:'TEL;TYPE=home'}
};
const Q21=';CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE';

/* {alan} yer tutuculu şablonu satırla doldurur (görünen ad şablonu) */
function sablonUygula(sablon,r){
  return String(sablon).replace(/\{([a-z0-9]+)\}/gi,(m,k)=>r[k]==null?'':String(r[k]).trim()).replace(/\(\s*\)|\[\s*\]/g,'').replace(/\s+/g,' ').trim();
}
/* ORG: " > " ile ayrılmış birim yolu bileşenli yazılabilir (Kurum;Müdürlük;Birim) */
function orgBilesenleri(org,o){
  org=String(org||'').trim();
  if(o.orgBilesen&&/\s>\s/.test(org))return org.split(/\s*>\s*/).filter(Boolean);
  return org?[org]:[];
}
/* Telefon değeri: tel normalizasyonu yalnız ana numaralara; dahili ayrıca ele alınır */
function telDeger(r,k,o){
  let x=String(r[k]==null?'':r[k]).trim();
  if(o.tel&&x){const n=telNorm(x);if(n.ok)x=n.v}
  return x;
}

/* Tek kişi -> satır dizisi.
   o: {bosAtla, fnYedek, ayir, tel, dahil:{alan:bool}, dahiliMod:'ayri'|'ekle', orgBilesen, dispSablon} */
function vcfKart(r,v,o){
  const L=[],dahil=k=>!o.dahil||o.dahil[k]!==false;
  const metin=s=>v==='2.1'?qp(s):esc34(s);
  const tr=s=>String(s==null?'':s).trim();
  const ekle=(onek,deger,metinMi)=>{
    deger=tr(deger);
    if(deger===''&&o.bosAtla)return;
    L.push(onek+(metinMi&&v==='2.1'&&deger?Q21:'')+':'+(metinMi?metin(deger):deger));
  };
  const ad=tr(r.name),disp=tr(r.disp);
  L.push('BEGIN:VCARD','VERSION:'+v);
  // N
  let aile='',veri=ad;
  if(o.ayir){const w=ad.split(/\s+/).filter(Boolean);aile=w.length>1?w.pop():'';veri=w.join(' ')}
  if(v==='2.1')L.push('N'+Q21+':'+qp(aile)+';'+qp(veri)+';;;');
  else L.push('N:'+esc34(aile)+';'+esc34(veri)+';;;');
  // FN (3.0/4.0'da zorunlu); şablon varsa görünen adı şablondan üretir
  let fn=disp||((o.fnYedek||v!=='2.1')?ad:'');
  if(o.dispSablon){const t=sablonUygula(o.dispSablon,r);if(t)fn=t}
  if(!(o.bosAtla&&!fn))L.push('FN'+(v==='2.1'&&fn?Q21:'')+':'+metin(fn));
  if(dahil('nick'))ekle('NICKNAME',r.nick,true);
  // Telefonlar (+ dahili)
  const ext=dahil('ext')?tr(r.ext):'';
  TEL_ALANLARI.forEach(k=>{
    if(!dahil(k))return;
    let x=telDeger(r,k,o);
    if(k==='work'&&ext&&o.dahiliMod==='ekle'&&x)x=x+','+ext;
    ekle(TEL_ONEK[v][k],x,false);
    if(k==='work'&&ext&&o.dahiliMod!=='ekle'&&x)ekle(TEL_ONEK[v].work,ext,false);   // dahili ayrı iş numarası
  });
  if(ext&&!(dahil('work')&&telDeger(r,'work',o)))ekle(TEL_ONEK[v].work,ext,false);  // ana numara yoksa dahili tek başına
  if(dahil('mail'))ekle(v==='2.1'?'EMAIL;PREF;INTERNET':v==='3.0'?'EMAIL;TYPE=INTERNET,PREF':'EMAIL',r.mail,false);
  if(dahil('mail2'))ekle(v==='2.1'?'EMAIL;INTERNET':v==='3.0'?'EMAIL;TYPE=INTERNET':'EMAIL',r.mail2,false);
  // ADR: PO;ext;sokak;şehir;bölge;posta;ülke (bileşen bileşen kodlanır)
  {
    const sokak=dahil('addr')?tr(r.addr):'',sehir=dahil('city')?tr(r.city):'',posta=dahil('zip')?tr(r.zip):'';
    if(!(o.bosAtla&&!sokak&&!sehir&&!posta)){
      const onek=v==='2.1'?'ADR;WORK':v==='3.0'?'ADR;TYPE=WORK':'ADR;TYPE=work';
      const dolu=sokak||sehir||posta;
      L.push(onek+(v==='2.1'&&dolu?Q21:'')+':;;'+[sokak,sehir,'',posta,''].map(metin).join(';'));
    }
  }
  if(dahil('org')){
    const p=orgBilesenleri(r.org,o);
    if(p.length)L.push('ORG'+(v==='2.1'?Q21:'')+':'+p.map(metin).join(';'));
    else if(!o.bosAtla)L.push('ORG:');
  }
  if(dahil('title'))ekle('TITLE',r.title,true);
  if(dahil('url'))ekle('URL',r.url,false);
  if(dahil('cat'))ekle('CATEGORIES',r.cat,true);
  if(dahil('note'))ekle('NOTE',r.note,true);
  if(dahil('bday')&&/^\d{8}$/.test(r.bday)){
    L.push('BDAY:'+(v==='3.0'?r.bday.slice(0,4)+'-'+r.bday.slice(4,6)+'-'+r.bday.slice(6):r.bday));
  }
  if(dahil('photo')&&r._img){
    const b64=r._img.split(',')[1]||'';
    if(v==='2.1'){
      L.push('PHOTO;ENCODING=BASE64;JPEG:');
      for(let p=0;p<b64.length;p+=76)L.push(' '+b64.slice(p,p+76));
      L.push(''); // 2.1: base64 sonrası boş satır
    }else if(v==='3.0')L.push('PHOTO;ENCODING=b;TYPE=JPEG:'+b64);
    else L.push('PHOTO:data:image/jpeg;base64,'+b64);
  }
  L.push('END:VCARD');
  return v==='2.1'?L:L.reduce((t,x)=>t.concat(katla(x)),[]);
}
function vcfUret(satirlar,v,o){
  const L=[];let kart=0,atlanan=0;
  satirlar.forEach(r=>{
    const bos=!String(r.name).trim()&&!String(r.disp).trim()&&!TEL_ALANLARI.some(k=>String(r[k]).trim())&&!String(r.mail).trim();
    if(bos){atlanan++;return}
    L.push.apply(L,vcfKart(r,v,o));kart++;
  });
  return {metin:L.join('\r\n')+'\r\n',kart,atlanan};
}

/* Kendini sınama: üretilen metni geri okuyup kaynakla karşılaştırır */
function vcfDogrula(satirlar,metin,o){
  const geri=vcfOku(metin);
  const kaynak=satirlar.filter(r=>String(r.name).trim()||String(r.disp).trim()||TEL_ALANLARI.some(k=>String(r[k]).trim())||String(r.mail).trim());
  const sorun=[],dahil=k=>!(o.dahil&&o.dahil[k]===false);
  if(geri.length!==kaynak.length)sorun.push('Kişi sayısı uyuşmuyor: '+kaynak.length+' → '+geri.length);
  const n=Math.min(geri.length,kaynak.length);
  let tel=0,mail=0;
  for(let i=0;i<n;i++){
    const a=kaynak[i],b=geri[i],t=x=>String(x==null?'':x).trim();
    const ad=t(a.name);
    if(ad&&(!o.ayir)&&b.name!==ad)sorun.push('#'+(i+1)+' ad farklı: "'+ad+'" → "'+b.name+'"');
    TEL_ALANLARI.forEach(k=>{
      if(!dahil(k))return;
      const x=telDeger(a,k,o);
      if(x){tel++;if(b[k]!==x)sorun.push('#'+(i+1)+' '+k+' farklı: "'+x+'" → "'+b[k]+'"')}
    });
    const ext=dahil('ext')?t(a.ext):'';
    if(ext){
      if(telDeger(a,'work',o)&&dahil('work')){if(b.ext!==ext)sorun.push('#'+(i+1)+' dahili farklı')}
      else if(b.work!==ext)sorun.push('#'+(i+1)+' dahili (tek başına) farklı');
    }
    if(t(a.mail)&&dahil('mail')){mail++;if(b.mail!==t(a.mail))sorun.push('#'+(i+1)+' e-posta farklı')}
    ['mail2','nick','note','city','zip','addr','title'].forEach(k=>{
      if(t(a[k])&&dahil(k)&&b[k]!==t(a[k]))sorun.push('#'+(i+1)+' '+k+' farklı');
    });
    if(t(a.org)&&dahil('org')){
      const bek=orgBilesenleri(a.org,o).join(' > ');
      if(b.org!==bek)sorun.push('#'+(i+1)+' org farklı');
    }
  }
  return {kisi:geri.length,tel,mail,sorun};
}
