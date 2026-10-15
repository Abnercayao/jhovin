#!/usr/bin/env python3
"""Busca packshots de los productos de data.js en tiendas peruanas (catalogo publico VTEX) y los normaliza.

Uso (desde la raiz del repo, Python 3 + Pillow):
  python tools/fotos_tiendas.py buscar [P1001 ...]    # consulta Plaza Vea / Wong / Metro (y Oechsle de respaldo) -> tools/_cache/tiendas.json
  python tools/fotos_tiendas.py descargar [P1001 ...] # baja el mejor candidato no rechazado -> assets/p/<id>.webp + creditos.json
  python tools/fotos_tiendas.py q "texto libre"        # busqueda manual en todas las tiendas (muestra puntaje, nombre y URL)
  python tools/fotos_tiendas.py url P1001 <url_imagen> "<fuente>" ["<pagina>"]   # foto concreta (web oficial u otra tienda)
  python tools/fotos_tiendas.py rechazar P1001 ...     # marca la foto actual como mala; 'descargar' tomara la siguiente
  python tools/fotos_tiendas.py estado

Normalizacion: lienzo 600x600 blanco puro, producto centrado con ~6 % de margen, bordes blancos recortados, webp q~82.
Cortesia: User-Agent propio y >= 1 s entre peticiones reales (las respuestas se guardan en tools/_cache/http).
"""
import hashlib, io, json, re, sys, time, unicodedata, urllib.parse, urllib.request
from pathlib import Path

from PIL import Image, ImageChops

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / "tools" / "_cache"
HTTP = CACHE / "http"
SALIDA = RAIZ / "assets" / "p"
UA = {"User-Agent": "JhovinDemo/0.2 (github.com/Abnercayao/jhovin)"}
PAUSA = 1.0
LADO, MARGEN, KB = 600, 0.06, 70
TIENDAS = {"Plaza Vea": "https://www.plazavea.com.pe", "Wong": "https://www.wong.pe", "Metro": "https://www.metro.pe",
           "Oechsle": "https://www.oechsle.pe"}
UMBRAL = 70
_ultima = [0.0]


def pedir(url, binario=False):
    """GET con cache en disco y pausa de cortesia solo para peticiones reales."""
    HTTP.mkdir(parents=True, exist_ok=True)
    f = HTTP / (hashlib.sha1(url.encode()).hexdigest() + (".bin" if binario else ".json"))
    if f.exists():
        d = f.read_bytes()
        return d if binario else json.loads(d)
    dt = PAUSA - (time.time() - _ultima[0])
    if dt > 0:
        time.sleep(dt)
    _ultima[0] = time.time()
    d = None
    for intento in range(3):  # 429/5xx: espera creciente y reintenta
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                d = r.read()
            break
        except Exception as e:  # una tienda caida no debe tumbar toda la corrida
            if intento == 2 or "404" in str(e):
                print(f"  ! {url[:90]} -> {e}")
                return None
            time.sleep(8 * (intento + 1))
            _ultima[0] = time.time()
    if not binario:
        try:
            json.loads(d)
        except Exception:
            return None
    f.write_bytes(d)
    return d if binario else json.loads(d)


def norm(s):
    s = unicodedata.normalize("NFD", str(s or "").lower())
    return re.sub(r"[^a-z0-9 ]+", " ", "".join(c for c in s if unicodedata.category(c) != "Mn"))


def productos():
    txt = (RAIZ / "data.js").read_text(encoding="utf-8")
    raw = re.search(r"window\.RAW = `(.*?)`;", txt, re.S).group(1).strip().split("\n")
    return [dict(zip(("n", "m", "c", "precio", "caja"), l.split("|")), id=f"P{1001 + i}") for i, l in enumerate(raw)]


UNI = {"kg": 1000, "g": 1, "gr": 1, "grs": 1, "l": 1000, "lt": 1000, "lts": 1000, "ml": 1, "litro": 1000, "litros": 1000}
STOP = set("de en con sin x pack la el del los las y sobres cubos un una por para al a lata bolsa botella frasco caja unidades und u".split())


def tamano(s):
    s = norm(s)
    q = None
    mm = re.search(r"(\d+(?:\.\d+)?)\s*(kg|grs|gr|g|lts|lt|litros|litro|l|ml)\b", re.sub(r"(\d) (\d)", r"\1.\2", s))
    if mm:
        q = float(mm.group(1)) * UNI[mm.group(2)]
    u = re.search(r"\bx\s*(\d+)\b|\b(\d+)\s*(?:pack|sobres|cubos|un|und|unidades)\b", s)
    return q, int(next(g for g in u.groups() if g)) if u else None


def tokens_nombre(p):
    quitar = set(norm(p["m"]).split())
    return [t for t in norm(p["n"]).split() if t not in quitar and t not in STOP and not t[0].isdigit() and t not in UNI]


def igual(t, ct):
    return t == ct or (len(t) >= 4 and len(ct) >= 4 and (ct.startswith(t) or t.startswith(ct)))


def puntuar(p, nombre, marca):
    nm, nb = norm(nombre), norm(marca)
    bt = norm(p["m"]).split()
    ctoks = (nb + " " + nm).split()
    s = 35 if all(any(igual(t, c) for c in ctoks) for t in bt) else 0
    ts = tokens_nombre(p)
    s += 40 * (sum(any(igual(t, c) for c in ctoks) for t in ts) / len(ts)) if ts else 40
    q, u = tamano(p["n"])
    cq, cu = tamano(nombre)
    if q and cq:
        s += 20 if abs(q - cq) < 0.5 else -35
    if u and cu:
        s += 5 if u == cu else -10
    extra = [c for c in set(nm.split()) if not any(igual(t, c) for t in ts + bt) and c not in STOP and not c[0].isdigit() and c not in UNI]
    return round(s - min(2 * len(extra), 14), 1)


def grande(url):
    """VTEX: .../ids/<n>/x.jpg -> ids/<n>-1000-1000/x.jpg (ya suele ser 1000 px)."""
    return re.sub(r"/ids/(\d+)/", r"/ids/\1-1000-1000/", url)


def consultar(tienda, texto):
    url = f"{TIENDAS[tienda]}/api/catalog_system/pub/products/search?ft={urllib.parse.quote(texto)}&_from=0&_to=11"
    d = pedir(url)
    out = []
    for it in d if isinstance(d, list) else []:
        try:
            imgs = [i["imageUrl"] for i in it["items"][0]["images"] if i.get("imageUrl")][:3]
        except (KeyError, IndexError):
            continue
        try:
            precio = it["items"][0]["sellers"][0]["commertialOffer"]["Price"]
        except (KeyError, IndexError):
            precio = None
        if imgs:
            out.append({"tienda": tienda, "precio": precio, "nombre": it.get("productName", ""), "marca": it.get("brand", ""),
                        "pagina": it.get("link", ""), "imgs": [grande(i) for i in imgs]})
    return out


def consultas(p):
    nombre = p["n"]
    sin_tam = re.sub(r"\b\d+(?:[.,]\d+)?\s*(?:kg|g|gr|l|lt|ml)\b|\bx\s*\d+\b|\b\d+\s*pack\b", "", nombre, flags=re.I).strip()
    return [nombre, sin_tam, f"{p['m']} {nombre.split()[0]}"]


def buscar(ids):
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / "tiendas.json"
    res = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    for p in productos():
        if ids and p["id"] not in ids:
            continue
        cands = {}
        mejor = 0
        for k, q in enumerate(consultas(p)):
            tiendas = list(TIENDAS) if k == 2 else ["Plaza Vea", "Wong", "Metro"]
            if k and mejor >= UMBRAL + 10:
                break
            for t in tiendas:
                for c in consultar(t, q):
                    c["puntaje"] = puntuar(p, c["nombre"], c["marca"])
                    cands[(c["tienda"], c["imgs"][0])] = c
            mejor = max([c["puntaje"] for c in cands.values()] or [0])
        orden = sorted(cands.values(), key=lambda c: -c["puntaje"])[:10]
        res[p["id"]] = orden
        top = orden[0] if orden else None
        print(f"{p['id']} {p['n'][:42]:42} -> " + (f"{top['puntaje']:5} {top['tienda']}: {top['nombre'][:50]}" if top else "SIN RESULTADOS"), flush=True)
        f.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")


def quitar_banda(im):
    """Plaza Vea/Wong/Metro: muchas fotos traen una franja plana de color con texto ('900 mL', 'Sin antioxidantes')
    separada del producto por un hueco blanco. Se detecta como segmento lateral angosto y de color casi uniforme y se recorta.
    shortcut: solo franjas laterales con hueco; las pegadas al producto o inferiores se recortan a mano (fotos_recortes.json)."""
    import numpy as np
    a = np.asarray(im.convert("RGB")).astype(np.int16)
    H, W, _ = a.shape
    nb = (a < 240).any(axis=2)
    hay = nb.sum(axis=0) > 2
    comps, x = [], 0
    while x < W:
        if hay[x]:
            x0 = x
            hueco = 0
            while x < W and hueco < 14:
                hueco = 0 if hay[x] else hueco + 1
                x += 1
            comps.append([x0, x - hueco - 1])
        else:
            x += 1
    if len(comps) < 2:
        return im, False
    quitar = []
    for c in (comps[0], comps[-1]):  # la franja siempre esta en un extremo
        if (c[1] - c[0] + 1) > 0.36 * W:
            continue
        px = a[:, c[0]:c[1] + 1][nb[:, c[0]:c[1] + 1]] // 24
        claves = px[:, 0] * 100 + px[:, 1] * 10 + px[:, 2]
        top3 = np.sort(np.bincount(claves))[-3:].sum() / len(claves)
        filas = np.where(nb[:, c[0]:c[1] + 1].any(axis=1))[0]
        if top3 >= 0.6 and (filas[-1] - filas[0]) >= 0.30 * H:
            quitar.append(c)
    if not quitar or len(quitar) == len(comps):  # nada, o todo parece franja: no se toca
        return im, False
    x0 = min(c[0] for c in comps if c not in quitar)
    x1 = max(c[1] for c in comps if c not in quitar)
    return im.crop((x0, 0, x1 + 1, H)), True


def recortes():
    f = RAIZ / "tools" / "fotos_recortes.json"   # {"P1038": [x0, y0, x1, y1]} en pixeles de la imagen original
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}


def normalizar(data, caja_manual=None):
    im = Image.open(io.BytesIO(data))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        fondo = Image.new("RGBA", im.size, (255, 255, 255, 255))
        fondo.alpha_composite(im)
        im = fondo
    im = im.convert("RGB")
    if caja_manual:
        if isinstance(caja_manual, dict):  # {"blanquear": [[x0,y0,x1,y1], ...], "crop": [...], "mejorar": true}
            from PIL import ImageDraw
            for r in caja_manual.get("blanquear", []):
                ImageDraw.Draw(im).rectangle(r, fill=(255, 255, 255))
            if caja_manual.get("mejorar"):  # foto de tienda lavada o blanda: contraste y nitidez suaves
                from PIL import ImageEnhance, ImageFilter
                im = ImageEnhance.Color(ImageEnhance.Contrast(im).enhance(1.22)).enhance(1.12).filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))
            caja_manual = caja_manual.get("crop") or (0, 0, im.width, im.height)
        im = im.crop(tuple(caja_manual))
    else:
        im, _ = quitar_banda(im)
    dif = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 14 else 0)
    import numpy as np
    m = np.asarray(dif) > 0
    umbral = max(4, int(0.02 * max(im.size)))  # filas/columnas con menos pixeles son motas sueltas (restos del pie legal), no producto
    ys, xs = np.where(m.sum(axis=1) >= umbral)[0], np.where(m.sum(axis=0) >= umbral)[0]
    if len(xs) and len(ys):
        im = im.crop((int(xs[0]), int(ys[0]), int(xs[-1]) + 1, int(ys[-1]) + 1))
    caja = int(LADO * (1 - 2 * MARGEN))
    k = min(caja / im.width, caja / im.height, 2.0)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    im = im.point(lambda v: 255 if v >= 247 else v)  # blanco puro donde el fondo era casi blanco (ruido JPEG)
    lienzo = Image.new("RGB", (LADO, LADO), (255, 255, 255))
    lienzo.paste(im, ((LADO - im.width) // 2, (LADO - im.height) // 2))
    for q in (82, 78, 74, 70):
        b = io.BytesIO()
        lienzo.save(b, "WEBP", quality=q, method=6)
        if b.tell() <= KB * 1024:
            break
    return b.getvalue()


def cargar_creditos():
    f = SALIDA / "creditos.json"
    return {c["id"]: c for c in json.loads(f.read_text(encoding="utf-8"))} if f.exists() else {}


def guardar_creditos(cr):
    ids = [p["id"] for p in productos()]
    (SALIDA / "creditos.json").write_text(json.dumps([cr[i] for i in ids if i in cr], ensure_ascii=False, indent=1), encoding="utf-8")


def aplicar(pid, url, fuente, pagina="", nombre="", puntaje=None):
    data = pedir(url, binario=True)
    if not data:
        return False
    try:
        webp = normalizar(data, recortes().get(pid))
    except Exception as e:
        print(f"  ! {pid}: imagen ilegible ({e})")
        return False
    (SALIDA / f"{pid}.webp").write_bytes(webp)
    cr = cargar_creditos()
    cr[pid] = {"id": pid, "origen": "tienda" if not fuente.startswith("web oficial") else "marca", "fuente": fuente,
               "url_producto": pagina, "url_imagen": url, "nombre_origen": nombre, "puntaje": puntaje,
               "licencia": "Imagen referencial de fabricante o tienda; uso demostrativo"}
    guardar_creditos(cr)
    return len(webp)


def rechazados():
    f = CACHE / "rechazados.tiendas.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}


def descargar(ids):
    res = json.loads((CACHE / "tiendas.json").read_text(encoding="utf-8"))
    rech = rechazados()
    hechos = {i for i, c in cargar_creditos().items() if c.get("origen") in ("tienda", "marca")}
    for p in productos():
        if (ids and p["id"] not in ids) or (not ids and p["id"] in hechos):
            continue
        hecho = False
        for c in res.get(p["id"], []):
            if c["puntaje"] < UMBRAL:
                break
            if c["imgs"][0] in rech.get(p["id"], []):
                continue
            n = aplicar(p["id"], c["imgs"][0], c["tienda"], c["pagina"], c["nombre"], c["puntaje"])
            if n:
                print(f"{p['id']} {p['n'][:40]:40} <- {c['tienda']}: {c['nombre'][:45]} ({c['puntaje']}) {n // 1024} KB", flush=True)
                hecho = True
                break
        if not hecho:
            print(f"{p['id']} {p['n'][:40]:40} -- sin candidato >= {UMBRAL}", flush=True)


def buscar_libre(q):
    """Consulta libre en todas las tiendas, ordenada por coincidencia con las palabras de la consulta."""
    p = {"n": q, "m": ""}
    cs = [c for t in TIENDAS for c in consultar(t, q)]
    for c in cs:
        c["pt"] = puntuar(p, c["nombre"], c["marca"])
    return sorted(cs, key=lambda c: -c["pt"])[:int(__import__("os").environ.get("NQ", 8))]


def hoja_candidatos(ids, n=4, minimo=-25):
    """Hoja con las fotos de los mejores candidatos (todas sus imagenes) para elegir a ojo -> tools/hojas/c_<n>.jpg"""
    from PIL import ImageDraw, ImageFont
    res = json.loads((CACHE / "tiendas.json").read_text(encoding="utf-8"))
    celdas = []
    for pid in ids:
        top = (res.get(pid) or [{"puntaje": 0}])[0]["puntaje"]
        for k, c in enumerate(res.get(pid, [])[:n]):
            if c["puntaje"] < top + minimo:
                continue
            for i, u in enumerate(c["imgs"]):
                celdas.append((f"{pid} c{k} i{i}", f"{c['tienda'][:5]} {c['puntaje']:.0f} {c['nombre'][:30]}", u))
    f = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 12)
    fb = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 14)
    (RAIZ / "tools" / "hojas").mkdir(parents=True, exist_ok=True)
    for h in range(0, len(celdas), 24):
        lienzo = Image.new("RGB", (1500, 1160), (235, 235, 235))
        d = ImageDraw.Draw(lienzo)
        for j, (a, b, u) in enumerate(celdas[h:h + 24]):
            x, y = (j % 6) * 250 + 10, (j // 6) * 290 + 4
            data = pedir(u, binario=True)
            if data:
                im = Image.open(io.BytesIO(data)).convert("RGB")
                im.thumbnail((230, 230))
                lienzo.paste(im, (x, y))
            d.text((x, y + 234), a, font=fb, fill="black")
            d.text((x, y + 252), b, font=f, fill=(60, 60, 60))
        out = RAIZ / "tools" / "hojas" / f"c_{h // 24 + 1:02d}.jpg"
        lienzo.save(out, quality=88)
        print(out, len(celdas[h:h + 24]))


def hoja_crudo(ids):
    """Imagenes originales (1000 px) con rejilla cada 100 px para decidir recortes manuales -> tools/hojas/crudo_<n>.jpg"""
    from PIL import ImageDraw, ImageFont
    cr = cargar_creditos()
    f = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 11)
    for h in range(0, len(ids), 6):
        lienzo = Image.new("RGB", (1260, 840), (235, 235, 235))
        d = ImageDraw.Draw(lienzo)
        for j, pid in enumerate(ids[h:h + 6]):
            im = Image.open(io.BytesIO(pedir(cr[pid]["url_imagen"], binario=True))).convert("RGB").resize((400, 400))
            x, y = (j % 3) * 420 + 5, (j // 3) * 420 + 5
            lienzo.paste(im, (x, y))
            for k in range(0, 1000, 100):
                p = k * 0.4
                d.line([(x + p, y), (x + p, y + 400)], fill=(255, 0, 255), width=1)
                d.line([(x, y + p), (x + 400, y + p)], fill=(255, 0, 255), width=1)
                d.text((x + p + 2, y + 1), str(k), font=f, fill=(200, 0, 200))
                d.text((x + 1, y + p + 1), str(k), font=f, fill=(200, 0, 200))
            d.text((x + 150, y + 380), pid, font=f, fill=(0, 0, 0))
        out = RAIZ / "tools" / "hojas" / f"crudo_{h // 6 + 1:02d}.jpg"
        lienzo.save(out, quality=85)
        print(out)


def hoja_libre(consultas, imgs=1):
    """Hoja con las fotos de los primeros resultados de consultas libres (etiqueta: consulta#N.imagen) -> tools/hojas/v_<n>.jpg"""
    from PIL import ImageDraw, ImageFont
    f = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 12)
    fb = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 14)
    celdas = []
    for qi, q in enumerate(consultas):
        for n, c in enumerate(buscar_libre(q), 1):
            for i, u in enumerate(c["imgs"][:imgs]):
                celdas.append((f"q{qi + 1} #{n}.{i}", f"{c['tienda'][:5]} {c['nombre'][:34]}", u))
    for h in range(0, len(celdas), 24):
        lienzo = Image.new("RGB", (1500, 1160), (235, 235, 235))
        d = ImageDraw.Draw(lienzo)
        for j, (a, b, u) in enumerate(celdas[h:h + 24]):
            x, y = (j % 6) * 250 + 10, (j // 6) * 290 + 4
            data = pedir(u, binario=True)
            if data:
                im = Image.open(io.BytesIO(data)).convert("RGB")
                im.thumbnail((230, 230))
                lienzo.paste(im, (x, y))
            d.text((x, y + 234), a, font=fb, fill="black")
            d.text((x, y + 252), b, font=f, fill=(60, 60, 60))
        out = RAIZ / "tools" / "hojas" / f"v_{h // 24 + 1:02d}.jpg"
        lienzo.save(out, quality=88)
        print(out, len(celdas[h:h + 24]))


def elegir(pid, k, i):
    c = json.loads((CACHE / "tiendas.json").read_text(encoding="utf-8"))[pid][int(k)]
    n = aplicar(pid, c["imgs"][int(i)], c["tienda"], c["pagina"], c["nombre"], c["puntaje"])
    print(pid, f"{n // 1024} KB" if n else "FALLO", c["tienda"], c["nombre"][:50])


def main():
    a = sys.argv[1:]
    if not a:
        return print(__doc__)
    cmd, resto = a[0], a[1:]
    if cmd == "buscar":
        buscar(set(resto))
    elif cmd == "descargar":
        descargar(set(resto))
    elif cmd == "q":  # q "consulta" ["otra" ...]  -> lista numerada (por consulta) para 'usar'
        for q in resto:
            for n, c in enumerate(buscar_libre(q), 1):
                print(f"{n:2} {c['tienda'][:5]:5} {c['nombre'][:58]:58} | {c['marca'][:12]:12} {c.get('precio')}")
            print("--")
    elif cmd == "usar":  # usar P1018 "consulta" N [imagen=0]
        c = buscar_libre(resto[1])[int(resto[2]) - 1]
        i = int(resto[3]) if len(resto) > 3 else 0
        n = aplicar(resto[0], c["imgs"][i], c["tienda"], c["pagina"], c["nombre"], None)
        print(resto[0], f"{n // 1024} KB" if n else "FALLO", c["tienda"], c["nombre"][:60])
    elif cmd == "url":
        n = aplicar(resto[0], resto[1], resto[2], resto[3] if len(resto) > 3 else "", "manual")
        print(resto[0], f"{n // 1024} KB" if n else "FALLO")
    elif cmd == "rechazar":
        rech = rechazados()
        cr = cargar_creditos()
        for pid in resto:
            if cr.get(pid, {}).get("url_imagen"):
                rech.setdefault(pid, []).append(cr[pid]["url_imagen"])
                cr[pid]["origen"] = "rechazado"
        (CACHE / "rechazados.tiendas.json").write_text(json.dumps(rech, indent=1), encoding="utf-8")
        guardar_creditos(cr)
    elif cmd == "renorm":  # repite la normalizacion con las imagenes ya en cache
        for pid, c in cargar_creditos().items():
            if c.get("origen") in ("tienda", "marca") and (not resto or pid in resto):
                aplicar(pid, c["url_imagen"], c["fuente"], c["url_producto"], c["nombre_origen"], c.get("puntaje"))
    elif cmd == "crudo":
        hoja_crudo(resto)
    elif cmd == "ver":  # ver "consulta" ["otra" ...]  (variable IMGS = imagenes por resultado)
        hoja_libre(resto, int(__import__("os").environ.get("IMGS", 1)))
    elif cmd == "cands":
        hoja_candidatos(resto)
    elif cmd == "elegir":
        elegir(*resto)
    elif cmd == "estado":
        cr = cargar_creditos()
        from collections import Counter
        print(Counter(c.get("fuente", c.get("origen")) for c in cr.values()))


if __name__ == "__main__":
    main()
