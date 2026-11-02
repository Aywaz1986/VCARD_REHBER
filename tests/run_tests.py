#!/usr/bin/env python3
"""Tek komut: derle + yerel sunucu + tüm testler.

  python tests/run_tests.py            hepsi
  python tests/run_tests.py 02 04      yalnızca 02_ ve 04_ ile başlayanlar

Gereksinim: pip install playwright pillow openpyxl ; playwright install chromium
"""
import functools
import glob
import http.server
import os
import subprocess
import sys
import threading

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subprocess.check_call([sys.executable, os.path.join(KOK, "build.py")])
dist = glob.glob(os.path.join(KOK, "dist", "VCARD_Rehber_Hazirla-*.html"))[0]

isleyici = functools.partial(http.server.SimpleHTTPRequestHandler, directory=os.path.join(KOK, "dist"))
isleyici.log_message = lambda *a, **k: None
sunucu = http.server.ThreadingHTTPServer(("127.0.0.1", 0), isleyici)
threading.Thread(target=sunucu.serve_forever, daemon=True).start()
env = dict(os.environ, VCARD_URL="http://127.0.0.1:%d/%s" % (sunucu.server_port, os.path.basename(dist)))
kod = subprocess.call([sys.executable, os.path.join(KOK, "tests", "calistir.py")] + sys.argv[1:], env=env)
sunucu.shutdown()
sys.exit(kod)
