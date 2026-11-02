/* ===== 04 Metin kalitesi (saf fonksiyonlar: arayüze bağlı değil) ===== */

/* Görünmez karakterler, NBSP, çift boşluk, baş/son boşluk */
function bosluklariTemizle(s){
  return String(s==null?'':s).replace(/[​-‍﻿⁠]/g,'').replace(/[  -   　\t]/g,' ')
    .replace(/[ ]{2,}/g,' ').replace(/ *\n */g,'\n').trim();
}
/* Ad biçimi: 'yok' | 'ilk' (Ayşe Çağlar Öztürk) | 'soyad' (Ayşe Çağlar ÖZTÜRK) | 'buyuk' (AYŞE ÇAĞLAR ÖZTÜRK) */
function adBicimle(s,mod){
  s=String(s==null?'':s).trim();
  if(!s||mod==='yok'||!mod)return s;
  const ust=x=>x.toLocaleUpperCase('tr'),alt=x=>x.toLocaleLowerCase('tr');
  if(mod==='buyuk')return ust(s);
  const parcalar=s.split(/([\s\-'’.]+)/);                 // ayraçlar korunur
  const kelimeIdx=[];parcalar.forEach((p,i)=>{if(i%2===0&&p)kelimeIdx.push(i)});
  const basHarf=p=>ust(p.charAt(0))+alt(p.slice(1));
  kelimeIdx.forEach((i,n)=>{
    const sonKelime=n===kelimeIdx.length-1&&kelimeIdx.length>1;
    parcalar[i]=(mod==='soyad'&&sonKelime)?ust(parcalar[i]):basHarf(parcalar[i]);
  });
  return parcalar.join('');
}
function epostaTemizle(s){
  return String(s==null?'':s).replace(/^mailto:/i,'').replace(/[\s​-‍﻿ ]+/g,'').replace(/[;,]+$/,'').toLowerCase();
}
/* Sözlük metni ("Muh.=Mühendis" satırları) -> [[kaynak,hedef]] */
function sozlukAyristir(metin){
  return String(metin||'').split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&l.indexOf('=')>0&&l.charAt(0)!=='#')
    .map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}).filter(x=>x[0]);
}
/* Tüm sözcük eşleşmesi (Türkçe büyük/küçük harf duyarsız); eşleşme metinde bulunduğu yerde değiştirilir */
function sozlukUygula(s,kurallar){
  s=String(s==null?'':s);
  kurallar.forEach(([kaynak,hedef])=>{
    const alt=s.toLocaleLowerCase('tr'),k=kaynak.toLocaleLowerCase('tr');
    let bas=0,sonuc='',i;
    const harf=/[\p{L}\p{N}]/u;
    while((i=alt.indexOf(k,bas))>=0){
      const once=i>0?alt.charAt(i-1):'',sonra=i+k.length<alt.length?alt.charAt(i+k.length):'';
      const sinirOnce=!once||!harf.test(once),sinirSonra=!sonra||!harf.test(sonra)||/[.]$/.test(k);
      if(sinirOnce&&sinirSonra){sonuc+=s.slice(bas,i)+hedef;bas=i+k.length}
      else{sonuc+=s.slice(bas,i+1);bas=i+1}
    }
    s=sonuc+s.slice(bas);
  });
  return s;
}
/* Benzer ad bulma yardımcıları */
function adSozcukleri(s){
  return String(s||'').toLocaleLowerCase('tr').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u')
    .split(/[^a-z0-9]+/).filter(Boolean);
}
function adSiraliAnahtar(s){return adSozcukleri(s).sort().join(' ')}
/* Levenshtein uzaklığı en fazla maks mı? (erken çıkışlı) */
function uzaklikEnFazla(a,b,maks){
  if(a===b)return true;
  if(Math.abs(a.length-b.length)>maks)return false;
  let onceki=Array.from({length:b.length+1},(_,j)=>j);
  for(let i=1;i<=a.length;i++){
    const cur=[i];let min=i;
    for(let j=1;j<=b.length;j++){
      const v=Math.min(onceki[j]+1,cur[j-1]+1,onceki[j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));
      cur.push(v);if(v<min)min=v;
    }
    if(min>maks)return false;
    onceki=cur;
  }
  return onceki[b.length]<=maks;
}
