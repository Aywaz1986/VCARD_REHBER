/* ===== 55 Diğer çıktı biçimleri: Outlook CSV, Google Kişiler CSV =====
   Not: bu iki biçim, ilgili uygulamaların bilinen sütun adlarına göre hazırlanmıştır;
   uygulama sürümüne/bölgesel ayara göre küçük farklar olabilir (docs/YOLHARITASI.md: gerçek içe aktarma testi). */
function csvHucre(v){
  v=String(v==null?'':v);
  if(/^[=@]/.test(v)||/^-[^0-9]/.test(v))v="'"+v;                // Excel'de açılırsa formül çalışmasın
  if(/[",\r\n]/.test(v))v='"'+v.replace(/"/g,'""')+'"';
  return v;
}
function csvMetni(basliklar,satirlar){
  return '﻿'+[basliklar].concat(satirlar).map(r=>r.map(csvHucre).join(',')).join('\r\n')+'\r\n';
}
function csvAdAyir(r){
  const w=String(r.name||r.disp||'').trim().split(/\s+/).filter(Boolean);
  const soyad=w.length>1?w.pop():'';
  return [w.join(' '),soyad];
}
function csvKurum(org){
  const p=String(org||'').split(/\s*>\s*/).filter(Boolean);
  return [p[0]||'',p.slice(1).join(' / ')];
}
function csvTarihBicim(b,fmt){
  if(!/^\d{8}$/.test(b))return '';
  const y=b.slice(0,4),m=b.slice(4,6),d=b.slice(6);
  if(fmt==='yyyy-aa-gg')return y+'-'+m+'-'+d;
  if(fmt==='aa/gg/yyyy')return m+'/'+d+'/'+y;
  return d+'.'+m+'.'+y;
}
/* Alan, "rehbere yazılacak alanlar" seçiminde kapalıysa boş döner */
function csvDeger(r,k,o){
  if(o.dahil&&o.dahil[k]===false)return '';
  if(TEL_ALANLARI.indexOf(k)>=0)return telDeger(r,k,o);
  return String(r[k]==null?'':r[k]).trim();
}
function outlookCsvUret(satirlar,o,tarihBicim){
  const bas=['First Name','Last Name','Company','Department','Job Title','Business Street','Business City','Business Postal Code',
    'Business Fax','Business Phone','Business Phone 2','Home Phone','Mobile Phone','E-mail Address','E-mail 2 Address','Notes','Birthday','Web Page','Categories','Nickname'];
  const sat=satirlar.map(r=>{
    const [ad,soyad]=csvAdAyir(r),[firma,birim]=csvKurum(csvDeger(r,'org',o));
    return [ad,soyad,firma,birim,csvDeger(r,'title',o),csvDeger(r,'addr',o),csvDeger(r,'city',o),csvDeger(r,'zip',o),
      csvDeger(r,'fax',o),csvDeger(r,'work',o),csvDeger(r,'ext',o),csvDeger(r,'home',o),csvDeger(r,'cell',o),
      csvDeger(r,'mail',o),csvDeger(r,'mail2',o),csvDeger(r,'note',o),
      (o.dahil&&o.dahil.bday===false)?'':csvTarihBicim(r.bday,tarihBicim),csvDeger(r,'url',o),csvDeger(r,'cat',o),csvDeger(r,'nick',o)];
  });
  return {metin:csvMetni(bas,sat),n:sat.length};
}
function googleCsvUret(satirlar,o){
  const bas=['First Name','Middle Name','Last Name','Nickname','Organization Name','Organization Department','Organization Title','Birthday','Notes','Labels',
    'E-mail 1 - Label','E-mail 1 - Value','E-mail 2 - Label','E-mail 2 - Value',
    'Phone 1 - Label','Phone 1 - Value','Phone 2 - Label','Phone 2 - Value','Phone 3 - Label','Phone 3 - Value','Phone 4 - Label','Phone 4 - Value','Phone 5 - Label','Phone 5 - Value',
    'Address 1 - Label','Address 1 - Street','Address 1 - City','Address 1 - Postal Code','Website 1 - Value'];
  const sat=satirlar.map(r=>{
    const [ad,soyad]=csvAdAyir(r),[firma,birim]=csvKurum(csvDeger(r,'org',o));
    const tel=[['Mobile',csvDeger(r,'cell',o)],['Work',csvDeger(r,'work',o)],['Work Extension',csvDeger(r,'ext',o)],['Work Fax',csvDeger(r,'fax',o)],['Home',csvDeger(r,'home',o)]];
    const telHucre=[];tel.forEach(t=>telHucre.push(t[1]?t[0]:'',t[1]));
    return [ad,'',soyad,csvDeger(r,'nick',o),firma,birim,csvDeger(r,'title',o),
      (o.dahil&&o.dahil.bday===false)?'':csvTarihBicim(r.bday,'yyyy-aa-gg'),csvDeger(r,'note',o),csvDeger(r,'cat',o),
      csvDeger(r,'mail',o)?'Work':'',csvDeger(r,'mail',o),csvDeger(r,'mail2',o)?'Other':'',csvDeger(r,'mail2',o)]
      .concat(telHucre,[(csvDeger(r,'addr',o)||csvDeger(r,'city',o)||csvDeger(r,'zip',o))?'Work':'',csvDeger(r,'addr',o),csvDeger(r,'city',o),csvDeger(r,'zip',o),csvDeger(r,'url',o)]);
  });
  return {metin:csvMetni(bas,sat),n:sat.length};
}
function csvIndir(tur){
  const sat=grupSatirlari($('grupSec').value);
  if(!sat.length){say('msg','Liste boş.','warn');return}
  const o=secenekler();
  const s=tur==='outlook'?outlookCsvUret(sat,o,$('csvTarih').value):googleCsvUret(sat,o);
  indir(metinBlob(s.metin,'text/csv'),tur==='outlook'?'rehber_outlook.csv':'rehber_google.csv');
  say('msg',s.n+' kişi '+(tur==='outlook'?'Outlook':'Google Kişiler')+' CSV olarak indirildi.','ok');
}
