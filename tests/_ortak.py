"""Testler için ortak yardımcılar (Playwright + gerçek Chromium)."""
import os
import sys
import contextlib
from playwright.sync_api import sync_playwright

URL = os.environ.get("VCARD_URL", "")
HATALAR = []
SAYAC = {"ok": 0, "fail": 0}


def kontrol(ad, kosul, ayrinti=""):
    if kosul:
        SAYAC["ok"] += 1
        print("  ok   ", ad)
    else:
        SAYAC["fail"] += 1
        print("  HATA ", ad, ("-> " + str(ayrinti)[:300]) if ayrinti != "" else "")


@contextlib.contextmanager
def sayfa_ac():
    with sync_playwright() as p:
        tarayici = p.chromium.launch()
        ctx = tarayici.new_context(accept_downloads=True)
        s = ctx.new_page()
        s.on("pageerror", lambda e: HATALAR.append("pageerror: " + str(e)))
        s.on("console", lambda m: HATALAR.append("console: " + m.text) if m.type == "error" else None)
        s.goto(URL)
        s.wait_for_function("window.VCARD!==undefined")
        try:
            yield s
        finally:
            tarayici.close()


def bitir():
    kontrol("tarayıcıda hata yok", not HATALAR, HATALAR)
    print("%d başarılı, %d hatalı" % (SAYAC["ok"], SAYAC["fail"]))
    sys.exit(1 if SAYAC["fail"] else 0)
