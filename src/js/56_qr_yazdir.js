/* ===== 56 Tek kişilik QR kod ve yazdırılabilir rehber ===== */
function qrUret(metin){
  qrcode.stringToBytes=function(s){return Array.from(new TextEncoder().encode(s))};   // UTF-8 (Türkçe karakterler)
  const q=qrcode(0,'L');
  q.addData(metin,'Byte');
  q.make();
  return q;
}
function qrCiz(q,tuval,hucre,kenar){
  const n=q.getModuleCount(),boy=(n+2*kenar)*hucre;
  tuval.width=tuval.height=boy;
  const x=tuval.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,boy,boy);x.fillStyle='#000';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))x.fillRect((c+kenar)*hucre,(r+kenar)*hucre,hucre,hucre);
}
/* Kişinin vCard 3.0 metni (fotoğrafsız; QR kapasitesi ve telefon kamerası uyumu için) */
function qrVcfMetni(r){
  const o=secenekler();o.dahil=Object.assign({},o.dahil,{photo:false});o.dispSablon=o.dispSablon||'';
  return vcfKart(r,'3.0',o).join('\r\n')+'\r\n';
}
function qrGoster(i){
  const r=D.satirlar[i];if(!r)return;
  const metin=qrVcfMetni(r);
  $('qrBaslik').textContent=(r.name||r.disp||'(adsız)');
  let q;
  try{q=qrUret(metin)}
  catch(e){
    $('qrCanvas').hidden=true;$('qrDl').disabled=true;
    $('qrBilgi').textContent='Bu kişinin bilgileri QR koda sığmıyor ('+new TextEncoder().encode(metin).length+' bayt). Not/adres gibi uzun alanları kısaltın veya alanları rehberden çıkarın.';
    $('qrDlg').showModal();return;
  }
  $('qrCanvas').hidden=false;$('qrDl').disabled=false;
  qrCiz(q,$('qrCanvas'),6,4);
  $('qrBilgi').textContent=new TextEncoder().encode(metin).length+' bayt · vCard 3.0, fotoğrafsız. Telefon kamerası ile okutunca kişi eklenir.';
  $('qrDl').onclick=()=>$('qrCanvas').toBlob(b=>indir(b,guvenliAd((r.name||'kisi'))+'_qr.png'));
  $('qrDlg').showModal();
  return q;
}

/* Yazdırılabilir rehber: sayfaya geçici bir alan ekler; yazdırma stilinde yalnızca bu alan görünür */
function yazdirHazirla(){
  const o=secenekler(),sat=grupSatirlari($('grupSec').value);
  const eski=document.getElementById('yazdirAlani');if(eski)eski.remove();
  const dahil=k=>!o.dahil||o.dahil[k]!==false;
  const gruplar=new Map();
  sat.forEach(r=>{if(!String(r.name||r.disp).trim())return;const g=String(r.cat).trim()||'(Grupsuz)';if(!gruplar.has(g))gruplar.set(g,[]);gruplar.get(g).push(r)});
  const sirala=(a,b)=>String(a.name||a.disp).localeCompare(String(b.name||b.disp),'tr');
  let h='<h1>Telefon rehberi</h1><p class="yz-alt">'+new Date().toLocaleDateString('tr-TR')+' · '+[...gruplar.values()].reduce((t,x)=>t+x.length,0)+' kişi</p>';
  [...gruplar.keys()].sort((a,b)=>a.localeCompare(b,'tr')).forEach(g=>{
    h+='<h2>'+esc(g)+'</h2><table><thead><tr><th>Ad Soyad</th><th>Unvan</th><th>Birim</th><th>Telefon</th><th>E-posta</th></tr></thead><tbody>';
    gruplar.get(g).sort(sirala).forEach(r=>{
      const tel=[];
      [['cell','Mobil'],['work','İş'],['home','Ev']].forEach(([k,e])=>{if(dahil(k)){const v=telDeger(r,k,o);if(v)tel.push(e+': '+v)}});
      if(dahil('ext')&&String(r.ext).trim())tel.push('Dahili: '+String(r.ext).trim());
      const mail=[dahil('mail')?r.mail:'',dahil('mail2')?r.mail2:''].filter(x=>String(x).trim()).join('<br>');
      h+='<tr><td>'+esc(r.name||r.disp)+'</td><td>'+esc(dahil('title')?r.title:'')+'</td><td>'+esc(dahil('org')?r.org:'')+'</td><td>'+tel.map(esc).join('<br>')+'</td><td>'+(mail?mail.split('<br>').map(esc).join('<br>'):'')+'</td></tr>';
    });
    h+='</tbody></table>';
  });
  const el=document.createElement('div');el.id='yazdirAlani';el.innerHTML=h;
  document.body.appendChild(el);
  return el;
}
function rehberYazdir(){
  if(!D.satirlar.length){say('msg','Liste boş.','warn');return}
  const el=yazdirHazirla();
  window.addEventListener('afterprint',()=>{el.remove()},{once:true});
  window.print();
}
