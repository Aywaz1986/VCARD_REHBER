"""NN_*.py testlerini sırayla koşturur. VCARD_URL ortam değişkeni gerekir (run_tests.py ayarlar)."""
import glob
import os
import subprocess
import sys

dizin = os.path.dirname(os.path.abspath(__file__))
secili = sys.argv[1:]
testler = sorted(glob.glob(os.path.join(dizin, "[0-9][0-9]_*.py")))
if secili:
    testler = [t for t in testler if any(os.path.basename(t).startswith(x) for x in secili)]
basarisiz = []
for t in testler:
    print("\n=== " + os.path.basename(t))
    if subprocess.call([sys.executable, t]) != 0:
        basarisiz.append(os.path.basename(t))
print("\n" + ("TÜM TESTLER GEÇTİ (%d dosya)" % len(testler) if not basarisiz else "BAŞARISIZ: " + ", ".join(basarisiz)))
sys.exit(1 if basarisiz else 0)
