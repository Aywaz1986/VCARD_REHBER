/* ===== 11 Kaynak: Özlük veritabanı (SQLite, sql.js) =====
   Kaynak sözleşmesi: kaynak, listeye {ALANLAR anahtarları + _img} biçiminde satırlar verir
   (bkz. docs/MIMARI.md "Kaynak sözleşmesi"). SQL Server kaynağı da aynı biçimi üretecek. */
let _SQL=null;
async function sqlHazir(){
  if(_SQL)return _SQL;
  const bin=Uint8Array.from(atob(window.SQLWASM_B64),c=>c.charCodeAt(0));
  _SQL=await initSqlJs({wasmBinary:bin});
  return _SQL;
}
const kot=s=>'"'+String(s).replace(/"/g,'""')+'"';

async function sqliteDosyaAc(file){
  try{
    const bayt=new Uint8Array(await file.arrayBuffer());
    const baslik=String.fromCharCode.apply(null,bayt.subarray(0,15));
    if(baslik!=='SQLite format 3'){
      say('msgKaynak','Bu dosya şifresiz bir SQLite veritabanı değil (şifreli olabilir). Özlük\'ten şifresiz bir kopya dışa aktarın.','bad');
      return;
    }
    const SQL=await sqlHazir();
    if(D.sq&&D.sq.db)try{D.sq.db.close()}catch(_){}
    const db=new SQL.Database(bayt);
    const tablolar={};
    const r=db.exec("SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name");
    (r[0]?r[0].values:[]).forEach(([ad])=>{
      const c=db.exec('PRAGMA table_info('+kot(ad)+')');
      tablolar[ad]=(c[0]?c[0].values:[]).map(x=>x[1]);
    });
    const adlar=Object.keys(tablolar);
    if(!adlar.length){say('msgKaynak','Veritabanında tablo bulunamadı.','warn');return}
    D.sq={db,tablolar,tablo:''};
    const sel=$('sqTablo');
    sel.innerHTML=adlar.map(a=>'<option>'+esc(a)+'</option>').join('');
    sel.disabled=false;
    sel.value=adlar.find(a=>a.toLowerCase()==='personeller')||adlar[0];
    $('sqBilgi').textContent=file.name+' — '+adlar.length+' tablo';
    sqliteTabloSec(sel.value);
    $('eslesPanel').hidden=false;
    eslesKayitliYenile();
    say('msgKaynak','Veritabanı açıldı. Alanları eşleştirip "Kayıtları yükle"ye basın.','ok');
  }catch(e){say('msgKaynak','Veritabanı açılamadı: '+e.message,'bad')}
}

function sqliteTabloSec(ad){
  D.sq.tablo=ad;
  const cols=D.sq.tablolar[ad]||[];
  const secenek='<option value="">— eşleştirme yok —</option>'+cols.map(c=>'<option>'+esc(c)+'</option>').join('');
  let h='<div class="h">Rehber alanı</div><div class="h">Veritabanı sütunu</div><div class="h">veya şablon ( {sütun} yer tutucu )</div>';
  ALANLAR.forEach(a=>{
    h+='<div>'+esc(a.e)+(a.zorunlu&&a.k==='name'?' <b class="bad">*</b>':'')+'</div>'
      +'<select data-map="'+a.k+'">'+secenek+'</select>'
      +'<input type="text" data-sab="'+a.k+'" placeholder="'+(a.k==='name'?'örn. {adi} {soyadi}':'')+'">';
  });
  $('eslesGrid').innerHTML=h;
  $('sfSutun').innerHTML=secenek.replace('— eşleştirme yok —','— sütun seç —');
  $('sfOp').value='';$('sfDeger').value='';
}
function eslesOku(){
  const m={};
  ALANLAR.forEach(a=>{
    const col=document.querySelector('[data-map="'+a.k+'"]').value;
    const sab=document.querySelector('[data-sab="'+a.k+'"]').value.trim();
    if(col||sab)m[a.k]={col,sab};
  });
  return m;
}
function eslesYaz(m){
  const cols=D.sq?D.sq.tablolar[D.sq.tablo]||[]:[];
  ALANLAR.forEach(a=>{
    const s=document.querySelector('[data-map="'+a.k+'"]'),t=document.querySelector('[data-sab="'+a.k+'"]');
    const v=m&&m[a.k]?m[a.k]:{col:'',sab:''};
    s.value=cols.includes(v.col)?v.col:'';
    t.value=v.sab||'';
  });
}
/* Sütun adına göre öneri. Adres (ev adresi) kişisel veri olduğu için önerilmez. */
const ONERI={
  name:['adisoyadi','adsoyad','isimsoyisim','tamad','isim'],
  cell:['gsmno','gsm','ceptelefonu','cep','mobil'],
  work:['istelefonu','istel'],
  ext:['dahili'],
  mail:['email','eposta','mail'],
  mail2:['emailint','epostaint','mailint'],
  org:['bolum','birim','departman'],
  title:['unvan','pozisyon','gorev'],
  bday:['dogumtarihi','dogum'],
  photo:['foto','fotograf','resim']
};
function eslesOner(){
  const cols=D.sq.tablolar[D.sq.tablo]||[],m={};
  Object.keys(ONERI).forEach(k=>{
    for(const aday of ONERI[k]){
      const c=cols.find(x=>anahtar(x)===aday);
      if(c){m[k]={col:c,sab:''};break}
    }
  });
  eslesYaz(m);
}

/* ----- kayıtlı eşleştirmeler (localStorage) ----- */
function lsOku(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
function lsYaz(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}}
function eslesKayitliYenile(){
  const k=lsOku(LS_ESLESME)||{};
  $('eslesKayitli').innerHTML='<option value="">Kayıtlı eşleştirmeler…</option>'+Object.keys(k).map(a=>'<option>'+esc(a)+'</option>').join('');
}
function eslesKaydet(){
  const ad=(prompt('Eşleştirme adı:','')||'').trim();if(!ad)return;
  const k=lsOku(LS_ESLESME)||{};
  k[ad]={tablo:D.sq.tablo,map:eslesOku()};
  if(!lsYaz(LS_ESLESME,k))say('msgKaynak','Eşleştirme bu tarayıcıda saklanamadı.','warn');
  eslesKayitliYenile();$('eslesKayitli').value=ad;
}
function eslesKayitUygula(){
  const ad=$('eslesKayitli').value;if(!ad)return;
  const k=(lsOku(LS_ESLESME)||{})[ad];if(!k)return;
  if(D.sq.tablolar[k.tablo]&&D.sq.tablo!==k.tablo){$('sqTablo').value=k.tablo;sqliteTabloSec(k.tablo)}
  eslesYaz(k.map);
}
function eslesKayitSil(){
  const ad=$('eslesKayitli').value;if(!ad)return;
  const k=lsOku(LS_ESLESME)||{};delete k[ad];lsYaz(LS_ESLESME,k);eslesKayitliYenile();
}

/* ----- kayıtları okuma ----- */
function mimeBul(b){
  if(b[0]===0xFF&&b[1]===0xD8)return 'image/jpeg';
  if(b[0]===0x89&&b[1]===0x50)return 'image/png';
  if(b[0]===0x47&&b[1]===0x49)return 'image/gif';
  if(b[0]===0x52&&b[1]===0x49)return 'image/webp';
  return 'image/jpeg';
}
async function sqliteYukle(){
  if(!D.sq)return;
  const tablo=D.sq.tablo,cols=D.sq.tablolar[tablo]||[],map=eslesOku();
  if(!map.name){say('msgKaynak','"Adı Soyadı" alanını eşleştirmeniz gerekir.','warn');return}
  const gerek=[],hatali=[];
  const ekle=c=>{if(!gerek.includes(c))gerek.push(c)};
  ALANLAR.forEach(a=>{
    const m=map[a.k];if(!m)return;
    if(m.sab&&a.k!=='photo'||(m.sab&&!m.col)){
      m.sab.replace(/\{([^}]+)\}/g,(x,c)=>{c=c.trim();if(cols.includes(c))ekle(c);else hatali.push(c);return ''});
    }else if(m.col)ekle(m.col);
  });
  if(hatali.length){say('msgKaynak','Şablonda tabloda olmayan sütun var: '+hatali.join(', '),'bad');return}
  if(!gerek.length){say('msgKaynak','Hiçbir sütun eşleştirilmedi.','warn');return}
  // süzgeç (parametreli; ham SQL alınmaz)
  let where='',par=[];
  const sc=$('sfSutun').value,op=$('sfOp').value,dg=$('sfDeger').value;
  if(sc&&op){
    const c=kot(sc),m='TRIM(CAST('+c+" AS TEXT))";
    if(op==='bos')where=' WHERE ('+c+' IS NULL OR '+m+"='')";
    else if(op==='dolu')where=' WHERE ('+c+' IS NOT NULL AND '+m+"<>'')";
    else if(op==='esit'){where=' WHERE '+m+'=?';par=[dg.trim()]}
    else if(op==='esitdegil'){where=' WHERE ('+c+' IS NULL OR '+m+'<>?)';par=[dg.trim()]}
    else if(op==='icerir'){where=' WHERE CAST('+c+' AS TEXT) LIKE ?';par=['%'+dg+'%']}
  }
  say('msgKaynak','Okunuyor…','');
  const sql='SELECT '+gerek.map(kot).join(',')+' FROM '+kot(tablo)+where;
  const satirlar=[],fotolar=[];
  try{
    const st=D.sq.db.prepare(sql);
    if(par.length)st.bind(par);
    while(st.step()){
      const dizi=st.get(),h={};
      gerek.forEach((c,i)=>h[c]=dizi[i]);
      const r=bosSatir();
      ALANLAR.forEach(a=>{
        const m=map[a.k];if(!m)return;
        let v;
        if(a.k==='photo'&&m.col&&h[m.col] instanceof Uint8Array){
          if(h[m.col].length)fotolar.push({i:satirlar.length,b:h[m.col]});
          return;
        }
        if(m.sab&&(a.k!=='photo'||!m.col))v=m.sab.replace(/\{([^}]+)\}/g,(x,c)=>{const z=h[c.trim()];return z==null?'':String(z)}).replace(/\s+/g,' ').trim();
        else v=h[m.col];
        if(a.k==='bday'){const b=bdayNorm(v);r.bday=(b===null)?String(v):b;}
        else r[a.k]=hucreMetni(v);
      });
      satirlar.push(r);
    }
    st.free();
  }catch(e){say('msgKaynak','Sorgu hatası: '+e.message,'bad');return}
  let fotoSay=0;
  for(let i=0;i<fotolar.length;i++){
    try{
      const f=fotolar[i];
      satirlar[f.i]._img=await toJpeg200(new Blob([f.b],{type:mimeBul(f.b)}));
      satirlar[f.i].photo='(veritabanı)';fotoSay++;
    }catch(_){}
    if(i%20===0)say('msgKaynak','Fotoğraflar işleniyor… '+(i+1)+'/'+fotolar.length,'');
  }
  listeyeYaz(satirlar,modOku());
  $('sqSonuc').textContent=satirlar.length+' kayıt'+(fotoSay?', '+fotoSay+' fotoğraf':'');
  say('msgKaynak',satirlar.length+' kayıt yüklendi ("'+tablo+'" tablosu).','ok');
}
