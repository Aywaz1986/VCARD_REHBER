VCARD Rehber Hazırlama — test paketi
====================================

Çalıştırma
  pip install playwright pillow openpyxl
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

Yeni özellik eklerken: yeni/uzatılmış test + bu tabloya satır.
