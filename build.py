#!/usr/bin/env python3
"""Derleme betiği: src/ -> tek dosya HTML (dist/).

Yalnızca Python standart kütüphanesi kullanır.

Kullanım:
  python build.py                 dist/VCARD_Rehber_Hazirla-<sürüm>.html üretir
  python build.py --check         dist/ içindeki dosyanın kaynakla aynı olduğunu doğrular
  python build.py --out yol.html  başka bir yola yazar

Şablonda (src/index.template.html):
  {{INCLUDE:yol}}            tek dosyayı ekler
  {{INCLUDE:klasor/*.ext}}   klasördeki dosyaları ada göre sıralı ekler
  {{APP_SURUM}}              src/js/01_sabitler.js içindeki APP_SURUM değeri
"""
import argparse
import glob
import os
import re
import sys

KOK = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(KOK, "src")
DIST = os.path.join(KOK, "dist")
AD = "VCARD_Rehber_Hazirla"


def surum():
    with open(os.path.join(SRC, "js", "01_sabitler.js"), encoding="utf-8") as f:
        m = re.search(r"APP_SURUM\s*=\s*'([^']+)'", f.read())
    if not m:
        sys.exit("APP_SURUM bulunamadı (src/js/01_sabitler.js)")
    return m.group(1)


def oku(yol):
    with open(yol, encoding="utf-8", newline="") as f:
        return f.read().replace("\r\n", "\n")


def ekle(eslesme):
    desen = eslesme.group(1).strip()
    yollar = sorted(glob.glob(os.path.join(SRC, desen)))
    if not yollar:
        sys.exit("INCLUDE bulunamadı: " + desen)
    parcalar = []
    for y in yollar:
        parcalar.append(oku(y).rstrip("\n"))
    return "\n".join(parcalar)


def derle():
    sablon = oku(os.path.join(SRC, "index.template.html"))
    cikti = re.sub(r"\{\{INCLUDE:([^}]+)\}\}", ekle, sablon)
    cikti = cikti.replace("{{APP_SURUM}}", surum())
    # vendor kütüphanelerinde </script> bulunmamalı
    return cikti


def hedef():
    return os.path.join(DIST, "%s-%s.html" % (AD, surum()))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--out")
    a = ap.parse_args()
    metin = derle()
    yol = a.out or hedef()
    if a.check:
        if not os.path.exists(yol):
            sys.exit("dist dosyası yok: " + yol)
        with open(yol, encoding="utf-8", newline="") as f:
            mevcut = f.read()
        if mevcut != metin:
            sys.exit("dist güncel değil, 'python build.py' çalıştırın: " + yol)
        print("dist güncel:", os.path.basename(yol))
        return
    os.makedirs(os.path.dirname(yol), exist_ok=True)
    if not a.out:
        for eski in glob.glob(os.path.join(DIST, AD + "-*.html")):
            if eski != yol:
                os.remove(eski)
    with open(yol, "w", encoding="utf-8", newline="\n") as f:
        f.write(metin)
    print("yazıldı:", yol, "(%d KB)" % (len(metin.encode("utf-8")) // 1024))


if __name__ == "__main__":
    main()
