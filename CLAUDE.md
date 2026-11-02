# CLAUDE.md

- **Önce `README.md`'yi oku** (çalışma kuralları en üstte). Modülü README'deki modül tablosundan bul; tüm dosyayı okuma.
- Kaynak `src/`'dir, `dist/` üretilir: değişiklik → `python build.py` → `python tests/run_tests.py` → commit → push.
- Her değişiklikte dist, CHANGELOG, README tabloları ve gerekiyorsa `docs/` aynı commit'te güncellenir.
- Mimari ve kaynak sözleşmesi: `docs/MIMARI.md`; yapılacaklar: `docs/YOLHARITASI.md`; Özlük/SQL Server kopyası: `docs/DAGITIM.md`.
- Gerçek kişi verisi (.sqlite, Excel rehber, .vcf, yedek .json) depoya konmaz.
- Türkçe yanıt ver; kullanıcı adım adım ayrıntılı açıklama ve karmaşık özelliklerde kodlamadan önce tasarım önizlemesi ister.
- Commit sonuna Co-Authored-By ve Claude-Session satırları eklenir.
