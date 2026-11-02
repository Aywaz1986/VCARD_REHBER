# Değişiklik günlüğü

## Yayınlanmamış

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
