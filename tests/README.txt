VCARD Rehber Hazırlama — test paketi
====================================

Çalıştırma
  pip install playwright pillow openpyxl opencv-python-headless numpy
  playwright install chromium
  python tests/run_tests.py          hepsi (derler, yerel sunucu açar, testleri koşturur)
  python tests/run_tests.py 04 06    yalnızca 04_ ve 06_ ile başlayanlar

Testler gerçek Chromium'da uçtan uca çalışır; veri tamamen uydurmadır (geçici klasörde üretilir).
Her test sonunda "tarayıcıda hata yok" kontrolü vardır (konsol/sayfa hatası = başarısız).

Dosya                              Kapsam
01_derleme_ve_acilis.py            build.py --check, dış kaynak yok, sayfa hatasız açılır, sekmeler
02_excel_ice_aktar.py              Excel okuma, tarih (UTC), çok satırlı adres, 2.1/3.0 çıktısı, alan seçimi, indirme, CRLF
03_vcard_surumleri.py              2.1/3.0/4.0 üretim + geri okuma turu, katlama, fotoğraf, ad/soyad ayırma
04_sqlite_ozluk_kaynagi.py         Özlük SQLite: şifreli dosya, otomatik öneri, şablon, süzgeç, BLOB foto, hassas alan sızmaz, kayıtlı eşleştirme, ekle modu
05_vcf_geri_okuma.py               2.1 QP/katlı/yumuşak satır sonu, 3.0 kaçışlar, 4.0 data URI, dosya yükleme
06_kontrol_grup_zip_ics.py         telefon/tarih normalize, denetim, mükerrer birleştirme, fotoğraf eşleşme, grup ZIP (CRC), .ics, JSON yedek, sayfalama
07_alan_zenginlestirme.py          yeni alanlar (mail2, dahili, takma ad, not, şehir, posta), dahili modları, bileşenli ORG, adres turu, görünen ad şablonu, Excel 20 sütun + eski 14 sütun uyumu
08_veri_kalitesi.py                ad biçimi (Türkçe i/İ), boşluk, e-posta, sözlük, önizlemeli düzeltme (seçili uygula), benzer ad mükerrer (kesin/olası)
09_cikti_bicimleri.py              Outlook/Google CSV (BOM, kaçış, enjeksiyon, tarih biçimi, grup kapsamı), QR (OpenCV ile gerçek okuma), yazdırılabilir rehber (print stili, PDF)

Ek gereksinim (09): pip install opencv-python-headless numpy

Yeni özellik eklerken: yeni/uzatılmış test + bu tabloya satır.
10_harita_ve_ayiklama.py          Adres → Google Haritalar bağlantısı (vCard 2.1/3.0/4.0, 📍, QR, geri okuma), CSV yüklerken otomatik mükerrer ayıklama, geri al
11_foto_aktarimi.py              Özlük BLOB/base64/data URI fotoğraf, Excel dosya adı uyarısı, klasörden eşleştirme (uzantı farkı), vCard PHOTO satırları
