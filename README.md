# VCARD Rehber Hazırlama (v2.0.0)

Excel/CSV, **Özlük (SQLite) veritabanı**, mevcut `.vcf` veya JSON yedeğinden telefon rehberine aktarılabilir **.vcf** (vCard 2.1 / 3.0 / 4.0) üreten, tek dosya, çevrimdışı çalışan tarayıcı aracı. Eski "vcard rehber hazırlama-doğum tarihli.xlsm" (VBA) aracının HTML karşılığıdır ve onun üzerine geliştirilmiştir.

- Çalıştırılabilir dosya: `dist/VCARD_Rehber_Hazirla-2.0.0.html` (çift tıklayıp Edge/Chrome'da açın; kurulum, sunucu, internet gerekmez).
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
| Düzenleme | Sayfalı, düzenlenebilir tablo; arama; satır ekle/sil; fotoğraf ekleme (tek, toplu, klasör; ad-soyada göre eşleşme; 200×200 JPEG) |
| Kontrol | Denetim paneli (boş ad, geçersiz telefon/e-posta/doğum tarihi, iletişimsiz kişi); telefonu `+90…` biçimine düzeltme; mükerrer bulma ve birleştirme |
| Çıktı | vCard 2.1 (QP) / 3.0 / 4.0; alan bazında "rehbere yaz" seçimi; boş alan atlama; Ad/Soyad ayırma; **kendini sınama** (çıktı geri okunup karşılaştırılır) |
| Dağıtım | Tek `.vcf`, gruba göre `.vcf`, gruplara göre **ZIP**, doğum günü **.ics** takvimi, panoya kopyala |
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
│   └── VCARD_Rehber_Hazirla-2.0.0.html   derlenmiş, çalışan uygulama
├── src/
│   ├── index.template.html    sayfa iskeleti ({{INCLUDE:...}} işaretleri)
│   ├── html/                  5 HTML parçası (ekran bölümleri)
│   ├── css/                   4 CSS dosyası
│   ├── js/                    14 JS modülü (tek IIFE içinde birleşir)
│   └── vendor/                SheetJS, sql.js (+WASM base64) — değiştirmeyin
├── tests/
│   ├── run_tests.py           tek komutla derle + sunucu + test
│   ├── calistir.py            testleri sırayla koşturan çalıştırıcı
│   ├── _ortak.py              ortak yardımcılar
│   ├── 01_… 06_*.py           6 uçtan uca test (Playwright + gerçek Chromium)
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
| `01_sabitler.js` | `APP_SURUM`, `ALANLAR` (14 rehber alanı), anahtar sabitleri |
| `02_yardimcilar.js` | DOM/metin yardımcıları, tarih ve telefon normalize, e-posta kontrolü, indirme, CRC32 + ZIP |
| `03_durum.js` | Tek durum nesnesi `D`, `listeyeYaz` |
| `10_kaynak_excel.js` | Excel/CSV okuma, şablon indirme |
| `11_kaynak_sqlite.js` | sql.js başlatma, tablo/sütun keşfi, eşleştirme arayüzü, süzgeç, kayıt okuma, BLOB fotoğraf |
| `13_kaynak_vcf.js` | `.vcf` ayrıştırıcı (2.1 QP, katlama, 3.0, 4.0, fotoğraf) |
| `20_tablo.js` | Sayfalı düzenlenebilir tablo, olaylar |
| `30_foto.js` | 200×200 kırpma/küçültme, toplu eşleşme |
| `40_dogrulama.js` | Denetim, telefon düzeltme, mükerrer bulma/birleştirme |
| `50_vcard.js` | vCard 2.1/3.0/4.0 üretimi, katlama, kendini sınama |
| `60_cikti.js` | Üretim akışı, grup, ZIP, .ics, JSON yedek, isteğe bağlı saklama |
| `70_arayuz.js` | Olay bağlama, `window.VCARD` test arayüzü |
| `99_iife_kapat.js` | IIFE kapanışı |

(`12_` numarası ileride "kaynak adaptörü" için ayrılmıştır, bkz. `docs/DAGITIM.md`.)

## CSS / HTML / vendor tabloları

| Klasör | Dosyalar |
|---|---|
| `src/css/` | `01_temel` (renk/yazı değişkenleri, koyu tema), `02_bilesenler` (düğme, sekme, denetim), `03_tablo`, `04_eslestirme` |
| `src/html/` | `00_baslik`, `10_kaynak` (4 kaynak sekmesi + eşleştirme paneli), `20_liste`, `30_kontrol`, `40_cikti` |
| `src/vendor/` | `xlsx.full.min.js` (SheetJS 0.18.5), `sql-wasm.js` + `sql-wasm.wasm.b64.js` (sql.js 1.12.0) |

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
3. Listeyi kontrol edin (denetim, telefon düzeltme, mükerrer), fotoğrafları ekleyin.
4. *Rehberi hazırla* → *rehberiniz.vcf indir* (veya gruba göre/ZIP). Dosyayı telefona e-posta ile gönderip *Önizle → Rehber → Cihaz* adımlarını izleyin.

## Geliştirme

```
pip install playwright pillow openpyxl && playwright install chromium
python build.py                 # dist üret
python tests/run_tests.py       # derle + tüm testler
python tests/run_tests.py 04    # yalnızca 04_ ile başlayan test
```

## Bilinen sınırlar

- Şifreli Özlük veritabanı açılamaz (şifresiz kopya gerekir); bkz. YOLHARITASI.
- Gerçek Android/iPhone aktarım testi kullanıcı tarafından yapılmalıdır; 2.1 varsayılandır, sorun olursa 3.0 denenir.
- Fotoğraf kırpma ortadan kareyedir (yüz algılama yok).
