/* ===== 60 Çıktı: .vcf, grup, ZIP, .ics, JSON yedek, otomatik saklama ===== */
function secenekler(){
  const dahil={};
  ALANLAR.forEach(a=>{const c=document.querySelector('[data-dahil="'+a.k+'"]');if(c)dahil[a.k]=c.checked});
  return {
    bosAtla:$('optSkip').checked,fnYedek:$('optFn').checked,ayir:$('optSplit').checked,tel:$('optTel').checked,dahil,
    dahiliMod:$('dahiliMod').value,orgBilesen:$('optOrg').checked,dispSablon:$('dispSablon').value.trim()
  };
}
function dahilListeKur(){
  $('dahilListe').innerHTML=ALANLAR.filter(a=>!a.zorunlu).map(a=>
    '<label class="chk"><input type="checkbox" data-dahil="'+a.k+'" checked> '+esc(a.e.replace(/ \(.*\)/,''))+'</label>').join('');
}
function cikiTemizle(){
  $('dlBtn').disabled=$('cpBtn').disabled=true;$('out').hidden=true;$('dogrulaSonuc').textContent='';
}
function rehberHazirla(){
  if(!D.satirlar.length){say('msg','Liste boş.','warn');return}
  const v=$('ver').value,o=secenekler();
  const {metin,kart,atlanan}=vcfUret(D.satirlar,v,o);
  D.vcf=metin;
  const bday=D.satirlar.filter(bdayHatali).length;
  const out=$('out');out.hidden=false;
  const goster=metin.replace(/\r/g,'').replace(/[A-Za-z0-9+\/=]{200,}/g,m=>m.slice(0,60)+'…(fotoğraf verisi kısaltıldı)');
  out.textContent=goster.length>60000?goster.slice(0,60000)+'\n... (önizleme kısaltıldı)':goster;
  $('dlBtn').disabled=$('cpBtn').disabled=false;
  say('msg',kart+' kişi hazırlandı'+(atlanan?' ('+atlanan+' boş satır atlandı)':'')+(bday?'; '+bday+' satırda geçersiz doğum tarihi var, bu alan yazılmadı.':'.'),bday?'warn':'ok');
  const d=vcfDogrula(D.satirlar,metin,o);
  const el=$('dogrulaSonuc');
  if(d.sorun.length){el.className='msg warn';el.textContent='Kendini sınama: '+d.sorun.length+' fark bulundu — '+d.sorun.slice(0,3).join('; ')}
  else{el.className='msg ok';el.textContent='Kendini sınama geçti: çıktı geri okundu — '+d.kisi+' kişi, '+d.tel+' telefon, '+d.mail+' e-posta eşleşti.'}
  return {kart,d};
}
function vcfIndir(metin,ad){indir(metinBlob(metin,'text/vcard'),ad)}

/* ----- gruplar ----- */
function grupListesiYenile(){
  const s=$('grupSec'),onceki=s.value;
  const adlar=[...new Set(D.satirlar.map(r=>String(r.cat).trim()))].sort((a,b)=>a.localeCompare(b,'tr'));
  s.innerHTML='<option value="*">(Tüm kişiler)</option>'+adlar.map(a=>'<option value="'+esc(a)+'">'+esc(a||'(grupsuz)')+'</option>').join('');
  if([...s.options].some(o=>o.value===onceki))s.value=onceki;
}
function grupSatirlari(g){return g==='*'?D.satirlar:D.satirlar.filter(r=>String(r.cat).trim()===g)}
function grupIndir(){
  const g=$('grupSec').value,sat=grupSatirlari(g);
  if(!sat.length){say('msg','Seçili grupta kişi yok.','warn');return}
  const {metin,kart}=vcfUret(sat,$('ver').value,secenekler());
  vcfIndir(metin,(g==='*'?'rehberiniz':guvenliAd(g||'grupsuz'))+'.vcf');
  say('msg',kart+' kişilik grup indirildi.','ok');
}
function grupZip(){
  const v=$('ver').value,o=secenekler(),enc=new TextEncoder();
  const gruplar=new Map();
  D.satirlar.forEach(r=>{const g=String(r.cat).trim();if(!gruplar.has(g))gruplar.set(g,[]);gruplar.get(g).push(r)});
  if(!gruplar.size){say('msg','Liste boş.','warn');return}
  const kullanilan=new Set(),dosyalar=[];
  gruplar.forEach((sat,g)=>{
    let ad=guvenliAd(g||'grupsuz'),n=ad,i=2;
    while(kullanilan.has(n.toLowerCase()))n=ad+'_'+(i++);
    kullanilan.add(n.toLowerCase());
    dosyalar.push({ad:n+'.vcf',veri:enc.encode(vcfUret(sat,v,o).metin)});
  });
  indir(zipOlustur(dosyalar),'rehber_gruplar.zip');
  say('msg',dosyalar.length+' grup ZIP olarak indirildi.','ok');
}

/* ----- doğum günü takvimi (.ics) ----- */
function icsUret(satirlar){
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//VCARD Rehber Hazirlama//TR','CALSCALE:GREGORIAN'];
  let n=0;
  const damga=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
  satirlar.forEach((r,i)=>{
    if(!/^\d{8}$/.test(r.bday))return;
    const ad=String(r.name||r.disp).trim();if(!ad)return;
    const bitis=new Date(Date.UTC(+r.bday.slice(0,4),+r.bday.slice(4,6)-1,+r.bday.slice(6)+1));
    const b=bitis.getUTCFullYear()+pad(bitis.getUTCMonth()+1)+pad(bitis.getUTCDate());
    L.push('BEGIN:VEVENT','UID:bday-'+i+'-'+r.bday+'@vcard-rehber','DTSTAMP:'+damga,
      'DTSTART;VALUE=DATE:'+r.bday,'DTEND;VALUE=DATE:'+b,'RRULE:FREQ=YEARLY',
      'SUMMARY:'+esc34('Doğum günü: '+ad),'TRANSP:TRANSPARENT','END:VEVENT');
    n++;
  });
  L.push('END:VCALENDAR');
  return {metin:L.reduce((t,x)=>t.concat(katla(x)),[]).join('\r\n')+'\r\n',n};
}
function icsIndir(){
  const {metin,n}=icsUret(grupSatirlari($('grupSec').value));
  if(!n){say('msg','Geçerli doğum tarihi olan kişi yok.','warn');return}
  indir(metinBlob(metin,'text/calendar'),'dogum_gunleri.ics');
  say('msg',n+' doğum günü takvim dosyasına yazıldı.','ok');
}

/* ----- JSON yedek ve tarayıcıda saklama (opt-in) ----- */
function jsonYedek(){
  return JSON.stringify({uygulama:'vcard-rehber',surum:APP_SURUM,tarih:new Date().toISOString(),satirlar:D.satirlar});
}
function jsonYukle(metin){
  const o=JSON.parse(metin);
  if(!o||o.uygulama!=='vcard-rehber'||!Array.isArray(o.satirlar))throw new Error('Bu bir VCARD Rehber yedeği değil.');
  return o.satirlar.map(x=>{const r=bosSatir();ALANLAR.forEach(a=>r[a.k]=String(x[a.k]==null?'':x[a.k]));r._img=x._img||null;return r});
}
function otoSaklaYaz(){
  if(!$('otoSakla')||!$('otoSakla').checked)return;
  try{localStorage.setItem(LS_OTO,JSON.stringify(D.satirlar.map(r=>Object.assign({},r,{_img:null}))))}catch(_){}
}
function otoSaklaOku(){
  try{const v=localStorage.getItem(LS_OTO);if(v)return JSON.parse(v)}catch(_){}
  return null;
}
