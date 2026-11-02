"""Telefondan gelen farklı biçimli .vcf dosyalarının okunması (2.1 QP, katlanmış 3.0, 4.0 + dosya yükleme)."""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(__file__))
from _ortak import kontrol, sayfa_ac, bitir

V21 = ("BEGIN:VCARD\r\nVERSION:2.1\r\nN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:=C4=B0pek;Ay=C5=9Fe;;;\r\n"
       "FN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Ay=C5=9Fe =C4=B0pek\r\nTEL;CELL:+905001112233\r\nTEL;WORK;FAX:03125550000\r\n"
       "EMAIL;PREF;INTERNET:ayse@ornek.com\r\n"
       "ADR;WORK;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:;;Uzun=20adres=20bir=\r\n=20iki;;;;\r\n"
       "BDAY:19800102\r\nEND:VCARD\r\n")
V30 = ("BEGIN:VCARD\r\nVERSION:3.0\r\nN:Yılmaz;Ali;;;\r\nFN:Ali Yılmaz\r\nTEL;TYPE=HOME:02125550000\r\nTEL;TYPE=CELL:+905009998877\r\n"
       "NOTE:yok sayılır\r\nORG:Firma\\; A.Ş.;Birim\r\nURL:https://ornek.com/a\r\nBDAY:1990-12-31\r\nEND:VCARD\r\n")
V40 = ("BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Veli Kaya\r\nN:Kaya;Veli;;;\r\nTEL;TYPE=cell:+905001110000\r\n"
       "PHOTO:data:image/jpeg;base64," + "/9j/4AAQSkZJRgABAQ" * 10 + "\r\nEND:VCARD\r\n")
ham = V21 + V30 + V40

with sayfa_ac() as s:
    k = s.evaluate("(t)=>VCARD.vcfOku(t)", ham)
    kontrol("3 kart okundu", len(k) == 3, len(k))
    a, b, c = k
    kontrol("2.1 QP ad (N: soyad;ad)", a["name"] == "Ayşe İpek", a["name"])
    kontrol("2.1 QP FN", a["disp"] == "Ayşe İpek")
    kontrol("2.1 cep ve fax ayrıldı", a["cell"] == "+905001112233" and a["fax"] == "03125550000", (a["cell"], a["fax"]))
    kontrol("2.1 QP yumuşak satır sonu birleşti", a["addr"] == "Uzun adres bir iki", a["addr"])
    kontrol("2.1 BDAY", a["bday"] == "19800102")
    kontrol("3.0 ev/cep ayrımı", b["home"] == "02125550000" and b["cell"] == "+905009998877")
    kontrol("3.0 ORG kaçışlı ; ve birim yolu", b["org"] == "Firma; A.Ş. > Birim", b["org"])
    kontrol("3.0 BDAY ISO", b["bday"] == "19901231")
    kontrol("3.0 URL ham", b["url"] == "https://ornek.com/a")
    kontrol("4.0 data URI fotoğraf", (c["_img"] or "").startswith("data:image/jpeg;base64,/9j/"))

    yol = os.path.join(tempfile.mkdtemp(), "rehber.vcf")
    open(yol, "w", encoding="utf-8").write(ham)
    s.click('[data-kaynak="vcf"]')
    s.set_input_files("#fileVcf", yol)
    s.wait_for_function("VCARD.D.satirlar.length===3")
    kontrol("dosya yükleme listeye 3 kişi aldı", s.evaluate("VCARD.D.satirlar.length") == 3)
    kontrol("tabloda göründü", "Ayşe İpek" in s.input_value('#tbl tbody tr:first-child input[data-k="name"]'))
bitir()
