/* ===== 02 Yardımcılar ===== */
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function say(id,t,c){const m=$(id);if(!m)return;m.textContent=t;m.className='msg '+(c||'')}
function bosSatir(){const r={_img:null};ALANLAR.forEach(a=>r[a.k]='');return r}
function dosyaAdi(p){return String(p||'').split(/[\\/]/).pop().trim()}
/* Türkçe karakterleri sadeleştirip karşılaştırma anahtarı üretir */
function anahtar(s){
  return String(s||'').toLocaleLowerCase('tr').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i')
    .replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9]/g,'');
}
function uzantisiz(ad){return String(ad||'').replace(/\.[^.]+$/,'')}

/* Doğum tarihi: Excel seri no / Date / metin -> YYYYMMDD ; geçersizse null ; boşsa '' */
function bdayNorm(v){
  if(v===''||v==null)return '';
  if(typeof v==='number'&&v>1&&v<100000){ // Excel seri numarası (UTC: saat dilimi kayması olmasın)
    const d=new Date(Math.round((v-25569)*86400000));
    return d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate());
  }
  if(v instanceof Date&&!isNaN(v))return v.getFullYear()+pad(v.getMonth()+1)+pad(v.getDate());
  const s=String(v).trim();let m;
  if(s==='')return '';
  if(m=s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/))return gecerliTarih(m[3],m[2],m[1]);
  if(m=s.match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})/))return gecerliTarih(m[1],m[2],m[3]);
  if(/^\d{8}$/.test(s))return gecerliTarih(s.slice(0,4),s.slice(4,6),s.slice(6));
  return null;
}
function gecerliTarih(y,m,d){
  y=+y;m=+m;d=+d;
  const t=new Date(Date.UTC(y,m-1,d));
  if(y<1800||y>2200||t.getUTCFullYear()!==y||t.getUTCMonth()!==m-1||t.getUTCDate()!==d)return null;
  return y+pad(m)+pad(d);
}
function hucreMetni(v){
  if(v==null)return '';
  if(v instanceof Date)return bdayNorm(v)||'';
  return String(v).replace(/_x000D_/g,'').replace(/\r\n?/g,'\n').replace(/\n{2,}/g,'\n').trim();
}

/* Telefon: Türkiye biçimine çevirir. {ok, v}. 3-6 haneli kısa/dahili numaralar olduğu gibi geçerli sayılır. */
function telNorm(s){
  s=String(s==null?'':s).trim();
  if(!s)return {ok:true,v:''};
  let arti=s.charAt(0)==='+',d=s.replace(/\D/g,'');
  if(!d)return {ok:false,v:s};
  if(s.indexOf('00')===0&&!arti){arti=true;d=d.slice(2);}
  if(arti)return (d.length>=8&&d.length<=15)?{ok:true,v:'+'+d}:{ok:false,v:s};
  if(d.length>=3&&d.length<=6)return {ok:true,v:d};
  if(d.length===12&&d.indexOf('90')===0)return {ok:true,v:'+'+d};
  if(d.length===11&&d.charAt(0)==='0')d=d.slice(1);
  if(d.length===10)return {ok:true,v:'+90'+d};
  return {ok:false,v:s};
}
function epostaGecerli(s){return /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]{2,}$/.test(String(s||'').trim())}

/* ----- indirme ----- */
function indir(blob,ad){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=ad;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
}
function metinBlob(t,tip){return new Blob([t],{type:(tip||'text/plain')+';charset=utf-8'})}
function guvenliAd(s){return String(s||'grupsuz').replace(/[\\/:*?"<>|]/g,'_').trim()||'grupsuz'}

/* ----- CRC32 + yalnızca "store" yöntemli ZIP (bağımlılıksız) ----- */
let _crcTablo=null;
function crc32(u8){
  if(!_crcTablo){_crcTablo=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;_crcTablo[n]=c>>>0}}
  let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=_crcTablo[(c^u8[i])&0xFF]^(c>>>8);
  return (c^0xFFFFFFFF)>>>0;
}
function zipOlustur(dosyalar){ // dosyalar: [{ad, veri:Uint8Array}]
  const enc=new TextEncoder(),parca=[],merkez=[];let ofs=0;
  const d=new Date(),dosTarih=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),dosSaat=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
  dosyalar.forEach(f=>{
    const ad=enc.encode(f.ad),crc=crc32(f.veri),n=f.veri.length;
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);
    lh.setUint16(10,dosSaat,true);lh.setUint16(12,dosTarih,true);lh.setUint32(14,crc,true);
    lh.setUint32(18,n,true);lh.setUint32(22,n,true);lh.setUint16(26,ad.length,true);lh.setUint16(28,0,true);
    parca.push(new Uint8Array(lh.buffer),ad,f.veri);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);
    ch.setUint16(10,0,true);ch.setUint16(12,dosSaat,true);ch.setUint16(14,dosTarih,true);ch.setUint32(16,crc,true);
    ch.setUint32(20,n,true);ch.setUint32(24,n,true);ch.setUint16(28,ad.length,true);ch.setUint32(42,ofs,true);
    merkez.push(new Uint8Array(ch.buffer),ad);
    ofs+=30+ad.length+n;
  });
  const mBoy=merkez.reduce((t,x)=>t+x.length,0);
  const son=new DataView(new ArrayBuffer(22));
  son.setUint32(0,0x06054b50,true);son.setUint16(8,dosyalar.length,true);son.setUint16(10,dosyalar.length,true);
  son.setUint32(12,mBoy,true);son.setUint32(16,ofs,true);
  return new Blob(parca.concat(merkez,[new Uint8Array(son.buffer)]),{type:'application/zip'});
}
