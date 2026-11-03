# Arayüz haritası

Tek sayfa, dört kart: **1 Veri kaynağı → 2 Liste → 3 Kontrol → 4 Ayarlar ve çıktı**.

## 1. Veri kaynağı (`src/html/10_kaynak.html`, `#kartKaynak`)

| id | Görev |
|---|---|
| `#kaynakSekme` (`button[data-kaynak]`) | Sekmeler: `excel`, `sqlite`, `vcf`, `json`; paneller `.pane[data-pane]` |
| `#yukleMod` | `degistir` / `ekle` — tüm kaynaklar için geçerli |
| `#fileExcel`, `#sheetSel`, `#tplBtn`, `#drop` | Excel/CSV dosyası, sayfa seçici, şablon indirme, sürükle-bırak alanı |
| `#fileSqlite`, `#sqTablo`, `#sqBilgi` | Veritabanı dosyası, tablo seçici, bilgi |
| `#eslesPanel` | Eşleştirme paneli (veritabanı açılınca görünür) |
| `#eslesGrid` (`[data-map=alan]`, `[data-sab=alan]`) | Alan başına sütun seçici ve şablon kutusu (14 alan) |
| `#eslesOner`, `#eslesTemizle` | Otomatik öner / temizle |
| `#eslesKayitli`, `#eslesUygula`, `#eslesKaydet`, `#eslesSil` | Kayıtlı eşleştirmeler |
| `#sfSutun`, `#sfOp`, `#sfDeger` | Satır süzgeci (bos/dolu/esit/esitdegil/icerir) |
| `#sqYukle`, `#sqSonuc` | Kayıtları yükle, sonuç |
| `#fileVcf` | .vcf içe aktarma |
| `#fileJson`, `#jsonIndir`, `#otoSakla` | JSON yedek yükle/indir, tarayıcıda saklama |
| `#msgKaynak` | Kaynak/fotoğraf mesajları |

## 2. Liste (`20_liste.html`)

| id | Görev |
|---|---|
| `#q` | Arama (Türkçe karakter ve büyük/küçük harf duyarsız) |
| `#addBtn`, `#clrBtn` | Satır ekle, listeyi temizle |
| `#photoDir`, `#photoIn` | Fotoğraf klasörü / toplu fotoğraf seçimi |
| `#tbl` | Tablo (`data-k` hücre girişleri, `data-pick` fotoğraf, `data-del` sil) |
| `#pgOnce`, `#pgSonra`, `#pgBilgi`, `#pgBoyut` | Sayfalama |
| `#cnt` | Kişi sayısı |

## 3. Kontrol (`30_kontrol.html`)

| id | Görev |
|---|---|
| `#kontrolBtn`, `#telDuzelt`, `#mukerrerBtn`, `#mukerrerBirlestir` | Denetim, telefon düzeltme, mükerrer bul, kesin olanları birleştir |
| `#kontrolSonuc` | Sonuç listesi (`data-git` satıra git, `data-birles` grubu birleştir) |
| `#kontrolOzet` | Özet |
| `#mukBenzer` | Benzer adları da bul (olası grup) |
| `#duzBosluk`, `#duzAd`, `#duzMail`, `#duzTel`, `#duzUnvan` | Toplu düzeltme seçenekleri |
| `#unvanSozluk` | Sözlük (`bul=yerine`, satır satır; tarayıcıda saklanır) |
| `#duzOnizle`, `#duzUygula`, `#duzSonuc` | Önizle, işaretlileri uygula (`data-duz` onay kutuları) |

## 4. Ayarlar ve çıktı (`40_cikti.html`)

| id | Görev |
|---|---|
| `#ver` | vCard sürümü 2.1 / 3.0 / 4.0 |
| `#optSkip`, `#optFn`, `#optSplit`, `#optTel` | Boş alan atla, FN yedeği, ad/soyad ayır, telefonu +90'a çevir |
| `#optHarita` | Adresi Google Haritalar bağlantısı olarak vCard'a ekle (varsayılan açık) |
| `#optAyikla`, `#mukGeriAl` | Yüklerken mükerrer ayıkla (varsayılan açık); son ayıklamayı geri al |
| `data-harita` (📍) | Satırdaki adresi Google Haritalar'da yeni sekmede açar |
| `#dahiliMod`, `#optOrg`, `#dispSablon` | Dahili numara modu, bileşenli ORG, görünen ad şablonu |
| `#outlookCsv`, `#googleCsv`, `#csvTarih` | CSV çıktıları ve doğum tarihi biçimi |
| `#yazdirBtn` | Yazdırılabilir rehber (`#yazdirAlani` geçici alan) |
| `#dahilListe` (`[data-dahil=alan]`) | Rehbere yazılacak alanlar |
| `#genBtn`, `#dlBtn`, `#cpBtn` | Hazırla, indir, kopyala |
| `#msg`, `#dogrulaSonuc`, `#out` | Mesaj, kendini sınama sonucu, önizleme |
| `#grupSec`, `#grupIndir`, `#grupZip`, `#icsIndir` | Grup seçimi, grup .vcf, ZIP, .ics |

## QR penceresi (`src/html/50_qr.html`)

`<dialog id="qrDlg">`: `#qrBaslik`, `#qrCanvas`, `#qrBilgi`, `#qrDl` (PNG indir), `#qrKapat`. Listede her satırın sonundaki 📱 (`data-qr`) açar.

Pencere/diyalog: tarayıcı `prompt` (eşleştirme adı), `confirm` (silme/birleştirme) ve QR `<dialog>` kullanılır.
