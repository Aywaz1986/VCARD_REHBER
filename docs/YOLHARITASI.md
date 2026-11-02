# Yol haritası ve öneriler

Durum: ✅ v2.0.0/v2.1.0'da yapıldı · 🟡 kısmen · ⏳ planlandı · 🧪 kullanıcı testi gerekir

## 1. Hemen değer katanlar

| # | Öneri | Durum | Not |
|---|---|---|---|
| 1.1 | Fotoğraf klasörü seçimi; Fotoğraf sütunu boşsa "Ad Soyad.jpg" eşleşmesi | ✅ | Türkçe karakter/boşluk/büyük-küçük harf farkı yok sayılır |
| 1.1b | Fotoğrafı yüze göre ortalama | ⏳ | Şimdilik ortadan kare kırpma. Tarayıcıda `FaceDetector` her yerde yok; gömülü model dosya boyutunu büyütür |
| 1.2 | Telefon numarası biçimlendirme (`+90`) | ✅ | Düzeltme düğmesi + üretimde otomatik seçenek; kısa/dahili (3–6 hane) korunur |
| 1.3 | Mükerrer kayıt kontrolü ve birleştirme | ✅ | Aynı telefon (son 10 hane) veya aynı ad; boş alanlar diğerinden doldurulur |
| 1.4 | Doğrulama paneli | ✅ | Ad boş, geçersiz telefon/e-posta/doğum tarihi, iletişimsiz kişi; "Git" ile satıra gider |
| 1.5 | Gruba göre dışa aktarma ve ZIP | ✅ | Tek grup `.vcf`; tüm gruplar ZIP (bağımlılıksız) |
| 1.6 | Çalışma kaydı: JSON yedek + tarayıcıda saklama | ✅ | Saklama varsayılan kapalı, fotoğrafsız; yedek JSON fotoğraf dahil |

## 2. Telefon uyumluluğu ve kalite

| # | Öneri | Durum | Not |
|---|---|---|---|
| 2.1 | vCard 4.0 | ✅ | 2.1, 3.0, 4.0 |
| 2.2 | Gerçek cihaz testi (Android + iPhone) | 🧪 | Türkçe karakter, çok satırlı adres, fotoğraf, doğum tarihi kontrol edilmeli; sonuca göre varsayılan sürüm belirlenir |
| 2.3 | Kendini sınama | ✅ | Üretilen metin geri okunup kaynakla karşılaştırılır |
| 2.4 | Ters yön: telefondan alınan .vcf'yi listeye çevirme | ✅ | 2.1 QP, 3.0, 4.0, katlanmış satırlar, fotoğraf |

## 3. Entegrasyon

| # | Öneri | Durum | Not |
|---|---|---|---|
| 3.1 | **Özlük veritabanından okuma (SQLite)** | ✅ | Tablo seç, alan eşleştir, süzgeç, BLOB fotoğraf. Eşleştirmeyi kullanıcı yapar; "Otomatik öner" yardımcıdır |
| 3.1b | Şifreli Özlük veritabanını açma | ⏳ | Şimdilik şifresiz kopya gerekir. Özlük'ün şifreleme şeması bilinirse eklenir (parola sorma + çözme) |
| 3.2 | Kaynak adaptörü arayüzü (SQLite ve SQL Server aynı eşleştirme arayüzünü kullansın) | ⏳ | `docs/DAGITIM.md` 3. bölüm. SQL Server işine başlamadan önce yapılacak ilk adım |
| 3.3 | Özlük (SQL Server) içine gömülü kopya | ⏳ | Özlük SQL Server çalışması bitince; `docs/DAGITIM.md` |
| 3.4 | Genel dağıtım kopyası | ⏳ | Herkesin kullanacağı sürüm; `docs/DAGITIM.md` |
| 3.5 | ATÖLYE içine modül | ⏳ | Ortak modüller (Excel okuma, tarih normalize, fotoğraf küçültme) kanonik kütüphane ile paylaşılır |
| 3.6 | Doğum günü çıktıları | ✅ | `.ics`, yıllık tekrarlı tüm gün olayı |
| 3.7 | Doğum günü listesi ekranı ("bu ay") | ⏳ | Özlük'te zaten var; bu araçta ihtiyaç olursa |

## 4. Gizlilik

| # | Öneri | Durum | Not |
|---|---|---|---|
| 4.1 | Veri dışarı gönderilmez, dış bağımlılık yok | ✅ | Test ile doğrulanır (dist içinde http(s) kaynağı yok) |
| 4.2 | Hangi alanların rehbere gideceğini seçme | ✅ | Her alan için onay kutusu. **Varsayılan hepsi açık** (eski araçla uyum); adres ve doğum tarihini varsayılan kapalı yapmak isterseniz `70_arayuz.js`/`60_cikti.js` içinde tek satır |
| 4.3 | Özlük'ten yalnızca eşleştirilen sütunların okunması | ✅ | TC, kan grubu gibi alanlara dokunulmaz (testle doğrulanır) |
| 4.4 | Ev adresinin otomatik önerilmemesi | ✅ | "Otomatik öner" adresi eşleştirmez |
| 4.5 | Kayıtlı çalışmayı şifreleme | ⏳ | Şimdilik varsayılan kapalı + fotoğrafsız; gerekirse WebCrypto (parola) eklenir |

## 5. v2.1.0'da yapılanlar (alan/biçim, veri kalitesi, çıktı biçimleri)

| # | Öneri | Durum | Not |
|---|---|---|---|
| 5.1 | Dahili numara (ayrı iş numarası / `ana,dahili`) | ✅ | Telefonda `,` duraklama olarak aranır; hangisinin daha iyi çalıştığı 🧪 |
| 5.2 | İkinci e-posta | ✅ | Özlük'te `e_mail_int` otomatik önerilir |
| 5.3 | `NOTE`, `NICKNAME`, yapılandırılmış adres (şehir/posta) | ✅ | Excel 15–20. sütun |
| 5.4 | Birim hiyerarşisi (`ORG` bileşenli) | ✅ | Seçenek; kapalıyken tek bileşen |
| 5.5 | Görünen ad şablonu | ✅ | `{name} ({org})` gibi |
| 5.6 | Önizlemeli toplu düzeltme (boşluk, ad biçimi, e-posta, telefon) | ✅ | Özlük'teki "kalıp hatalarını düzelt" ile aynı mantık; ortak modül adayı |
| 5.7 | Unvan/kurum sözlüğü | ✅ | `bul=yerine`, tarayıcıda saklanır |
| 5.8 | Benzer ad mükerrer | ✅ | Yalnızca "olası", otomatik birleştirilmez |
| 5.9 | Outlook CSV, Google Kişiler CSV | ✅ 🧪 | Sütun adları bilinen biçime göre; gerçek içe aktarma testi kullanıcıda |
| 5.10 | Tek kişilik QR kod | ✅ | Test ile gerçekten okunur |
| 5.11 | Yazdırılabilir rehber (PDF) | ✅ | Tarayıcı yazdır → PDF |
| 5.12 | Dosya boyutu/fotoğraf kalitesi seçimi ve otomatik bölme | ⏳ | Büyük listelerde e-posta ek sınırı için |
| 5.13 | Fark raporu (yalnız değişenleri gönder, `UID`) | ⏳ | `.vcf` okuma altyapısı hazır |
| 5.14 | Hazır alan setleri ("Kurumsal rehber") ve deneme dosyası (ilk N kişi) | ⏳ | |

## 6. Sonraki sürüm adayları (öncelik sırasıyla)

1. Fark raporu ve dosya boyutu/bölme (5.12, 5.13), hazır alan setleri (5.14).
2. Kaynak adaptörü arayüzü (3.2) — SQL Server öncesi hazırlık.
3. Gerçek cihaz ve Outlook/Google içe aktarma sonuçlarına göre düzeltmeler (2.2, 5.9).
4. Şifreli Özlük veritabanı desteği (3.1b).
5. ATÖLYE modülü (3.5).
6. Özlük SQL Server gömülü kopya ve genel dağıtım (3.3, 3.4).
7. Yüze göre fotoğraf ortalama (1.1b).
