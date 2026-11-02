# VCARD Rehber Hazırlama (v2.1.0)

Excel/CSV, **Özlük (SQLite) veritabanı**, mevcut `.vcf` veya JSON yedeğinden telefon rehberine aktarılabilir **.vcf** (vCard 2.1 / 3.0 / 4.0) üreten, tek dosya, çevrimdışı çalışan tarayıcı aracı. Eski "vcard rehber hazırlama-doğum tarihli.xlsm" (VBA) aracının HTML karşılığıdır ve onun üzerine geliştirilmiştir.

- Çalıştırılabilir dosya: `dist/VCARD_Rehber_Hazirla-2.1.0.html` (çift tıklayıp Edge/Chrome'da açın; kurulum, sunucu, internet gerekmez).
- Veri tarayıcıdan dışarı çıkmaz. Hiçbir çalışma zamanı bağımlılığı yoktur (kütüphaneler dosyaya gömülüdür).

> **Bu dosya oturumlar arası hafıza işlevi görür. İlk okunacak dosya budur.** Modülü aşağıdaki tablolardan bulun; tüm dosyayı okumayın.

## Çalışma kuralları

1. **Kaynak `src/`'dir.** `dist/` üretilir (`python build.py`), elle düzenlenmez.
2. Her değişiklikte **aynı commit'te**: `dist/` yenilenir, `CHANGELOG.md` güncellenir, README tabloları/sayıları ve gerekiyorsa `docs/MIMARI.md` (akış, veri modeli, kaynak sözleşmesi) ile `docs/ARAYUZ.md` (ekran/id) güncellenir.
3. Sürüm yalnız `src/js/01_sabitler.js` içindeki `APP_SURUM`'dur. Artınca dist dosya adı, README başlığı ve CHANGELOG başlığı birlikte güncellenir.
4. JS modülleri gerçek ES modülü değildir; `NN_` ön ekine göre sıralanıp **tek IIFE** içinde birleşir (`00_` açar, `99_` kapatır).
5. CSS'te sabit yazı boyutu yerine `calc(var(--fontsize)*k)` kullanılır.
6. İlgili testler çalıştırılır; önemli işte hepsi (`python tests/run_tests.py`). Yeni özellik = yeni/uzatılmış test + `tests/README.txt` satırı.
7. **Gerçek kişi verisi, veritabanı (.sqlite/.db), Excel rehberleri, .vcf ve yedek .json dosyaları depoya konmaz** (`.gitignore`). Testler yalnızca uydurma veriyle çalışır.
8. Çıktı her zaman **tek dosya HTML**'dir; çalışma zamanı bağımlılığı (CDN, harici dosya) eklenmez.

## Özellikler

| Alan | Özellik |
|---|---|
| Kaynaklar | Excel (.xlsx/.xlsm/.xls) ve CSV; **Özlük SQLite veritabanı** (tablo seç, alan eşleştir, satır süzgeci); `.vcf` içe aktarma (2.1/3.0/4.0); JSON çalışma yedeği |
| Özlük eşleştirme | Her rehber alanı için sütun seçimi **veya** `{sütun}` şablonu; "Otomatik öner" (ev adresi önerilmez); eşleştirmeleri adla kaydet/uygula; yalnızca eşleştirilen sütunlar okunur; BLOB fotoğraf desteği |
| Alanlar (20) | Ad, Görünen Ad, Mobil/İş/Fax/Ev, Mail, **İkinci E-posta**, **Dahili**, Adres, **Şehir/İlçe**, **Posta Kodu**, Firma/Birim, Unvan, Web, Grup, **Takma Ad**, **Not**, Fotoğraf, Doğum Tarihi (Excel'de ilk 14 sütun eski araçla aynı sırada; yeni 6 alan 15–20. sütun) |
| Biçim seçenekleri | vCard 2.1 (QP) / 3.0 / 4.0; **dahili numara** ayrı iş numarası veya `ana,dahili`; **ORG bileşenli** (`A > B > C` → `ORG:A;B;C`); **görünen ad şablonu** (`{name} ({org})`); yapılandırılmış ADR (sokak/şehir/posta); Ad/Soyad ayırma; alan bazında "rehbere yaz" |
| Düzenleme | Sayfalı, düzenlenebilir tablo; arama; satır ekle/sil; fotoğraf ekleme (tek, toplu, klasör; ad-soyada göre eşleşme; 200×200 JPEG) |
| Kontrol | Denetim paneli; telefonu `+90…` biçimine düzeltme; mükerrer bulma ve birleştirme (**kesin**: aynı telefon/ad; **olası**: sözcük sırası ve 1 harf yazım farkı, yalnızca tek tek onayla) |
| **Veri kalitesi** | **Önizlemeli toplu düzeltme**: boşluk/görünmez karakter, ad biçimi (Ayşe Çağlar Öztürk / ÖZTÜRK / BÜYÜK, Türkçe i/İ), e-posta temizliği, telefon, **unvan/kurum sözlüğü** (`Muh.=Mühendis`); değişiklikler tek tek işaretlenip uygulanır |
| Çıktı | vCard 2.1/3.0/4.0, **kendini sınama** (çıktı geri okunup karşılaştırılır); gruba göre `.vcf`, ZIP, doğum günü `.ics`, panoya kopyala |
| **Diğer biçimler** | **Outlook CSV**, **Google Kişiler CSV** (kurum yolu → Company/Department, tarih biçimi seçilebilir, formül enjeksiyonu korumalı); **tek kişilik QR kod** (vCard 3.0, fotoğrafsız, PNG indirme); **yazdırılabilir rehber** (gruplu tablo → PDF/yazıcı) |
| Gizlilik | Veri dışarı gönderilmez; tarayıcıda saklama varsayılan **kapalı**; Özlük'ten yalnızca eşleştirilen sütunlar okunur |

Ayrıntılı durum ve planlananlar: [`docs/YOLHARITASI.md`](docs/YOLHARITASI.md).

## Depo yapısı

```
VCARD_REHBER/
├── README.md                  bu dosya (önce okunur; çalışma kuralları en üsttedir)
├── CHANGELOG.md               sürüm sürüm değişiklikler
├── CLAUDE.md                  Claude oturumları için kısa yönlendirme
├── build.py                   derleme betiği (src/ -> tek dosya HTML)
├── dist/
│   └── VCARD_Rehber_Hazirla-2.1.0.html   derlenmiş, çalışan uygulama
├── src/
│   ├── index.template.html    sayfa iskeleti ({{INCLUDE:...}} işaretleri)
│   ├── html/                  6 HTML parçası (ekran bölümleri + QR penceresi)
│   ├── css/                   5 CSS dosyası
│   ├── js/                    18 JS modülü (tek IIFE içinde birleşir)
│   └── vendor/                SheetJS, sql.js (+WASM base64), qrcode-generator — değiştirmeyin
├── tests/
│   ├── run_tests.py           tek komutla derle + sunucu + test
│   ├── calistir.py            testleri sırayla koşturan çalıştırıcı
│   ├── _ortak.py              ortak yardımcılar
│   ├── 01_… 09_*.py           9 uçtan uca test (Playwright + gerçek Chromium)
│   └── README.txt
├── docs/
│   ├── MIMARI.md              derleme, katmanlar, veri modeli, kaynak sözleşmesi, akışlar
│   ├── ARAYUZ.md              ekran / bölüm / id haritası
│   ├── YOLHARITASI.md         tüm öneriler ve durumları
│   ├── DAGITIM.md             genel dağıtım kopyası ve Özlük (SQL Server) gömülü kopya tasarımı
│   └── GITHUB.md              Git ve GitHub çalışma rehberi
├── .github/workflows/ci.yml   GitHub Actions: derleme kontrolü + testler
├── .gitignore
└── .gitattributes
```

## JS modül tablosu (`src/js/`)

| Dosya | Görev |
|---|---|
| `00_iife_ac.js` | IIFE açılışı |
| `01_sabitler.js` | `APP_SURUM`, `ALANLAR` (20 rehber alanı), anahtar sabitleri |
| `02_yardimcilar.js` | DOM/metin yardımcıları, tarih ve telefon normalize, e-posta kontrolü, indirme, CRC32 + ZIP |
| `03_durum.js` | Tek durum nesnesi `D`, `listeyeYaz` |
| `04_metin_kalitesi.js` | Saf metin fonksiyonları: boşluk, ad biçimi (Türkçe), e-posta, sözlük, benzer ad (Levenshtein) |
| `10_kaynak_excel.js` | Excel/CSV okuma, şablon indirme |
| `11_kaynak_sqlite.js` | sql.js başlatma, tablo/sütun keşfi, eşleştirme arayüzü, süzgeç, kayıt okuma, BLOB fotoğraf |
| `13_kaynak_vcf.js` | `.vcf` ayrıştırıcı (2.1 QP, katlama, 3.0, 4.0, fotoğraf) |
| `20_tablo.js` | Sayfalı düzenlenebilir tablo, olaylar |
| `30_foto.js` | 200×200 kırpma/küçültme, toplu eşleşme |
| `40_dogrulama.js` | Denetim, telefon düzeltme, mükerrer bulma/birleştirme |
| `41_toplu_duzeltme.js` | Önizlemeli toplu düzeltme (üret / önizle / seçilenleri uygula), sözlük saklama |
| `50_vcard.js` | vCard 2.1/3.0/4.0 üretimi, katlama, kendini sınama |
| `55_csv_formatlari.js` | Outlook ve Google Kişiler CSV |
| `56_qr_yazdir.js` | Tek kişilik QR kod, yazdırılabilir rehber |
| `60_cikti.js` | Üretim akışı, grup, ZIP, .ics, JSON yedek, isteğe bağlı saklama |
| `70_arayuz.js` | Olay bağlama, `window.VCARD` test arayüzü |
| `99_iife_kapat.js` | IIFE kapanışı |

(`12_` numarası ileride "kaynak adaptörü" için ayrılmıştır, bkz. `docs/DAGITIM.md`.)

## CSS / HTML / vendor tabloları

| Klasör | Dosyalar |
|---|---|
| `src/css/` | `01_temel` (renk/yazı değişkenleri, koyu tema), `02_bilesenler` (düğme, sekme, denetim), `03_tablo`, `04_eslestirme`, `05_yazdir` (QR penceresi, yazdırma stili) |
| `src/html/` | `00_baslik`, `10_kaynak` (4 kaynak sekmesi + eşleştirme paneli), `20_liste`, `30_kontrol`, `40_cikti`, `50_qr` (QR penceresi) |
| `src/vendor/` | `xlsx.full.min.js` (SheetJS 0.18.5), `sql-wasm.js` + `sql-wasm.wasm.b64.js` (sql.js 1.12.0), `qrcode.js` (qrcode-generator 1.4.4, MIT) |

## Derleme şeması

```
src/index.template.html ──┐
src/css/*.css ────────────┤
src/html/*.html ──────────┼─►  python build.py  ─►  dist/VCARD_Rehber_Hazirla-<APP_SURUM>.html
src/vendor/* ─────────────┤
src/js/NN_*.js (sıralı) ──┘
```

`python build.py --check` dist'in kaynakla aynı olduğunu doğrular (CI de bunu çalıştırır).

## Kullanım (son kullanıcı)

1. HTML dosyasını açın. Kaynak sekmesinden Excel/CSV, Özlük veritabanı, .vcf veya yedek seçin.
2. **Özlük veritabanı:** `.sqlite` dosyasını seçin → tabloyu seçin → *Otomatik öner* veya elle eşleştirin → gerekirse satır süzgeci (ör. ayrılış tarihi *boş*) → *Kayıtları yükle*.
3. Listeyi kontrol edin (denetim, telefon düzeltme, mükerrer), **Toplu düzeltme**yi önizleyip uygulayın, fotoğrafları ekleyin.
4. *Rehberi hazırla* → *rehberiniz.vcf indir* (veya gruba göre/ZIP, Outlook/Google CSV, yazdırılabilir rehber; tek kişi için satırdaki 📱 QR). Dosyayı telefona e-posta ile gönderip *Önizle → Rehber → Cihaz* adımlarını izleyin.

## Geliştirme

```
pip install playwright pillow openpyxl opencv-python-headless numpy && playwright install chromium
python build.py                 # dist üret
python tests/run_tests.py       # derle + tüm testler
python tests/run_tests.py 04    # yalnızca 04_ ile başlayan test
```

## Bilinen sınırlar

- Şifreli Özlük veritabanı açılamaz (şifresiz kopya gerekir); bkz. YOLHARITASI.
- Gerçek Android/iPhone aktarım testi kullanıcı tarafından yapılmalıdır; 2.1 varsayılandır, sorun olursa 3.0 denenir.
- Outlook ve Google CSV sütun adları bilinen biçime göre hazırlanmıştır; gerçek içe aktarma bu ortamda denenemedi (Outlook doğum tarihi biçimi bölgesel ayara bağlıdır, bu yüzden seçilebilir).
- Ad biçimi "van", "de" gibi küçük harfli parçaları da büyütür; önizlemede kontrol edin.
- Fotoğraf kırpma ortadan kareyedir (yüz algılama yok).
