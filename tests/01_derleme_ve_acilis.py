"""Derleme güncel mi, sayfa hatasız açılıyor mu, dış bağımlılık yok mu."""
import glob
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
r = subprocess.run([sys.executable, os.path.join(KOK, "build.py"), "--check"], capture_output=True, text=True)
kontrol("dist kaynakla aynı (build.py --check)", r.returncode == 0, r.stdout + r.stderr)

dosya = glob.glob(os.path.join(KOK, "dist", "VCARD_Rehber_Hazirla-*.html"))
kontrol("dist içinde tek dosya var", len(dosya) == 1, dosya)
html = open(dosya[0], encoding="utf-8").read()
dis = re.findall(r'<(?:script|link|img)[^>]+(?:src|href)=["\']https?://', html)
kontrol("dış kaynak (CDN) bağımlılığı yok", not dis, dis)

with sayfa_ac() as s:
    kontrol("sürüm başlıkta görünüyor", s.inner_text("#surum").startswith("v"))
    kontrol("API sürümü sabitle aynı", s.evaluate("VCARD.APP_SURUM") in dosya[0])
    kontrol("4 veri kaynağı sekmesi", s.locator("#kaynakSekme button[data-kaynak]").count() == 4)
    s.click('[data-kaynak="sqlite"]')
    kontrol("SQLite paneli açılıyor", s.is_visible('[data-pane="sqlite"]') and not s.is_visible('[data-pane="excel"]'))
bitir()
