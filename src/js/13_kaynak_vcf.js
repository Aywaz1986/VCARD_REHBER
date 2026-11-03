/* ===== 13 Kaynak: .vcf okuma (vCard 2.1 / 3.0 / 4.0) =====
   Hem "içe aktar" sekmesi hem de üretilen çıktının kendini sınaması bu ayrıştırıcıyı kullanır. */
function qpCoz(s,charset){
  const b=[];
  s.replace(/=([0-9A-Fa-f]{2})|(.)/gs,(m,h,c)=>{
    if(h)b.push(parseInt(h,16));else for(const x of new TextEncoder().encode(c))b.push(x);return '';
  });
  try{return new TextDecoder(charset||'utf-8').decode(new Uint8Array(b))}catch(_){return new TextDecoder('utf-8').decode(new Uint8Array(b))}
}
function vcfSatirlariBirlestir(metin){
  const ham=metin.replace(/^﻿/,'').split(/\r\n|\r|\n/),out=[];
  for(let i=0;i<ham.length;i++){
    let s=ham[i];
    const onceki=out.length?out[out.length-1]:null;
    if(onceki!==null&&/^[ \t]/.test(s)){out[out.length-1]=onceki+s.slice(1);continue}            // katlanmış satır
    if(onceki!==null&&/^PHOTO/i.test(onceki)&&/ENCODING=(BASE64|b)/i.test(onceki)&&s!==''&&!/^[A-Za-z0-9.-]+[;:]/.test(s)){
      out[out.length-1]=onceki+s.trim();continue;                                                  // 2.1 fotoğraf devamı
    }
    if(onceki!==null&&/QUOTED-PRINTABLE/i.test(onceki)&&/=$/.test(onceki)){out[out.length-1]=onceki.slice(0,-1)+s;continue} // QP yumuşak satır sonu
    out.push(s);
  }
  return out.filter(x=>x!=='');
}
/* ';' ile bölünen bileşenli alanlar (N, ADR, ORG): ÖNCE bölünür, SONRA her parça çözülür.
   (Çözmeden önce bölmezsek kaçışlı \; veya QP =3B içindeki noktalı virgül alanı bozar.) */
function bilesenBol(ham,qpMi,cs){
  const parca=[];let cur='';
  for(let i=0;i<ham.length;i++){
    const c=ham.charAt(i);
    if(!qpMi&&c==='\\'){cur+=c+(ham.charAt(i+1)||'');i++;continue}
    if(c===';'){parca.push(cur);cur='';continue}
    cur+=c;
  }
  parca.push(cur);
  return parca.map(x=>qpMi?qpCoz(x,cs):vcfCoz34(x));
}
function vcfCoz34(s){return s.replace(/\\([nN,;\\])/g,(m,c)=>c==='n'||c==='N'?'\n':c)}
/* metin -> [{...ALANLAR, _img}] */
function vcfOku(metin){
  const satirlar=vcfSatirlariBirlestir(metin),kartlar=[];
  let r=null;
  satirlar.forEach(s=>{
    const u=s.toUpperCase();
    if(u==='BEGIN:VCARD'){r=bosSatir();r._sayac={cell:0};return}
    if(u==='END:VCARD'){if(r){delete r._sayac;kartlar.push(r)}r=null;return}
    if(!r)return;
    const i=s.indexOf(':');if(i<0)return;
    const baslik=s.slice(0,i),deger=s.slice(i+1);
    const parca=baslik.split(';'),ad=parca[0].replace(/^.*\./,'').toUpperCase();
    const prm=parca.slice(1).map(x=>x.toUpperCase());
    const tipler=prm.join(';');
    let v=deger;
    const qpMi=/QUOTED-PRINTABLE/.test(tipler);
    const cs=((tipler.match(/CHARSET=([\w-]+)/)||[])[1])||'utf-8';
    const bilesenli=(ad==='N'||ad==='ADR'||ad==='ORG');
    if(bilesenli)v=bilesenBol(deger,qpMi,cs);
    else if(qpMi)v=qpCoz(v,cs);
    else if(ad!=='PHOTO'&&ad!=='URL')v=vcfCoz34(v);
    const bos=!r[ad.toLowerCase()];
    switch(ad){
      case 'N':{
        const p=v;
        const ham=[p[1],p[0]].map(x=>(x||'').trim()).filter(Boolean).join(' ');
        r.name=ham;break}
      case 'FN':r.disp=v.trim();break;
      case 'TEL':{
        const t=tipler;let k=null;v=String(v).trim();
        if(/FAX/.test(t))k='fax';else if(/CELL|MOBILE/.test(t))k='cell';else if(/HOME/.test(t))k='home';else if(/WORK/.test(t))k='work';
        else k=r.cell===''?'cell':(r.work===''?'work':null);
        if(k==='work'&&r.work!==''&&/^\d{2,6}$/.test(v)){if(r.ext==='')r.ext=v;break}      // ikinci kısa iş numarası = dahili
        if(k==='work'){const m=v.match(/^(.*\S),(\d{2,6})$/);if(m){v=m[1];if(r.ext==='')r.ext=m[2]}}   // ana,dahili
        if(k&&r[k]===''&&v)r[k]=v;
        break}
      case 'EMAIL':if(r.mail==='')r.mail=v.trim();else if(r.mail2==='')r.mail2=v.trim();break;
      case 'NICKNAME':r.nick=v.trim();break;
      case 'NOTE':r.note=v.trim();break;
      case 'ADR':{
        // PO;ext;sokak;şehir;bölge;posta;ülke
        const p=v.map(x=>x.trim());
        const sokak=[p[0],p[1],p[2]].filter(Boolean).join(', ');
        if(r.addr===''&&r.city===''&&r.zip===''){
          r.addr=sokak;
          r.city=[p[3],p[4]].filter(Boolean).join(' / ');
          r.zip=p[5]||'';
          if(p[6]&&!r.city)r.city=p[6];
        }
        break}
      case 'ORG':r.org=v.map(x=>x.trim()).filter(Boolean).join(' > ');break;
      case 'TITLE':r.title=v.trim();break;
      case 'URL':if(r.url===''&&!/^https:\/\/www\.google\.com\/maps\/search\//i.test(v.trim()))r.url=v.trim();break;
      case 'CATEGORIES':r.cat=v.trim();break;
      case 'BDAY':{const b=bdayNorm(v.trim().replace(/T.*$/,''));r.bday=b===null?v.trim():b;break}
      case 'PHOTO':{
        let m=v.match(/^data:(image\/[\w+.-]+);base64,(.+)$/i);
        if(m)r._img='data:'+m[1]+';base64,'+m[2];
        else if(/ENCODING=(BASE64|B)\b/.test(tipler)||/^[A-Za-z0-9+\/=\s]{100,}$/.test(v)){
          const tip=(tipler.match(/(?:TYPE=|;)(PNG|GIF)/)||[])[1];
          r._img='data:image/'+(tip?tip.toLowerCase():'jpeg')+';base64,'+v.replace(/\s/g,'');
        }
        if(r._img)r.photo='(vcf)';
        break}
    }
  });
  return kartlar;
}
async function vcfDosyaYukle(file){
  try{
    const bayt=new Uint8Array(await file.arrayBuffer());
    let metin=new TextDecoder('utf-8').decode(bayt);
    const kartlar=vcfOku(metin);
    if(!kartlar.length){say('msgKaynak','Dosyada vCard bulunamadı.','warn');return}
    const so=listeyeYaz(kartlar,modOku(),true);
    say('msgKaynak',kartlar.length+' kişi .vcf dosyasından okundu.'+ayiklamaNotu(so),'ok');
  }catch(e){say('msgKaynak','.vcf okunamadı: '+e.message,'bad')}
}
