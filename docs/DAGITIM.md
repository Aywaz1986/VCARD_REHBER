# Genel dağıtım ve Özlük (SQL Server) gömülü kopya — tasarım

Durum: **tasarım (kodlanmadı).** Özlük'ün SQL Server çalışması bittiğinde bu belgeye göre ilerlenir. Amaç: aynı kaynak koddan, herkesin kullanabileceği genel bir kopya ve Özlük içinde doğrudan çalışan bir kopya üretebilmek.

## 1. Hedef

| Kopya | Veri kaynağı | Kime | Not |
|---|---|---|---|
| **Bağımsız** (şu anki) | Excel/CSV, Özlük SQLite dosyası, .vcf, JSON | Dosya veren herkes | `dist/` — mevcut |
| **Özlük gömülü** (ileride) | Özlük'ün SQL Server veritabanı (Özlük uygulaması üzerinden) | Özlük kullanıcıları | Dosya seçmeden doğrudan Özlük verisini okur; alan eşleştirmesi aynı arayüzle |
| **Genel dağıtım** | Excel/CSV, .vcf, isteğe bağlı SQLite; kuruma özel hiçbir ad/varsayılan yok | Herkes | Kurum adı, Özlük sütun önerileri, yazılımcı bilgisi çıkarılabilir |

## 2. Yaklaşım: tek kaynak kod, derleme profilleri

`build.py` bugün tek çıktı üretir. Profil desteği şöyle eklenecek:

- `src/profiller/<ad>.json`: hangi `js/` modüllerinin dahil edileceği, başlık metni, sabitler (`KAYNAK_VARSAYILAN`, kurum adı vb.).
- `python build.py --profil bagimsiz|genel|ozluk-gomulu` → `dist/VCARD_Rehber_<Profil>-<sürüm>.html`.
- Ortak çekirdek (`02`–`07`, `20`–`70`) değişmez; farklılık yalnızca kaynak modüllerinde ve sabitlerdedir.

## 3. Kaynak adaptörü arayüzü (SQL Server öncesi ilk adım)

Bugün `11_kaynak_sqlite.js` hem veritabanı erişimini hem de eşleştirme arayüzünü içerir. SQL Server'a geçişte arayüzü yeniden yazmamak için ikiye ayrılacak:

- `12_kaynak_esleme.js` — **kaynaktan bağımsız** eşleştirme arayüzü (alan ↔ sütun, şablon, süzgeç, kayıtlı eşleştirmeler, otomatik öneri).
- Adaptörler — aşağıdaki sözleşmeyi uygular:

```js
// Adaptör sözleşmesi (öneri)
{
  ad: 'sqlite' | 'sqlserver' | ...,
  tablolar():            Promise<[ad]>,
  sutunlar(tablo):       Promise<[ad]>,
  oku(tablo, sutunlar, suzgec):  // suzgec = {sutun, op, deger} | null
                         Promise<AsyncIterable<[değerler]>>   // BLOB: Uint8Array
}
```

SQLite adaptörü `sql.js` kullanır (bugünkü kod). SQL Server adaptörü aşağıdaki "köprü"yü kullanır.

## 4. Özlük gömülü kopya: veriye erişim köprüsü

Tarayıcıdaki bir HTML doğrudan SQL Server'a bağlanamaz. Özlük'ün SQL Server sürümünün mimarisi (ör. C# uygulaması içinde WebView/yerel servis) netleşince şu seçeneklerden biri uygulanır:

1. **Ev sahibi uygulama köprüsü (önerilen):** Özlük uygulaması sayfayı barındırır ve `window.VCARD_HOST = {tablolar, sutunlar, oku}` nesnesini enjekte eder. Araç bu nesneyi adaptör olarak kullanır; kimlik doğrulama ve yetki Özlük'te kalır (kullanıcı yalnızca yetkili olduğu kayıtları görür).
2. **Yerel HTTP servisi:** Özlük, `localhost` üzerinde salt okunur bir uç nokta açar; araç `fetch` ile okur.
3. **Dışa aktarılan dosya:** Özlük, şifresiz SQLite/JSON dışa aktarır (bugünkü yol).

Güvenlik ilkeleri (hepsi için): yalnızca eşleştirilen sütunlar istenir; salt okunur; hassas sütun listesi (TC, kan grubu, sağlık, MSB…) için ev sahibi tarafında izin listesi; yetkisiz kullanıcıya rehber üretimi kapalı; işlem günlüğüne "rehber üretildi" kaydı (Özlük tarafında).

## 5. Genel dağıtım kopyası için kontrol listesi

- [ ] Kuruma özel ad/varsayılan yok (Özlük sütun önerileri `ONERI` tablosu profilden gelir).
- [ ] Tek dosya, çevrimdışı, harici bağımlılık yok (mevcut test geçmeli).
- [ ] Kullanım kılavuzu (Word) ve sürüm numarası başlıkta.
- [ ] Lisans ve kaynak bilgisi eklenir (eski aracın yazılımcı bilgisi/IBAN'ı taşınmamıştır; dağıtım öncesi karar verilir).
- [ ] Gerçek cihaz testleri (Android/iPhone) tamamlanmış.
- [ ] Gizlilik varsayılanları gözden geçirilmiş (adres ve doğum tarihi varsayılanı).

## 6. Geçiş sırası

1. Gerçek cihaz testi → varsayılan sürüm kararı.
2. Kaynak adaptörü arayüzüne ayırma (davranış değişmez; testler aynen geçmeli).
3. Profil desteği (`--profil`) ve **genel** profil.
4. Özlük SQL Server mimarisi netleşince **ozluk-gömülü** profil ve köprü.
