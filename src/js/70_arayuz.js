/* ===== 70 Arayüz bağlantıları ===== */
function arayuzKur(){
  $('surum').textContent='v'+APP_SURUM;
  dahilListeKur();tabloOlaylari();tabloCiz();grupListesiYenile();

  // kaynak sekmeleri
  $('kaynakSekme').addEventListener('click',e=>{
    const b=e.target.closest('button[data-kaynak]');if(!b)return;
    document.querySelectorAll('#kaynakSekme button[data-kaynak]').forEach(x=>x.classList.toggle('on',x===b));
    document.querySelectorAll('#kartKaynak .pane').forEach(p=>p.hidden=p.dataset.pane!==b.dataset.kaynak);
  });
  // Excel
  $('fileExcel').onchange=e=>{if(e.target.files[0])excelDosyaYukle(e.target.files[0]);e.target.value=''};
  $('sheetSel').onchange=e=>excelSayfaOku(e.target.value);
  $('tplBtn').onclick=sablonIndir;
  const dz=$('drop');
  ['dragenter','dragover'].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.add('over')}));
  ['dragleave','drop'].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.remove('over')}));
  dz.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)excelDosyaYukle(f)});
  // SQLite
  $('fileSqlite').onchange=e=>{if(e.target.files[0])sqliteDosyaAc(e.target.files[0]);e.target.value=''};
  $('sqTablo').onchange=e=>sqliteTabloSec(e.target.value);
  $('eslesOner').onclick=eslesOner;
  $('eslesTemizle').onclick=()=>eslesYaz({});
  $('eslesKaydet').onclick=eslesKaydet;
  $('eslesUygula').onclick=eslesKayitUygula;
  $('eslesSil').onclick=eslesKayitSil;
  $('sqYukle').onclick=sqliteYukle;
  // .vcf / JSON
  $('fileVcf').onchange=e=>{if(e.target.files[0])vcfDosyaYukle(e.target.files[0]);e.target.value=''};
  $('fileJson').onchange=async e=>{
    const f=e.target.files[0];e.target.value='';if(!f)return;
    try{const s=jsonYukle(await f.text());listeyeYaz(s,modOku());say('msgKaynak',s.length+' kişi yedekten yüklendi.','ok')}
    catch(err){say('msgKaynak','Yedek okunamadı: '+err.message,'bad')}
  };
  $('jsonIndir').onclick=()=>{
    if(!D.satirlar.length){say('msgKaynak','Liste boş.','warn');return}
    indir(metinBlob(jsonYedek(),'application/json'),'rehber_yedek.json');
  };
  $('otoSakla').onchange=e=>{
    if(e.target.checked)otoSaklaYaz();else try{localStorage.removeItem(LS_OTO)}catch(_){}
  };
  // fotoğraf
  $('photoIn').onchange=e=>{fotoTopluEsle([...e.target.files]);e.target.value=''};
  $('photoDir').onchange=e=>{fotoTopluEsle([...e.target.files]);e.target.value=''};
  // kontrol
  $('kontrolBtn').onclick=denetimGoster;
  $('telDuzelt').onclick=telefonlariDuzelt;
  $('mukerrerBtn').onclick=mukerrerGoster;
  $('mukerrerBirlestir').onclick=()=>{const k=_mukerrer.filter(g=>g.tur==='kesin');if(k.length&&confirm(k.length+' kesin grup birleştirilsin mi? (olası gruplar birleştirilmez)'))mukerrerBirlestir(k)};
  $('kontrolSonuc').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.git!==undefined)satirGit(+b.dataset.git);
    if(b.dataset.birles!==undefined)mukerrerBirlestir([_mukerrer[+b.dataset.birles]]);
  });
  // çıktı
  $('genBtn').onclick=rehberHazirla;
  $('dlBtn').onclick=()=>vcfIndir(D.vcf,'rehberiniz.vcf');
  $('cpBtn').onclick=async()=>{
    try{await navigator.clipboard.writeText(D.vcf)}
    catch(_){const t=document.createElement('textarea');t.value=D.vcf;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}
    say('msg','Panoya kopyalandı.','ok');
  };
  ['ver','optSkip','optFn','optSplit','optTel','dahiliMod','optOrg','optHarita'].forEach(id=>$(id).addEventListener('change',cikiTemizle));
  $('dahilListe').addEventListener('change',cikiTemizle);
  $('dispSablon').addEventListener('input',cikiTemizle);
  $('grupIndir').onclick=grupIndir;
  $('grupZip').onclick=grupZip;
  $('icsIndir').onclick=icsIndir;
  $('outlookCsv').onclick=()=>csvIndir('outlook');
  $('googleCsv').onclick=()=>csvIndir('google');
  $('yazdirBtn').onclick=rehberYazdir;
  $('mukGeriAl').onclick=ayiklamayiGeriAl;
  $('qrKapat').onclick=()=>$('qrDlg').close();
  // toplu düzeltme
  sozlukYukle();
  $('unvanSozluk').addEventListener('change',sozlukKaydet);
  $('duzOnizle').onclick=duzeltmeOnizle;
  $('duzUygula').onclick=duzeltmeUygula;

  // test ve ileri düzey kullanım için dışa açılan küçük API
  window.VCARD={D,vcfUret,vcfOku,vcfDogrula,telNorm,bdayNorm,denetle,mukerrerGruplar,icsUret,zipOlustur,tabloCiz,APP_SURUM,haritaBaglantisi,otomatikMukerrer,
    adBicimle,bosluklariTemizle,epostaTemizle,sozlukUygula,sozlukAyristir,duzeltmeUret,outlookCsvUret,googleCsvUret,qrUret,qrVcfMetni,yazdirHazirla,secenekler};
}
arayuzKur();
