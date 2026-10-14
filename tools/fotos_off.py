#!/usr/bin/env python3
"""Busca fotos de los productos de data.js en Open Food Facts y las normaliza.

Uso (desde la raiz del repo, Python 3 + Pillow):
  python tools/fotos_off.py buscar              # consulta la API y guarda candidatos (tools/_cache/hits.json)
  python tools/fotos_off.py descargar           # baja el mejor candidato no rechazado -> assets/p/<id>.webp + creditos.json
  python tools/fotos_off.py rechazar P1001 ...  # tras revisar a ojo: borra la foto y marca ese candidato como malo
  python tools/fotos_off.py asignar P1036 <codigo_off>   # foto de un codigo OFF ya visto en las busquedas
  python tools/fotos_off.py estado              # cuantos tienen foto

API: search-a-licious (https://search.openfoodfacts.org/search); el search.pl clasico estaba caido.
Cortesia: User-Agent propio y >= 1 s entre peticiones.
"""
import io, json, re, sys, time, unicodedata, urllib.parse, urllib.request
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / "tools" / "_cache"
SALIDA = RAIZ / "assets" / "p"
UA = {"User-Agent": "JhovinDemo/0.1 (github.com/Abnercayao/jhovin)"}
LICENCIA = "CC BY-SA 3.0 · Open Food Facts contributors"
UMBRAL = 60          # puntaje minimo para aceptar un candidato (luego se revisa a ojo)
PAUSA = 1.1          # segundos entre peticiones
_ultima = [0.0]


def pedir(url, binario=False):
    dt = PAUSA - (time.time() - _ultima[0])
    if dt > 0:
        time.sleep(dt)
    _ultima[0] = time.time()
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
        d = r.read()
    return d if binario else json.loads(d)


def norm(s):
    s = unicodedata.normalize("NFD", str(s or "").lower())
    return re.sub(r"[^a-z0-9 ]+", " ", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def productos():
    txt = (RAIZ / "data.js").read_text(encoding="utf-8")
    raw = re.search(r"window\.RAW = `(.*?)`;", txt, re.S).group(1).strip().split("\n")
    out = []
    for i, l in enumerate(raw):
        n, m, c, p, caja = l.split("|")
        out.append({"id": f"P{1001 + i}", "n": n, "m": m, "c": c})
    return out


UNI = {"kg": 1000, "g": 1, "gr": 1, "grs": 1, "l": 1000, "lt": 1000, "lts": 1000, "ml": 1}


def tamano(s):
    """-> (cantidad en g/ml o None, unidades por pack o None)"""
    q = None
    mm = re.search(r"(\d+(?:\.\d+)?)\s*(kg|grs|gr|g|lts|lt|l|ml)\b", str(s).lower().replace(",", "."))
    if mm:
        q = float(mm.group(1)) * UNI[mm.group(2)]
    u = re.search(r"\bx\s*(\d+)|(\d+)\s*(?:pack|sobres|cubos)", str(s).lower())
    return q, int(next(g for g in u.groups() if g)) if u else None


STOP = set("de en con sin x pack la el del los las y sobres cubos".split())


def tokens_nombre(p):
    quitar = set(norm(p["m"]).split())
    ts = []
    for t in norm(p["n"]).split():
        if t in quitar or t in STOP or t[0].isdigit() or t in UNI:
            continue
        ts.append(t)
    return ts


def puntuar(p, h):
    marcas = " " + " ".join(norm(b) for b in (h.get("brands") or [])) + " "
    nombre = " " + norm(h.get("product_name")) + " "
    bm = " " + norm(p["m"]).strip() + " "
    marca_ok = bm in marcas or bm in nombre
    pts = 40 if marca_ok else 0
    ts = tokens_nombre(p)
    hn = nombre.split() + marcas.split()
    if ts:
        ok = sum(1 for t in ts if any(w == t or (len(t) > 3 and len(w) > 3 and (w.startswith(t[:4]) or t.startswith(w[:4]))) for w in hn))
        pts += 40 * ok / len(ts)
        if nombre.split() and ts[0] == nombre.split()[0]:
            pts += 5  # mismo tipo de producto al comienzo
    q, u = tamano(p["n"])
    hq, hu = tamano(h.get("quantity") or h.get("product_name") or "")
    if q and hq:
        pts += 20 if abs(q - hq) / q < 0.03 else -10
    if u and hu:
        pts += 10 if u == hu else -5
    if "en:peru" in (h.get("countries_tags") or []):
        pts += 15
    return round(pts if marca_ok else min(pts, 30), 1)  # sin marca no hay candidato valido


def candidatos(p, hits):
    cs = [{"code": h["code"], "score": puntuar(p, h), "nombre": h.get("product_name"), "marcas": h.get("brands"),
           "qty": h.get("quantity"), "img": h["image_front_url"], "paises": (h.get("countries_tags") or [])[:3]}
          for h in hits]
    return sorted(cs, key=lambda c: -c["score"])[:5]


def limpio(n):
    return re.sub(r"\s+", " ", re.sub(r"\b\d[\d.,]*\s*(kg|g|gr|ml|l|lt)\b|\bx\s*\d+|\d+\s*pack", " ", n, flags=re.I)).strip()


def consultar(q):
    u = "https://search.openfoodfacts.org/search?" + urllib.parse.urlencode(
        {"q": q, "page_size": 30, "fields": "code,product_name,brands,quantity,countries_tags,image_front_url"})
    return pedir(u).get("hits", [])


def cmd_buscar():
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / "hits.json"
    res = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    for p in productos():
        if p["id"] in res:
            continue
        base = f'{limpio(p["n"])} {p["m"]}'
        vistos = {}
        for q in (base + ' countries_tags:"en:peru"', base):
            try:
                for h in consultar(q):
                    if h.get("image_front_url"):
                        vistos[h["code"]] = h
            except Exception as e:
                print("  error", p["id"], e)
        res[p["id"]] = list(vistos.values())
        c = candidatos(p, res[p["id"]])
        print(p["id"], p["n"], "->", (c[0]["score"], c[0]["nombre"], c[0]["marcas"]) if c else "SIN RESULTADO", flush=True)
        f.write_text(json.dumps(res, ensure_ascii=False), encoding="utf-8")


def normalizar(datos):
    im = Image.open(io.BytesIO(datos))
    im.load()
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        fondo = Image.new("RGBA", im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(fondo, im)
    im = im.convert("RGB")
    # recorta el margen casi blanco si las esquinas son blancas (fondo liso)
    w, h = im.size
    esq = [im.getpixel(xy) for xy in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3))]
    if all(min(c) > 235 for c in esq):
        dif = Image.eval(im.convert("L"), lambda v: 255 if v < 238 else 0)
        bb = dif.getbbox()
        if bb:
            im = im.crop(bb)
    lado = 520  # 600 - margen de 40 px por lado
    im.thumbnail((lado, lado), Image.LANCZOS)
    lienzo = Image.new("RGB", (600, 600), (255, 255, 255))
    lienzo.paste(im, ((600 - im.width) // 2, (600 - im.height) // 2))
    for calidad in (80, 74, 68, 62, 56, 50):
        b = io.BytesIO()
        lienzo.save(b, "WEBP", quality=calidad, method=6)
        if b.tell() <= 70 * 1024:
            break
    return b.getvalue()


def cmd_descargar():
    SALIDA.mkdir(parents=True, exist_ok=True)
    hits = json.loads((CACHE / "hits.json").read_text(encoding="utf-8"))
    malos = json.loads((CACHE / "rechazados.json").read_text(encoding="utf-8")) if (CACHE / "rechazados.json").exists() else {}
    cf = SALIDA / "creditos.json"
    cred = {c["id"]: c for c in json.loads(cf.read_text(encoding="utf-8"))} if cf.exists() else {}
    for p in productos():
        pid = p["id"]
        if (SALIDA / f"{pid}.webp").exists():
            continue
        for c in candidatos(p, hits.get(pid, [])):
            if c["score"] < UMBRAL or c["code"] in malos.get(pid, []):
                continue
            url = c["img"]
            for u in (re.sub(r"\.\d+\.jpg$", ".full.jpg", url), url):
                try:
                    datos = pedir(u, binario=True)
                    break
                except Exception:
                    datos = None
            if not datos:
                continue
            try:
                webp = normalizar(datos)
            except Exception as e:
                print("  imagen invalida", pid, e)
                continue
            (SALIDA / f"{pid}.webp").write_bytes(webp)
            cred[pid] = {"id": pid, "origen": "off", "codigo_off": c["code"], "url_imagen": u,
                         "nombre_off": c["nombre"], "puntaje": c["score"], "licencia": LICENCIA}
            print(pid, p["n"], "<-", c["nombre"], c["score"], f"{len(webp)//1024} KB", flush=True)
            break
        else:
            print(pid, p["n"], "SIN FOTO OFF")
        cf.write_text(json.dumps(sorted(cred.values(), key=lambda c: c["id"]), ensure_ascii=False, indent=1), encoding="utf-8")


def cmd_rechazar(ids):
    rf = CACHE / "rechazados.json"
    malos = json.loads(rf.read_text(encoding="utf-8")) if rf.exists() else {}
    cf = SALIDA / "creditos.json"
    cred = json.loads(cf.read_text(encoding="utf-8"))
    for pid in ids:
        c = next((x for x in cred if x["id"] == pid), None)
        if c and c.get("codigo_off"):
            malos.setdefault(pid, []).append(c["codigo_off"])
        cred = [x for x in cred if x["id"] != pid]
        (SALIDA / f"{pid}.webp").unlink(missing_ok=True)
        print("rechazada", pid)
    rf.write_text(json.dumps(malos, indent=1), encoding="utf-8")
    cf.write_text(json.dumps(cred, ensure_ascii=False, indent=1), encoding="utf-8")


def cmd_asignar(pid, codigo):
    """Asigna a mano (tras revisar a ojo) la foto de un codigo OFF que aparecio en las busquedas de otro producto."""
    hits = json.loads((CACHE / "hits.json").read_text(encoding="utf-8"))
    h = next(h for hs in hits.values() for h in hs if h["code"] == codigo)
    url = h["image_front_url"]
    u = re.sub(r"\.\d+\.jpg$", ".full.jpg", url)
    try:
        datos = pedir(u, binario=True)
    except Exception:
        u, datos = url, pedir(url, binario=True)
    SALIDA.mkdir(parents=True, exist_ok=True)
    webp = normalizar(datos)
    (SALIDA / f"{pid}.webp").write_bytes(webp)
    cf = SALIDA / "creditos.json"
    cred = [c for c in json.loads(cf.read_text(encoding="utf-8")) if c["id"] != pid]
    cred.append({"id": pid, "origen": "off", "codigo_off": codigo, "url_imagen": u, "nombre_off": h.get("product_name"),
                 "puntaje": "manual", "licencia": LICENCIA})
    cf.write_text(json.dumps(sorted(cred, key=lambda c: c["id"]), ensure_ascii=False, indent=1), encoding="utf-8")
    print(pid, "<-", codigo, h.get("product_name"), f"{len(webp)//1024} KB")


def cmd_estado():
    ps = productos()
    con = [p for p in ps if (SALIDA / f"{p['id']}.webp").exists()]
    pesos = [(SALIDA / f"{p['id']}.webp").stat().st_size for p in con]
    print(f"{len(con)}/{len(ps)} con foto; peso medio {sum(pesos)//max(1,len(pesos))//1024} KB, max {max(pesos, default=0)//1024} KB")


if __name__ == "__main__":
    a = sys.argv[1:] or ["estado"]
    {"buscar": cmd_buscar, "descargar": cmd_descargar, "estado": cmd_estado,
     "rechazar": lambda: cmd_rechazar(a[1:]), "asignar": lambda: cmd_asignar(a[1], a[2])}[a[0]]()
