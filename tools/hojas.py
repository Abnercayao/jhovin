#!/usr/bin/env python3
"""Hojas de contacto (24 miniaturas con id y nombre) para revisar las fotos a ojo.
Uso: python tools/hojas.py [--dir assets/p] [--out tools/hojas] [--prefijo hoja] [--ids P1001 ...]"""
import sys
from pathlib import Path
import argparse
from PIL import Image, ImageDraw, ImageFont
import json

sys.path.insert(0, str(Path(__file__).parent))
from fotos_off import productos, RAIZ

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dir', default=RAIZ/'assets'/'p')
    parser.add_argument('--out', default=RAIZ/'tools'/'hojas')
    parser.add_argument('--prefijo', default='hoja')
    parser.add_argument('--ids', nargs='*')
    parser.add_argument('--por-hoja', type=int, default=24)
    args = parser.parse_args()

    dir_path = Path(args.dir)
    out_path = Path(args.out)
    out_path.mkdir(parents=True, exist_ok=True)

    prod_list = [p for p in productos() if (dir_path / f"{p['id']}.webp").exists()]
    if args.ids:
        prod_list = [p for p in prod_list if p['id'] in args.ids]
    prod_list.sort(key=lambda x: x['id'])

    creditos = {}
    cred_path = RAIZ / 'assets' / 'p' / 'creditos.json'
    if cred_path.exists():
        creditos = {c['id']: c.get('nombre_off') or '' for c in json.loads(cred_path.read_text(encoding='utf-8'))}

    def get_font(size, bold=False):
        try:
            return ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf', size)
        except OSError:
            return ImageFont.load_default()

    id_font = get_font(15, True)
    text_font = get_font(13)
    small_font = get_font(11)

    def wrap_text(text, font, max_width):
        lines, line = [], ''
        for w in text.split():
            if line and font.getlength(line + ' ' + w) > max_width:
                lines.append(line)
                line = w
            else:
                line = (line + ' ' + w).strip()
        lines.append(line)
        return lines[:2]

    def draw_cell(img, x, y, prod):
        thumb = Image.open(dir_path / f"{prod['id']}.webp").convert('RGB')
        thumb.thumbnail((230, 230), Image.LANCZOS)
        bg = Image.new('RGB', (230, 230), 'white')
        bg.paste(thumb, ((230 - thumb.width) // 2, (230 - thumb.height) // 2))
        img.paste(bg, (x + 10, y + 4))

        draw = ImageDraw.Draw(img)
        draw.text((x + 10, y + 238), prod['id'], font=id_font, fill='black')
        lines = wrap_text(prod['n'], text_font, 235)
        for i, line in enumerate(lines):
            draw.text((x + 10, y + 258 + i * 16), line, font=text_font, fill='black')
        off_name = creditos.get(prod['id'], '')
        if off_name:
            draw.text((x + 10, y + 258 + len(lines) * 16 + 2), f"OFF: {off_name[:38]}", font=small_font, fill=(64, 64, 64))

    hoja_num = 1
    for i in range(0, len(prod_list), args.por_hoja):
        products_in_hoja = prod_list[i:i + args.por_hoja]
        img = Image.new('RGB', (1500, 1320), (235, 235, 235))
        for j, prod in enumerate(products_in_hoja):
            draw_cell(img, (j % 6) * 250, (j // 6) * 330, prod)
        filepath = out_path / f"{args.prefijo}_{hoja_num:02d}.jpg"
        img.save(filepath, 'JPEG', quality=88)
        print(f"{filepath} ({len(products_in_hoja)} productos)")
        hoja_num += 1

if __name__ == '__main__':
    main()
