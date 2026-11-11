# Değişiklik günlüğü

## Yayınlanmamış

## 2.3.0 — 2026-11-11
Excel/CSV için sütun eşleştirme.

### Eklendi
- Excel/CSV artık sütun **sırasına** değil **başlıklara** göre okunur: sıra farklı, başlık adı farklı (Cep Telefonu, E-Posta, Departman, Görev…), fazladan sütunlu dosyalar doğru okunur. Ayrı "Ad" + "Soyad" sütunları birleştirilir.
- **Sütun eşleştirme paneli:** her rehber alanı için seçilen Excel sütunu ve ilk satırdaki değer görünür; durum rozeti (✔ başlıktan / ⚠ tahmin / elle seçildi). Listeden değiştirince liste anında yenilenir; "sona ekle" modunda önceki kayıtlar korunur. Kullanılmayan sütunlar listelenir.
- Elle yapılan eşleştirme aynı başlık düzeni için hatırlanır (tarayıcıda); "Otomatik eşleştirmeye dön" ve "Sütun sırasına göre ata" düğmeleri.
- Başlıklar hiç tanınmazsa eski davranış (sütun sırası) uyarıyla uygulanır; eski 14/20 sütunlu şablon aynen çalışır.
- Test 12.

## 2.2.2 — 2026-11-03
Fotoğraf aktarımı düzeltmeleri.

### Düzeltildi
- Özlük veritabanında fotoğraf **metin olarak** (base64 veya `data:image/...` URI) saklanıyorsa artık okunur; önceden yok sayılıp sütun metni "Foto" alanına yazılıyordu.
- Okunamayan fotoğraflar sessizce atlanmaz: mesajda sayısı bildirilir.
- Fotoğraf klasörü eşleştirmesi: Excel'de `ali.png` yazıp klasörde `ali.jpg` varsa artık eşleşir; eşleşmeyen adlar ve açılamayan dosyalar (HEIC/TIFF vb.) bildirilir.
- Excel/Özlük'te fotoğraf dosya adı var ama resim yüklenmemişse "fotoğraf klasörünü seçin" uyarısı çıkar.
- Test 11 (fotoğraf aktarımı).

## 2.2.1 — 2026-11-03
Görsel yenileme (işlev değişmedi).

### Değişti
- Gradyanlı başlık bandı, logo, sürüm rozeti, "çevrimdışı çalışır" göstergesi ve adım gezinmesi (1–4).
- Numaralı adım rozetli, gölgeli kartlar; segment biçiminde veri kaynağı sekmeleri; yeniden tasarlanmış sürükle-bırak alanı.
- Tablo: yapışkan büyük harfli başlık, şeritli satırlar, üzerine gelince vurgu, yuvarlak fotoğraf küçük resmi.
- Düğme, giriş alanı, odak halkası ve koyu tema renkleri yenilendi; alt bilgi eklendi; geniş tablo sayfayı yatay taşırmaz.

## 2.2.0 — 2026-11-03
Adres → harita bağlantısı ve yüklerken otomatik mükerrer ayıklama.

### Eklendi
- **Harita bağlantısı:** adresi (sokak, şehir, posta kodu) olan kişilerin vCard kaydına Google Haritalar bağlantısı (`URL:`) eklenir; telefonda kişi kartından tek dokunuşla konum açılır. Seçenek: "Adresi haritada açılabilir yap" (varsayılan açık). Araç hiçbir adresi dışarı göndermez; bağlantı yalnızca açıldığında kullanılır.
- Listede her satırda 📍 düğmesi (adresi yoksa pasif): Google Haritalar yeni sekmede açılır. Tek kişilik QR kod da bağlantıyı taşır.
- `.vcf` okurken haritalar bağlantısı web sitesi sanılmaz (gidiş-dönüş temiz).
- **Yüklerken mükerrer ayıklama** (Excel, CSV, SQLite, .vcf; varsayılan açık): aynı ad + çakışmayan telefon/e-posta → tek kayıtta birleştirilir, boş alanlar doldurulur. Aynı adlı ama farklı telefon/e-postalı kişiler ayrı bırakılır ve bildirilir. "Ayıklamayı geri al" düğmesi.
- Test 10 (harita ve ayıklama).

### Değişti
- Üretilen vCard'da adresi olan kişilerde `URL:` satırı artık bulunabilir (harita bağlantısı).
- Gerçek GEO koordinatı eklenmedi: adresi koordinata çevirmek çevrimiçi hizmete adres göndermeyi gerektirir (bkz. YOLHARITASI).

## 2.1.0 — 2026-11-03
Alan ve biçim zenginleştirme, veri kalitesi ve yeni çıktı biçimleri.

### Eklendi
- Yeni alanlar (Excel 15–20. sütun): İkinci E-posta, Dahili, Takma Ad, Not, Şehir/İlçe, Posta Kodu. Eski 14 sütunlu dosyalar aynen çalışır.
- vCard: `NICKNAME`, `NOTE`, ikinci `EMAIL`, yapılandırılmış `ADR` (sokak;şehir;;posta), dahili numara (ayrı iş numarası veya `ana,dahili`), bileşenli `ORG` (`A > B > C` yolu), görünen ad şablonu (`{name} ({org})`).
- `.vcf` okuma yeni alanları, `ana,dahili` ve yapılandırılmış adresi de çözer; kendini sınama yeni alanları da karşılaştırır.
- **Önizlemeli toplu düzeltme:** boşluk/görünmez karakter, ad biçimi (Türkçe i/İ doğru), e-posta temizliği, telefon, unvan/kurum sözlüğü (tarayıcıda saklanır); değişiklikler tek tek işaretlenir.
- Mükerrerde **benzer ad** (sözcük sırası farkı, 1 harf yazım farkı): yalnızca "olası" grup olarak gösterilir, "kesin olanları birleştir" olası grupları birleştirmez.
- **Outlook CSV** ve **Google Kişiler CSV** (UTF-8 BOM, kurum yolu → Company/Department, seçilebilir tarih biçimi, formül enjeksiyonu koruması, grup kapsamı, alan seçimine uyar).
- **Tek kişilik QR kod** (vCard 3.0, fotoğrafsız, PNG indirme; sığmayan kayıtta anlaşılır uyarı) — `qrcode-generator` 1.4.4 (MIT) gömüldü.
- **Yazdırılabilir rehber** (gruplu tablo, yazdırma stili; tarayıcıdan PDF/yazıcı).
- Özlük otomatik önerisi: `dahili` → Dahili, `e_mail_int` → İkinci E-posta.
- Testler: 07 (alan zenginleştirme), 08 (veri kalitesi), 09 (çıktı biçimleri; QR gerçekten OpenCV ile okunur).

### Değişti
- Kurum (`ORG`) okunurken bileşenler `" > "` ile birleştirilir (önceden `" - "`).
- `mukerrerGruplar(benzer)` artık `[{idx, tur}]` döndürür.

## 2.0.0 — 2026-11-02
İlk HTML sürümü (eski Excel/VBA aracı V1.6'nın devamı). Depo yapısı kuruldu.

### Eklendi
- Veri kaynakları: Excel/CSV, **Özlük SQLite** (tablo seçimi, alan eşleştirme, `{sütun}` şablonu, otomatik öneri, kayıtlı eşleştirmeler, satır süzgeci, BLOB fotoğraf), `.vcf` içe aktarma, JSON yedek.
- vCard 2.1, 3.0 ve 4.0 üretimi; ad/soyad ayırma; alan bazında rehbere yazma seçimi.
- Kendini sınama: üretilen çıktı geri okunup kaynakla karşılaştırılır.
- Denetim paneli, telefonu `+90…` biçimine düzeltme, mükerrer bulma/birleştirme.
- Fotoğraf: tek, toplu ve klasör seçimi; ad-soyada göre eşleşme; 200×200 JPEG.
- Gruba göre `.vcf`, gruplara göre ZIP (bağımlılıksız), doğum günü `.ics` (yıllık tekrar).
- Sayfalı tablo (büyük listeler için), arama.
- Tarayıcıda saklama (varsayılan kapalı, fotoğrafsız).
- Altyapı: `build.py`, `src/` bölünmüş kaynak, 6 uçtan uca test, CI, dokümanlar.

### Eski araca göre düzeltilenler
- `BDAY` artık `YYYYMMDD` (önceden `5.05.1966`); geçersiz tarih yazılmaz, işaretlenir.
- Boş `TEL:`, `URL:`, `BDAY:` satırları yazılmıyor (seçenek).
- `FN` boşsa Ad Soyad kullanılıyor (3.0/4.0'da zorunlu).
- Türkçe karakter dönüşümü Kod sayfası taraması yerine doğrudan UTF-8 → QP; tabloda olmayan karakter artık kaybolmuyor.
- 2.1 fotoğraf sonrası boş satır eklendi; 3.0/4.0'da satır katlama.
- Adres satır sonu korunuyor.
- 2.1 çıktısında `;` karakteri `=3B` olarak yazılıyor; adres/kurum metnindeki noktalı virgül telefonda alan ayırıcı sanılmıyor. Ayrıştırıcı bileşenli alanlarda (N, ADR, ORG) önce bölüp sonra çözüyor.
