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
| `#kontrolBtn`, `#telDuzelt`, `#mukerrerBtn`, `#mukerrerBirlestir` | Denetim, telefon düzeltme, mükerrer bul, tümünü birleştir |
| `#kontrolSonuc` | Sonuç listesi (`data-git` satıra git, `data-birles` grubu birleştir) |
| `#kontrolOzet` | Özet |

## 4. Ayarlar ve çıktı (`40_cikti.html`)

| id | Görev |
|---|---|
| `#ver` | vCard sürümü 2.1 / 3.0 / 4.0 |
| `#optSkip`, `#optFn`, `#optSplit`, `#optTel` | Boş alan atla, FN yedeği, ad/soyad ayır, telefonu +90'a çevir |
| `#dahilListe` (`[data-dahil=alan]`) | Rehbere yazılacak alanlar |
| `#genBtn`, `#dlBtn`, `#cpBtn` | Hazırla, indir, kopyala |
| `#msg`, `#dogrulaSonuc`, `#out` | Mesaj, kendini sınama sonucu, önizleme |
| `#grupSec`, `#grupIndir`, `#grupZip`, `#icsIndir` | Grup seçimi, grup .vcf, ZIP, .ics |

Pencere/diyalog: yalnızca tarayıcı `prompt` (eşleştirme adı) ve `confirm` (silme/birleştirme) kullanılır.
