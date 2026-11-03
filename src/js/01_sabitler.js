/* ===== 01 Sabitler ===== */
const APP_SURUM='2.2.1';

/* Alan tanımları: sıra, Excel sütun sırası ile aynıdır (eski makro uyumu). */
const ALANLAR=[
  {k:'name', e:'Adı Soyadı',               zorunlu:true},
  {k:'disp', e:'Görünen Ad',               zorunlu:true},
  {k:'cell', e:'Mobil Telefonu',           tel:true},
  {k:'work', e:'İş Telefonu',              tel:true},
  {k:'fax',  e:'Fax',                      tel:true},
  {k:'home', e:'Ev Telefonu',              tel:true},
  {k:'mail', e:'Mail'},
  {k:'addr', e:'Adres'},
  {k:'org',  e:'Firma - Bölge'},
  {k:'title',e:'Unvan'},
  {k:'url',  e:'Web Sitesi'},
  {k:'cat',  e:'Grup'},
  {k:'photo',e:'Fotoğraf (dosya adı)'},
  {k:'bday', e:'Doğum Tarihi (BDAY)'},
  /* v2.1: Excel'de 15. sütundan itibaren (ilk 14 sütun eski araçla aynı sırada kalır) */
  {k:'mail2',e:'İkinci E-posta'},
  {k:'ext',  e:'Dahili'},
  {k:'nick', e:'Takma Ad'},
  {k:'note', e:'Not'},
  {k:'city', e:'Şehir / İlçe'},
  {k:'zip',  e:'Posta Kodu'}
];
const TEL_ALANLARI=ALANLAR.filter(a=>a.tel).map(a=>a.k);
const LS_ESLESME='vcard.eslesme.v1';
const LS_OTO='vcard.calisma.v1';
const LS_SOZLUK='vcard.sozluk.v1';
