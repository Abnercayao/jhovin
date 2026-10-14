#!/usr/bin/env python3
"""Genera imagenes con sd-server local (stable-diffusion.cpp, Z-Image Turbo) en 127.0.0.1:1234.

Lee tools/sd_prompts.json: lista de {"path","size","seed","prompt","salida":[ancho,alto],"max_kb"}.
  - productos: salida 600x600 sobre blanco (webp ~q80, <70 KB), guardada en assets/p/<id>.webp
  - portadas: se reescalan a "salida" (webp, <max_kb)
Uso: python tools/generar_sd.py [--only P1001 hero-a ...] [--seed-offset N]
El servidor se enciende/apaga aparte (tienda-tarapoto\\tools\\iniciar-sd-server.bat / detener-sd-server.bat).
"""
import argparse, base64, io, json, sys, time, urllib.request
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
SD = "http://127.0.0.1:1234"


def generar(prompt, size, seed):
    extra = {"seed": seed, "sample_params": {"sample_steps": 8, "sample_method": "euler", "scheduler": "simple",
                                              "guidance": {"txt_cfg": 1.0}}}
    cuerpo = {"prompt": f"{prompt} <sd_cpp_extra_args>{json.dumps(extra)}</sd_cpp_extra_args>", "n": 1,
              "size": size, "output_format": "png"}
    req = urllib.request.Request(SD + "/v1/images/generations", json.dumps(cuerpo).encode(),
                                 {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return base64.b64decode(json.load(r)["data"][0]["b64_json"])


def guardar(png, destino, ancho, alto, max_kb):
    im = Image.open(io.BytesIO(png)).convert("RGB")
    if im.size != (ancho, alto):
        if ancho == alto:  # producto: cuadrado -> lienzo
            im = im.resize((ancho, alto), Image.LANCZOS)
        else:  # portada: escala y recorta al centro la relacion exacta
            r = max(ancho / im.width, alto / im.height)
            im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
            x, y = (im.width - ancho) // 2, (im.height - alto) // 2
            im = im.crop((x, y, x + ancho, y + alto))
    for q in (82, 76, 70, 64, 58, 52, 46, 40):
        b = io.BytesIO()
        im.save(b, "WEBP", quality=q, method=6)
        if b.tell() <= max_kb * 1024:
            break
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_bytes(b.getvalue())
    return b.tell()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompts", default=str(RAIZ / "tools" / "sd_prompts.json"))
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--seed-offset", type=int, default=0, help="se suma a la seed (reintentos)")
    ap.add_argument("--out", help="carpeta alterna (revisar candidatas sin pisar assets)")
    a = ap.parse_args()
    items = json.loads(Path(a.prompts).read_text(encoding="utf-8"))
    for it in items:
        nombre = Path(it["path"]).stem
        if a.only and nombre not in a.only:
            continue
        t0 = time.time()
        png = generar(it["prompt"], it["size"], it["seed"] + a.seed_offset)
        dest = (Path(a.out) / Path(it["path"]).name) if a.out else RAIZ / it["path"]
        ancho, alto = it.get("salida", [600, 600])
        n = guardar(png, dest, ancho, alto, it.get("max_kb", 70))
        print(f"{nombre} seed={it['seed'] + a.seed_offset} {n // 1024} KB {time.time() - t0:.0f} s", flush=True)


if __name__ == "__main__":
    sys.exit(main())
