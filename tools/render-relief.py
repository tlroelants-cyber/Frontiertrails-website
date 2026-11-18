"""Render The Frontier's shaded relief of Spain (brand colours, 3D look).

A low sun from the north-west, soft fill light and long cast shadows,
coloured by height: olive lowlands, earth plateaus, gold mountains,
cream peaks, on a black sea. Tom picked this look on 2026-11-17.
Elevation comes from the open Terrain Tiles dataset (credited on the page).

Writes two images, each a window of Web Mercator z10 tiles:
  img/relief-spain.webp         2000 px wide, tiles x 484-522, y 372-403
                                (the old window, so the phone crop stays put;
                                phones, reduced motion and the intro use it)
  img/frontier/relief-map.webp  4096 px wide, tiles x 480-536, y 360-410
                                (wider: everything the overview camera sees;
                                draped over the live 3D map, see MAP_WINDOW in
                                js/frontier.js — keep the two in step)

Usage (needs numpy and Pillow; elevation tiles are cached in <tiles_dir>):
  python tools/render-relief.py <tiles_dir>
"""
import math, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TILES = None   # elevation tile cache; set from the command line (or by an importing script)
Z = 9   # elevation zoom: ~230 m per pixel in Spain
URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
EX = 3.0   # vertical exaggeration, so the sierras read at country scale

# Colour by height, in the brand palette (keep in step with RELIEF_RAMP in js/frontier.js).
STOPS = [(0, '#23251a'), (200, '#2d3020'), (500, '#4a4630'), (800, '#6e5f3e'),
         (1200, '#8f774b'), (1700, '#b39558'), (2300, '#e3c67a'), (3000, '#f0ebe0')]


def tile(x, y):
    p = os.path.join(TILES, f'{Z}_{x}_{y}.png')
    if not os.path.exists(p):
        with urllib.request.urlopen(URL.format(z=Z, x=x, y=y), timeout=30) as r:
            data = r.read()
        with open(p, 'wb') as fh:
            fh.write(data)
    a = np.asarray(Image.open(p).convert('RGB'), dtype=np.float32)
    return x, y, a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768


def elevation(x10, y10, nx10, ny10):
    """Elevation (m) for a window given in z10 tiles, fetched at zoom Z."""
    f = 2 ** (10 - Z)
    return elevation_px(x10 * 256 // f, y10 * 256 // f, nx10 * 256 // f, ny10 * 256 // f)


def elevation_px(x0, y0, w, h):
    """Elevation (m) for a window in zoom-Z pixels."""
    os.makedirs(TILES, exist_ok=True)
    tx0, ty0, tx1, ty1 = x0 // 256, y0 // 256, (x0 + w - 1) // 256, (y0 + h - 1) // 256
    mosaic = np.zeros(((ty1 - ty0 + 1) * 256, (tx1 - tx0 + 1) * 256), np.float32)
    jobs = [(x, y) for x in range(tx0, tx1 + 1) for y in range(ty0, ty1 + 1)]
    with ThreadPoolExecutor(16) as ex:
        for x, y, e in ex.map(lambda j: tile(*j), jobs):
            mosaic[(y - ty0) * 256:(y - ty0 + 1) * 256, (x - tx0) * 256:(x - tx0 + 1) * 256] = e
    return mosaic[y0 - ty0 * 256:y0 - ty0 * 256 + h, x0 - tx0 * 256:x0 - tx0 * 256 + w]


def render(h):
    land = h > 0.5
    h = np.maximum(h, 0)
    H = h.shape[0]
    cell = np.float32(156543.03 / 2 ** Z * math.cos(math.radians(40)))   # m per pixel at ~40°N
    gy, gx = np.gradient(h * np.float32(EX), cell)
    slope = np.arctan(np.hypot(gx, gy)); del gx, gy
    aspect = np.arctan2(-np.gradient(h, axis=1), np.gradient(h, axis=0))
    sin_s, cos_s = np.sin(slope), np.cos(slope); del slope

    def shade(az, alt):
        az, alt = math.radians(360 - az + 90), math.radians(alt)
        return np.clip(math.sin(alt) * cos_s + math.cos(alt) * sin_s * np.cos(az - aspect), 0, 1)

    # Key light low from the north-west, plus soft fill from three sides. 1.0 = flat ground.
    hs = 0.60 * shade(315, 32) + 0.20 * shade(270, 45) + 0.10 * shade(0, 45) + 0.10 * shade(225, 60)
    hs /= math.sin(math.radians(32)) * 0.6 + 0.4 * math.sin(math.radians(50))
    del sin_s, cos_s, aspect

    # Cast shadows: the sun's rays run south-east from a 14° sun.
    drop = cell * math.sqrt(2) * math.tan(math.radians(14))
    he = h * np.float32(EX)
    s = he.copy()
    for y in range(1, H):
        s[y, 1:] = np.maximum(he[y, 1:], s[y - 1, :-1] - drop)
    shadow = np.clip((s - he) / 400.0, 0, 1); del s, he
    shadow = Image.fromarray((shadow * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.2))
    shadow = np.asarray(shadow, np.float32) / 255

    light = np.clip(hs, 0, 1.6); del hs
    light = np.where(light > 1, 1 + (light - 1) * 0.9, light ** 1.25)   # deepen the shade side
    light *= 1 - 0.55 * shadow; del shadow

    rgbof = lambda c: [int(c[i:i + 2], 16) for i in (1, 3, 5)]
    xs = np.array([m for m, _ in STOPS], np.float32)
    cols = np.array([rgbof(c) for _, c in STOPS], np.float32)
    out = np.zeros(h.shape + (3,), np.uint8)
    for k in range(3):
        ch = np.interp(h, xs, cols[:, k]).astype(np.float32) * light
        out[..., k] = np.where(land, np.clip(ch, 0, 255), 0).astype(np.uint8)
    return Image.fromarray(out)


def save(img, rel, width, feather=0.0):
    img = img.resize((width, round(width * img.height / img.width)), Image.LANCZOS)
    if feather:
        # Fade the edges to transparent, so the image melts into the live map around it.
        w, hgt = img.size
        fx = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1]) / (w * feather), 0, 1)
        fy = np.clip(np.minimum(np.arange(hgt), np.arange(hgt)[::-1]) / (hgt * feather), 0, 1)
        alpha = (np.outer(fy, fx) * 255).astype(np.uint8)
        img = img.convert('RGBA'); img.putalpha(Image.fromarray(alpha))
    path = os.path.join(ROOT, rel)
    img.save(path, quality=84, method=6)
    print(f'{rel}: {img.size[0]}x{img.size[1]}, {os.path.getsize(path) // 1024} KB')


if __name__ == '__main__':
    TILES = sys.argv[1]
    save(render(elevation(484, 372, 38, 31)), 'img/relief-spain.webp', 2000)
    save(render(elevation(480, 360, 56, 50)), 'img/frontier/relief-map.webp', 4096, feather=0.04)
