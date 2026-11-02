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

/* Tek kişi -> satır dizisi. o: {bosAtla, fnYedek, ayir, tel, dahil:{alan:bool}} */
function vcfKart(r,v,o){
  const L=[],dahil=k=>!o.dahil||o.dahil[k]!==false;
  const metin=s=>v==='2.1'?qp(s):esc34(s);
  const tr=s=>String(s==null?'':s).trim();
  const tel=k=>{let x=tr(r[k]);if(o.tel&&x){const n=telNorm(x);if(n.ok)x=n.v}return x};
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
  // FN (3.0/4.0'da zorunlu)
  const fn=disp||((o.fnYedek||v!=='2.1')?ad:'');
  if(!(o.bosAtla&&!fn))L.push('FN'+(v==='2.1'&&fn?Q21:'')+':'+metin(fn));
  TEL_ALANLARI.forEach(k=>{if(dahil(k))ekle(TEL_ONEK[v][k],tel(k),false)});
  if(dahil('mail'))ekle(v==='2.1'?'EMAIL;PREF;INTERNET':v==='3.0'?'EMAIL;TYPE=INTERNET,PREF':'EMAIL',r.mail,false);
  if(dahil('addr')){
    const a=tr(r.addr);
    if(!(o.bosAtla&&!a)){
      const onek=v==='2.1'?'ADR;WORK':v==='3.0'?'ADR;TYPE=WORK':'ADR;TYPE=work';
      L.push(onek+(v==='2.1'&&a?Q21:'')+':;;'+metin(a)+(v==='2.1'?'':';;;;'));
    }
  }
  if(dahil('org'))ekle('ORG',r.org,true);
  if(dahil('title'))ekle('TITLE',r.title,true);
  if(dahil('url'))ekle('URL',r.url,false);
  if(dahil('cat'))ekle('CATEGORIES',r.cat,true);
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
  const sorun=[];
  if(geri.length!==kaynak.length)sorun.push('Kişi sayısı uyuşmuyor: '+kaynak.length+' → '+geri.length);
  const n=Math.min(geri.length,kaynak.length);
  let tel=0,mail=0;
  for(let i=0;i<n;i++){
    const a=kaynak[i],b=geri[i];
    const ad=String(a.name).trim();
    if(ad&&(!o.ayir)&&b.name!==ad)sorun.push('#'+(i+1)+' ad farklı: "'+ad+'" → "'+b.name+'"');
    TEL_ALANLARI.forEach(k=>{
      if(o.dahil&&o.dahil[k]===false)return;
      let x=String(a[k]).trim();if(o.tel&&x){const t=telNorm(x);if(t.ok)x=t.v}
      if(x){tel++;if(b[k]!==x)sorun.push('#'+(i+1)+' '+k+' farklı: "'+x+'" → "'+b[k]+'"')}
    });
    ['addr','org','title'].forEach(k=>{
      const x=String(a[k]).trim();
      if(x&&!(o.dahil&&o.dahil[k]===false)&&b[k]!==x)sorun.push('#'+(i+1)+' '+k+' farklı');
    });
    if(String(a.mail).trim()&&!(o.dahil&&o.dahil.mail===false)){mail++;if(b.mail!==String(a.mail).trim())sorun.push('#'+(i+1)+' e-posta farklı')}
  }
  return {kisi:geri.length,tel,mail,sorun};
}
