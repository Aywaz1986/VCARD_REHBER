# Git ve GitHub rehberi

Depo: `https://github.com/Aywaz1986/VCARD_REHBER`

## Her değişiklikte

```
# 1) ilgili modülü düzenle (src/ altında)
python build.py                 # dist yenilenir
python tests/run_tests.py       # ilgili testler; büyük işte hepsi
# 2) CHANGELOG.md "Yayınlanmamış" bölümüne ekle; README/docs tablolarını güncelle
git add -A
git commit -m "Kısa Türkçe açıklama"
git push
```

Küçük düzeltmeler doğrudan `main`'e; büyük işlerde dal + Pull Request.

## Sürüm artırma

1. `src/js/01_sabitler.js` → `APP_SURUM`.
2. `python build.py` (eski dist dosyası silinir, yenisi yazılır).
3. README başlığı ve dist adı, CHANGELOG'da "Yayınlanmamış" → yeni sürüm başlığı.
4. İsteğe bağlı etiket: `git tag v2.0.1 && git push --tags`.

## Web arayüzünden klasör yükleme uyarısı

Noktayla başlayan dosyalar (`.gitignore`, `.gitattributes`, `.github/`) web arayüzünden klasör yüklenirken atlanır; ayrıca eklenmelidir.

## Depoya konmayacaklar

Gerçek kişi verisi: `.sqlite`, `.db`, Excel rehberleri, `.vcf`, yedek `.json` (`.gitignore`). Testler yalnızca uydurma veri üretir.

## Yeni oturumda

Claude depoyu yeniden bağlar ve klonlar; `README.md` ve `docs/` oturumlar arası hafızadır. Commit mesajının sonuna Co-Authored-By ve Claude-Session satırları eklenir.
