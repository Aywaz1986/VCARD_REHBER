/* ===== 41 Toplu düzeltme (önizlemeli) ===== */
const METIN_ALANLARI=['name','disp','addr','org','title','cat','note','nick','city','zip','url'];
let _duzeltmeler=[];

function duzeltmeSecenekleri(){
  return {
    bosluk:$('duzBosluk').checked,ad:$('duzAd').value,mail:$('duzMail').checked,tel:$('duzTel').checked,
    sozluk:$('duzUnvan').checked?sozlukAyristir($('unvanSozluk').value):[]
  };
}
/* Her alan için tek bir nihai değer üretir; değişiklik varsa listeye ekler. */
function duzeltmeUret(o){
  const ch=[];
  D.satirlar.forEach((r,i)=>{
    ALANLAR.forEach(a=>{
      const k=a.k;if(k==='photo'||k==='bday')return;
      const eski=String(r[k]==null?'':r[k]);let yeni=eski;
      if(o.bosluk&&METIN_ALANLARI.concat(['mail','mail2','cell','work','fax','home','ext']).includes(k))yeni=bosluklariTemizle(yeni);
      if((k==='name'||k==='disp')&&o.ad!=='yok')yeni=adBicimle(yeni,o.ad);
      if((k==='mail'||k==='mail2')&&o.mail&&yeni)yeni=epostaTemizle(yeni);
      if(a.tel&&o.tel&&yeni){const t=telNorm(yeni);if(t.ok)yeni=t.v}
      if((k==='title'||k==='org')&&o.sozluk.length)yeni=sozlukUygula(yeni,o.sozluk);
      if(yeni!==eski)ch.push({i,k,eski,yeni,sec:true});
    });
  });
  return ch;
}
function duzeltmeOnizle(){
  _duzeltmeler=duzeltmeUret(duzeltmeSecenekleri());
  const el=$('duzSonuc'),n=_duzeltmeler.length,goster=_duzeltmeler.slice(0,300);
  $('duzUygula').disabled=!n;
  if(!n){el.innerHTML='<p class="ok">Düzeltilecek bir şey bulunmadı.</p>';return}
  el.innerHTML='<p><b>'+n+' değişiklik</b> önerildi'+(n>300?' (ilk 300 gösteriliyor, kalanlar da uygulanır)':'')+'. İstemediklerinizin işaretini kaldırın.</p>'
    +'<div class="tw" style="max-height:320px"><table><thead><tr><th></th><th>#</th><th>Alan</th><th>Eski</th><th>Yeni</th></tr></thead><tbody>'
    +goster.map((c,j)=>'<tr><td><input type="checkbox" data-duz="'+j+'" checked></td><td class="n">'+(c.i+1)+'</td><td>'+esc(ALANLAR.find(a=>a.k===c.k).e)+'</td><td style="padding:4px 8px">'+esc(c.eski)+'</td><td style="padding:4px 8px"><b>'+esc(c.yeni)+'</b></td></tr>').join('')
    +'</tbody></table></div>';
}
function duzeltmeUygula(){
  document.querySelectorAll('[data-duz]').forEach(c=>{_duzeltmeler[+c.dataset.duz].sec=c.checked});
  let n=0;
  _duzeltmeler.forEach(c=>{
    if(!c.sec)return;
    const r=D.satirlar[c.i];
    if(r&&r[c.k]===c.eski){r[c.k]=c.yeni;n++}
  });
  _duzeltmeler=[];$('duzUygula').disabled=true;
  tabloCiz();grupListesiYenile();otoSaklaYaz();
  $('duzSonuc').innerHTML='<p class="ok">'+n+' değişiklik uygulandı.</p>';
  return n;
}
function sozlukKaydet(){lsYaz(LS_SOZLUK,$('unvanSozluk').value)}
function sozlukYukle(){const v=lsOku(LS_SOZLUK);if(typeof v==='string')$('unvanSozluk').value=v}
