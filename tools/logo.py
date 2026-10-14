"""Genera el logo vectorial de Jhovin (texto convertido a trazos, sin depender de fuentes).
Uso: python tools/logo.py <carpeta_fuentes>   (Great Vibes y Rubik 700 en .woff2, ambas OFL)
Salida: assets/logo.svg (apilado, fiel al original), assets/logo-h.svg (horizontal, cabecera), assets/icono.svg (insignia)."""
import math, sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FD = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets'
RED, BLK, YEL = '#d7141a', '#141414', '#f5c400'


class Font:
    def __init__(self, f):
        self.f = TTFont(f); self.gs = self.f.getGlyphSet(); self.cmap = self.f.getBestCmap()
        self.upm = self.f['head'].unitsPerEm; self.hm = self.f['hmtx'].metrics

    def path(self, text, x, y, size, track=0.0):
        """d de la cadena con línea base en (x, y); devuelve (d, ancho)."""
        s = size / self.upm; pen = SVGPathPen(self.gs); cx = 0.0
        for ch in text:
            g = self.cmap.get(ord(ch))
            if g is None: continue
            self.gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x + cx, y)))
            cx += self.hm[g][0] * s + track
        return pen.getCommands(), cx - track

    def width(self, text, size, track=0.0):
        return self.path(text, 0, 0, size, track)[1]

    def bounds(self, text, size):
        bp = BoundsPen(self.gs); s = size / self.upm; cx = 0
        for ch in text:
            g = self.cmap[ord(ch)]; self.gs[g].draw(TransformPen(bp, (s, 0, 0, -s, cx, 0))); cx += self.hm[g][0] * s
        return bp.bounds  # xmin, ymin, xmax, ymax (y hacia abajo)


GV = Font(FD / 'gv.woff2'); RB = Font(FD / 'rubik700.woff2')


def arc(cx, cy, r, a0, a1):
    """Arco en sentido horario de a0 a a1 (grados, 0 = 3 en punto, y hacia abajo)."""
    p = lambda a: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
    (x0, y0), (x1, y1) = p(a0), p(a1); large = 1 if (a1 - a0) % 360 > 180 else 0
    return f'M{x0:.1f} {y0:.1f}A{r} {r} 0 {large} 1 {x1:.1f} {y1:.1f}'


def star(cx, cy, R=38, r=16):
    pts = []
    for i in range(10):
        a = math.radians(-90 + i * 36); rr = R if i % 2 == 0 else r
        pts.append(f'{cx + rr * math.cos(a):.1f} {cy + rr * math.sin(a):.1f}')
    return 'M' + 'L'.join(pts) + 'Z'


def badge():
    """Insignia: anillos, carrito con cajas, etiqueta $ y 2 estrellas. Coordenadas del original (1436x1095)."""
    cx, cy = 752, 335
    dollar, _ = RB.path('$', 0, 0, 92)
    boxes = [(642, 336, 62, 56), (708, 342, 62, 50), (774, 346, 74, 46), (650, 284, 54, 52), (708, 292, 58, 50),
             (770, 300, 52, 46), (660, 242, 44, 42), (708, 230, 50, 58), (826, 316, 34, 30)]
    return f'''<defs><linearGradient id="vel" x1="0" x2="1"><stop offset="0" stop-color="{RED}" stop-opacity="0"/><stop offset="1" stop-color="{RED}"/></linearGradient></defs>
<g fill="none" stroke-linecap="round">
<path d="{arc(cx, cy, 288, 194, 278)}{arc(cx, cy, 288, 300, 342)}" stroke="{BLK}" stroke-width="15"/>
<path d="{arc(cx, cy, 288, 342, 356)}" stroke="{RED}" stroke-width="15"/>
<path d="{arc(cx, cy, 288, 358, 166)}" stroke="{YEL}" stroke-width="15"/>
<path d="{arc(cx, cy, 252, 212, 152)}" stroke="{RED}" stroke-width="13"/>
<path d="M468 262H585M476 318H596" stroke="url(#vel)" stroke-width="12"/>
<path d="M512 240H590L628 400H884L926 254H604M628 400 646 458H888" stroke="{RED}" stroke-width="24" stroke-linejoin="round"/>
<circle cx="668" cy="508" r="26" stroke="{RED}" stroke-width="15" fill="#fff"/><circle cx="836" cy="508" r="26" stroke="{RED}" stroke-width="15" fill="#fff"/>
</g>
<g fill="{BLK}" stroke="#fff" stroke-width="5" stroke-linejoin="round">{''.join(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3"/>' for x, y, w, h in boxes)}</g>
<path d="M812 62 834 150" stroke="#8a8a8a" stroke-width="5" fill="none"/><circle cx="812" cy="62" r="15" fill="#fff" stroke="#8a8a8a" stroke-width="6"/>
<g transform="translate(838 214) rotate(-14)">
<path d="M-56-28-20-70H20L56-28V72Q56 80 48 80H-48Q-56 80-56 72Z" fill="{RED}" stroke="#9d0b10" stroke-width="5" stroke-linejoin="round"/>
<circle cx="0" cy="-48" r="8" fill="#fff"/>
<path d="{dollar}" transform="translate(-27 52)" fill="{BLK}" stroke="#fff" stroke-width="5" paint-order="stroke"/>
</g>
<g fill="{YEL}" stroke="{BLK}" stroke-width="5" stroke-linejoin="round"><path d="{star(372, 292)}"/><path d="{star(378, 406)}"/></g>'''


def textblock():
    """Jhovin en script + las dos leyendas, en coordenadas del original (caja ~ 94..1300 x 558..1069)."""
    jd, _ = GV.path('Jhovin', 120, 905, 430)
    sup, sw = RB.path('SUPER MAYORISTA', 0, 0, 56, 2)
    tod, tw = RB.path('TODO PARA TU NEGOCIO', 0, 0, 60, 2)
    return f'''<path d="{jd}" fill="{BLK}" stroke="{BLK}" stroke-width="7" stroke-linejoin="round"/>
<path d="{sup}" transform="translate({1300 - sw:.1f} 684)" fill="{RED}"/>
<path d="{tod}" transform="translate({1290 - tw:.1f} 1000)" fill="{RED}"/>'''


LABEL = 'role="img" aria-label="Super Mayorista Jhovin - Todo para tu negocio"'


def stacked():
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 28 1250 1050" {LABEL}>{badge()}{textblock()}</svg>'


def horizontal():
    kt = 590 * 0.94 / 511; X = 716 + 40; Y = (590 - 511 * kt) / 2
    W = X + 1210 * kt
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} 590" {LABEL}>
<g transform="translate(-330 -40)">{badge()}</g>
<g transform="translate({X:.1f} {Y:.1f}) scale({kt:.4f}) translate(-94 -558)">{textblock()}</g></svg>'''


def icono():
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="320 30 736 600">{badge()}</svg>'


for name, svg in [('logo.svg', stacked()), ('logo-h.svg', horizontal()), ('icono.svg', icono())]:
    (OUT / name).write_text(svg, encoding='utf-8')
    print(name, len(svg.encode()), 'bytes')
