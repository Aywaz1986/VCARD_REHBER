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
function excelSayfaOku(ad){
  const ws=D.wb.Sheets[ad];
  const veri=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:'',blankrows:false});
  const out=[];
  for(let i=1;i<veri.length;i++){
    const d=veri[i];
    if(!d.some(x=>String(x).trim()!==''))continue;
    const r=bosSatir();
    ALANLAR.forEach((a,k)=>{
      if(a.k==='bday'){const b=bdayNorm(d[k]);r.bday=(b===null)?String(d[k]):b;}
      else r[a.k]=hucreMetni(d[k]);
    });
    out.push(r);
  }
  listeyeYaz(out,modOku());
  say('msgKaynak',out.length+' kişi okundu ("'+ad+'" sayfası).','ok');
}
function sablonIndir(){
  const ws=XLSX.utils.aoa_to_sheet([
    ALANLAR.map(a=>a.e),
    ['Örnek Kişi','','+905001112233','','','','ornek@mail.com','Adres satırı','Firma','Unvan','','Grup','','05.05.1980']
  ]);
  ws['!cols']=ALANLAR.map(()=>({wch:22}));
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Liste');
  XLSX.writeFile(wb,'rehber_sablon.xlsx');
}
