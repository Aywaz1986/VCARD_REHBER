/* ===== 10 Kaynak: Excel / CSV ===== */
function excelDosyaYukle(file){
  const rd=new FileReader();
  rd.onload=e=>{
    try{
      D.wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
      const adlar=D.wb.SheetNames,sel=$('sheetSel');
      sel.innerHTML=adlar.map(n=>'<option>'+esc(n)+'</option>').join('');
      sel.hidden=adlar.length<2;
      const tercih=adlar.find(n=>n.toLowerCase()==='liste')||adlar[0];
      sel.value=tercih;
      excelSayfaOku(tercih);
    }catch(err){say('msgKaynak','Dosya okunamadı: '+err.message,'bad')}
  };
  rd.readAsArrayBuffer(file);
}
/* ----- sütun eşleştirme: başlıklardan otomatik, kullanıcı düzeltebilir ----- */
const EX_ES={
  name:['adsoyad','adisoyadi','isimsoyisim','tamad','personeladi','personel','kisi','fullname'],
  disp:['gorunenad','gorunenisim','displayname','kisaad'],
  cell:['ceptel','ceptelno','mobilno','mobiltel','mobilnumara','cepnumarasi','telefonnumarasi','mobil','mobiltelefon','cep','ceptelefonu','cepno','gsm','gsmno','telefon','tel','telefonno','mobile','cellphone'],
  work:['is','istel','istelefon','istelefonu','workphone','kurumsaltelefon','sabittelefon'],
  fax:['fax','faks'],
  home:['ev','evtel','evtelefon','evtelefonu','homephone'],
  mail:['mail','eposta','epostaadresi','email','emailadresi','mailadresi','kurummaili'],
  addr:['adres','adresi','evadresi','address'],
  org:['firma','firmabolge','kurum','bolum','birim','departman','sirket','organization','company','mudurluk'],
  title:['unvan','gorev','pozisyon','title','kadro'],
  url:['web','website','websitesi','internetsitesi','url'],
  cat:['grup','group','kategori','gruplar'],
  photo:['foto','fotograf','resim','photo','fotografdosyaadi'],
  bday:['bday','dogumtarihi','dogum','birthday','dogumtarihibday'],
  mail2:['ikincieposta','eposta2','mail2','email2','kisiselmail','digermail'],
  ext:['dahili','dahilino','dahilinumara'],
  nick:['takmaad','lakap','nickname'],
  note:['not','notlar','aciklama'],
  city:['sehir','ilce','sehirilce','il'],
  zip:['postakodu','pk','zip','postakod']
};
const EX_AD=['ad','adi','isim','firstname','name'],EX_SOYAD=['soyad','soyadi','soyisim','surname','lastname'];
function exNorm(s){
  return String(s==null?'':s).toLocaleLowerCase('tr').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9]/g,'');
}
/* başlıklar -> {map:{alan:sütunNo}, soyad:sütunNo|-1, guven:{alan:'tam'|'tahmin'|'sira'}} */
function excelOtoEsle(bas){
  const nb=bas.map(exNorm),kul=new Set(),map={},guven={};
  const es={};ALANLAR.forEach(a=>{es[a.k]=(EX_ES[a.k]||[]).concat([exNorm(a.e)])});
  ALANLAR.forEach(a=>{ // 1. geçiş: tam eşleşme
    const j=nb.findIndex((h,i)=>h&&!kul.has(i)&&es[a.k].includes(h));
    if(j>=0){map[a.k]=j;guven[a.k]='tam';kul.add(j)}
  });
  const tamKolon=new Set();nb.forEach((h,i)=>{if(h&&(ALANLAR.some(a=>es[a.k].includes(h))||EX_AD.includes(h)||EX_SOYAD.includes(h)))tamKolon.add(i)});
  ALANLAR.forEach(a=>{ // 2. geçiş: başlık eşanlamlıyı içeriyorsa (tahmin)
    if(map[a.k]!==undefined)return;
    const j=nb.findIndex((h,i)=>h&&!kul.has(i)&&!tamKolon.has(i)&&es[a.k].some(x=>x.length>=4&&h.includes(x)));
    if(j>=0){map[a.k]=j;guven[a.k]='tahmin';kul.add(j)}
  });
  let soyad=nb.findIndex((h,i)=>!kul.has(i)&&EX_SOYAD.includes(h));
  if(map.name===undefined){ // "Ad" + "Soyad" ayrı sütunlar
    const j=nb.findIndex((h,i)=>!kul.has(i)&&EX_AD.includes(h));
    if(j>=0){map.name=j;guven.name='tam';kul.add(j)}
  }
  if(soyad>=0&&map.name!==undefined)kul.add(soyad);else soyad=-1;
  return {map,soyad,guven};
}
function excelSiraEsle(){
  const map={},guven={};ALANLAR.forEach((a,k)=>{map[a.k]=k;guven[a.k]='sira'});
  return {map,soyad:-1,guven};
}
function excelSatirlar(){
  const X=D.ex,out=[];
  for(let i=1;i<X.veri.length;i++){
    const d=X.veri[i];
    if(!d.some(x=>String(x).trim()!==''))continue;
    const r=bosSatir();
    ALANLAR.forEach(a=>{
      const c=X.es.map[a.k];if(c===undefined||c<0)return;
      if(a.k==='bday'){const b=bdayNorm(d[c]);r.bday=(b===null)?String(d[c]):b;}
      else r[a.k]=hucreMetni(d[c]);
    });
    if(X.es.soyad>=0){r.name=(r.name+' '+hucreMetni(d[X.es.soyad])).replace(/\s+/g,' ').trim()}
    out.push(r);
  }
  return out;
}
function excelYukle(){
  const X=D.ex,out=excelSatirlar();
  const so=listeyeYaz(out,modOku(),true);
  const fotoBekl=D.satirlar.filter(r=>r.photo&&!r._img).length;
  const eslesen=Object.keys(X.es.map).filter(k=>X.es.map[k]>=0).length;
  say('msgKaynak',out.length+' kişi okundu ("'+X.ad+'" sayfası).'+ayiklamaNotu(so)+(so.ayiklanan?' Listede '+D.satirlar.length+' kişi var.':'')
    +' '+eslesen+' alan Excel sütunlarıyla eşleştirildi; "Sütun eşleştirme" bölümünden kontrol edin.'
    +(fotoBekl?' '+fotoBekl+' kişide fotoğraf dosya adı var ama resim henüz yüklenmedi: "2. Liste" bölümünden "Fotoğraf klasörü seç" ile resimlerin bulunduğu klasörü seçin.':''),fotoBekl?'warn':'ok');
}
function excelImza(bas){return bas.map(exNorm).join('|')}
function excelPanelCiz(){
  const X=D.ex;if(!X)return;
  $('exPanel').hidden=false;
  const sec=(sel,ekstra)=>'<option value="-1">— eşleştirme yok —</option>'+X.bas.map((b,i)=>'<option value="'+i+'"'+(i===sel?' selected':'')+'>'+XLSX.utils.encode_col(i)+': '+esc(String(b||'(başlıksız)'))+'</option>').join('');
  const ornek=c=>{if(c<0)return '';const v=X.veri[1]?X.veri[1][c]:'';return esc(hucreMetni(v)).slice(0,60)};
  const rozet=g=>g==='tam'?'<span class="ok">✔ başlıktan</span>':g==='tahmin'?'<span class="warn">⚠ tahmin, kontrol edin</span>':g==='sira'?'<span class="warn">⚠ sıraya göre</span>':g==='el'?'<span class="mut">elle seçildi</span>':'<span class="mut">—</span>';
  let h='<div class="h">Rehber alanı</div><div class="h">Excel sütunu</div><div class="h">İlk satırdaki değer · durum</div>';
  ALANLAR.forEach(a=>{
    const c=X.es.map[a.k]===undefined?-1:X.es.map[a.k];
    h+='<div>'+esc(a.e)+(a.k==='name'?' <b class="bad">*</b>':'')+'</div><select data-ex="'+a.k+'">'+sec(c)+'</select><div class="hint">'+ornek(c)+' '+rozet(X.es.guven[a.k])+'</div>';
    if(a.k==='name'){
      h+='<div class="hint">↳ Soyadı (ad ve soyad ayrı sütunsa)</div><select data-ex="_soyad">'+sec(X.es.soyad)+'</select><div class="hint">'+ornek(X.es.soyad)+'</div>';
    }
  });
  $('exGrid').innerHTML=h;
  const yok=X.bas.map((b,i)=>({b,i})).filter(x=>String(x.b).trim()&&!Object.values(X.es.map).includes(x.i)&&x.i!==X.es.soyad);
  $('exNot').textContent=yok.length?'Kullanılmayan sütunlar: '+yok.map(x=>XLSX.utils.encode_col(x.i)+' ('+String(x.b)+')').join(', '):'Tüm sütunlar kullanıldı.';
}
function excelYenidenUygula(kaydet){
  const X=D.ex;if(!X)return;
  D.satirlar=X.oncesi.map(r=>Object.assign({},r));
  excelYukle();excelPanelCiz();
  if(kaydet){const k=lsOku(LS_EXESLESME)||{};k[X.imza]={map:X.es.map,soyad:X.es.soyad};lsYaz(LS_EXESLESME,k)}
}
function excelSayfaOku(ad){
  const ws=D.wb.Sheets[ad];
  const veri=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:'',blankrows:false});
  const bas=(veri[0]||[]).map(x=>String(x==null?'':x).trim());
  const genis=Math.max.apply(null,[bas.length].concat(veri.slice(0,50).map(r=>r.length)));
  while(bas.length<genis)bas.push('');
  const imza=excelImza(bas),kayitli=(lsOku(LS_EXESLESME)||{})[imza];
  let es=excelOtoEsle(bas),not='';
  if(Object.keys(es.map).length<2){es=excelSiraEsle();not='Başlıklar tanınamadı, sütun sırasına göre atandı.'}
  else if(kayitli){es={map:kayitli.map,soyad:kayitli.soyad,guven:Object.fromEntries(Object.keys(kayitli.map).map(k=>[k,'el']))}}
  D.ex={ad,veri,bas,es,imza,oncesi:(modOku()==='ekle'?D.satirlar:[]).map(r=>Object.assign({},r))};
  excelYukle();excelPanelCiz();
  if(not)say('msgKaynak',$('msgKaynak').textContent+' '+not,'warn');
}
function sablonIndir(){
  const ws=XLSX.utils.aoa_to_sheet([
    ALANLAR.map(a=>a.e),
    ['Örnek Kişi','','+905001112233','','','','ornek@mail.com','Adres satırı','Firma','Unvan','','Grup','','05.05.1980','ornek2@mail.com','4101','Takma','Not metni','Ankara','06000']
  ]);
  ws['!cols']=ALANLAR.map(()=>({wch:22}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Liste');
  XLSX.writeFile(wb,'rehber_sablon.xlsx');
}
