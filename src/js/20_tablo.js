/* ===== 20 Liste tablosu (sayfalı, düzenlenebilir) ===== */
function gorunenIdx(){
  const q=anahtar($('q').value);
  const out=[];
  D.satirlar.forEach((r,i)=>{
    if(q&&!ALANLAR.some(a=>a.k!=='photo'&&anahtar(r[a.k]).indexOf(q)>=0))return;
    out.push(i);
  });
  return out;
}
function bdayHatali(r){return r.bday!==''&&!/^\d{8}$/.test(r.bday)}
function tabloCiz(){
  const idx=gorunenIdx(),boy=D.sayfaBoyu;
  const sayfaSay=Math.max(1,Math.ceil(idx.length/boy));
  if(D.sayfa>=sayfaSay)D.sayfa=sayfaSay-1;
  if(D.sayfa<0)D.sayfa=0;
  const dilim=idx.slice(D.sayfa*boy,D.sayfa*boy+boy);
  let h='<thead><tr><th>#</th>'+ALANLAR.map(a=>'<th>'+esc(a.e)+'</th>').join('')+'<th></th></tr></thead><tbody>';
  dilim.forEach(i=>{
    const r=D.satirlar[i];
    h+='<tr data-i="'+i+'"><td class="n">'+(i+1)+'</td>';
    ALANLAR.forEach(a=>{
      const k=a.k;
      if(k==='photo'){
        h+='<td class="ph">'+(r._img?'<img alt="" src="'+r._img+'">':'')+'<span class="fn" title="'+esc(r.photo)+'">'+esc(r.photo)+'</span> <button data-pick="'+i+'" title="Fotoğraf seç">📷</button></td>';
      }else{
        const hata=(k==='bday'&&bdayHatali(r));
        h+='<td'+(hata?' class="err"':'')+'><input type="text" data-k="'+k+'" value="'+esc(r[k])+'"></td>';
      }
    });
    h+='<td><button data-qr="'+i+'" title="Tek kişilik QR kod">📱</button> <button class="dng" data-del="'+i+'" title="Satırı sil">✕</button></td></tr>';
  });
  $('tbl').innerHTML=h+'</tbody>';
  $('cnt').textContent='— '+D.satirlar.length+' kişi'+(idx.length!==D.satirlar.length?' ('+idx.length+' eşleşen)':'');
  $('pgBilgi').textContent='Sayfa '+(D.sayfa+1)+' / '+sayfaSay;
  $('pgOnce').disabled=D.sayfa<=0;
  $('pgSonra').disabled=D.sayfa>=sayfaSay-1;
}
function satirGit(i){
  $('q').value='';
  D.sayfa=Math.floor(i/D.sayfaBoyu);
  tabloCiz();
  const tr=document.querySelector('#tbl tr[data-i="'+i+'"]');
  if(tr){tr.scrollIntoView({block:'center'});tr.classList.add('flash');setTimeout(()=>tr.classList.remove('flash'),1800)}
}
function tabloOlaylari(){
  const t=$('tbl');
  t.addEventListener('input',e=>{
    const inp=e.target;if(!inp.dataset.k)return;
    const i=+inp.closest('tr').dataset.i,r=D.satirlar[i];
    if(inp.dataset.k==='bday'){
      const n=bdayNorm(inp.value);
      r.bday=(n===null||n==='')?inp.value:n;
      inp.closest('td').classList.toggle('err',inp.value!==''&&n===null);
    }else r[inp.dataset.k]=inp.value;
    otoSaklaYaz();
  });
  t.addEventListener('change',e=>{
    if(e.target.dataset.k==='bday'){const i=+e.target.closest('tr').dataset.i;e.target.value=D.satirlar[i].bday}
    if(e.target.dataset.k==='cat')grupListesiYenile();
  });
  t.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.qr!==undefined){qrGoster(+b.dataset.qr);return}
    if(b.dataset.del!==undefined){D.satirlar.splice(+b.dataset.del,1);tabloCiz();grupListesiYenile();otoSaklaYaz()}
    if(b.dataset.pick!==undefined){
      const f=document.createElement('input');f.type='file';f.accept='image/*';
      f.onchange=()=>{if(f.files[0])fotoAta(+b.dataset.pick,f.files[0],true)};
      f.click();
    }
  });
  $('q').addEventListener('input',()=>{D.sayfa=0;tabloCiz()});
  $('addBtn').onclick=()=>{
    D.satirlar.push(bosSatir());
    D.sayfa=Math.floor((D.satirlar.length-1)/D.sayfaBoyu);$('q').value='';
    tabloCiz();const w=document.querySelector('.tw');w.scrollTop=w.scrollHeight;otoSaklaYaz();
  };
  $('clrBtn').onclick=()=>{
    if(D.satirlar.length&&!confirm('Tüm liste silinsin mi?'))return;
    D.satirlar=[];D.sayfa=0;tabloCiz();grupListesiYenile();otoSaklaYaz();say('msgKaynak','');
  };
  $('pgOnce').onclick=()=>{D.sayfa--;tabloCiz()};
  $('pgSonra').onclick=()=>{D.sayfa++;tabloCiz()};
  $('pgBoyut').onchange=e=>{D.sayfaBoyu=+e.target.value;D.sayfa=0;tabloCiz()};
}
