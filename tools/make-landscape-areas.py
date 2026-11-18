"""Outlines for The Frontier's four landscapes (shown on hover).

Each landscape can be several separate areas (Tom, 2026-11-17: "we can
just highlight multiple places"). They are approximate on purpose:
  · regions are unions of provinces (Natural Earth admin-1, public domain),
    some cut by a line of latitude (Navarra, Huesca)
  · The High Mountains is the real high ground: land above ~1,500 m in the
    Pyrenees, the Picos de Europa and the Sierra Nevada, from the Terrain
    Tiles elevation (the same tiles tools/render-relief.py caches)
`focus` is where the camera flies on a click: the landscape's most obvious
general area, a short transition rather than a full view.

Usage (needs numpy, shapely and matplotlib's contourpy):
  python tools/make-landscape-areas.py <ne_10m_admin_1_states_provinces.geojson> <tiles_dir>
Writes tools/frontier-landscapes.json.
"""
import json, math, os, sys
import numpy as np
from PIL import Image
import contourpy
from shapely.geometry import shape, box, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADMIN1, TILES = sys.argv[1], sys.argv[2]

prov = {f['properties']['name']: shape(f['geometry'])
        for f in json.load(open(ADMIN1, encoding='utf-8'))['features']
        if f['properties'].get('adm0_a3') == 'ESP'}
mainland = unary_union([g for g in prov.values()]).intersection(box(-9.6, 35.9, 3.4, 43.9))
P = lambda *names: unary_union([prov[n] for n in names])
north_of = lambda lat: box(-10, lat, 4, 44)
south_of = lambda lat: box(-10, 35, 4, lat)

# ── Alpine Peaks: the high ground, from the elevation tiles (zoom 9) ──
Z = 9
x0, y0, nx, ny = 480 * 128, 360 * 128, 56 * 128, 50 * 128   # same window as relief-map.webp
dem = np.zeros((ny, nx), np.float32)
for tx in range(x0 // 256, (x0 + nx) // 256):
    for ty in range(y0 // 256, (y0 + ny) // 256):
        p = os.path.join(TILES, f'{Z}_{tx}_{ty}.png')
        a = np.asarray(Image.open(p).convert('RGB'), np.float32)
        dem[ty * 256 - y0:(ty + 1) * 256 - y0, tx * 256 - x0:(tx + 1) * 256 - x0] = \
            a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
# Smooth (~2 km box blur) so the outline follows ranges, not single peaks.
k = 9
c = np.cumsum(np.cumsum(np.pad(dem, k, mode='edge'), 0), 1)
dem = (c[2 * k:, 2 * k:] - c[:-2 * k, 2 * k:] - c[2 * k:, :-2 * k] + c[:-2 * k, :-2 * k])[:ny, :nx] / (2 * k) ** 2
world = 256 * 2 ** Z
def lonlat(px, py):
    return (x0 + px) / world * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y0 + py) / world))))
polys = []
gen = contourpy.contour_generator(z=dem, fill_type=contourpy.FillType.OuterOffset)
outers, offsets = gen.filled(1500, 1e5)
for pts, offs in zip(outers, offsets):
    for a, b in zip(offs[:-1], offs[1:]):
        ring = [lonlat(x, y) for x, y in pts[a:b]]
        if len(ring) > 3:
            polys.append(Polygon(ring).buffer(0))
high = unary_union(polys)
ranges = unary_union([box(-1.3, 42.15, 3.3, 43.1),      # Pyrenees
                      box(-5.25, 43.0, -4.35, 43.4),    # Picos de Europa
                      box(-3.75, 36.85, -2.55, 37.3)])  # Sierra Nevada
alpine = high.intersection(ranges).buffer(0.04).buffer(-0.03)

LANDSCAPES = {
    'high-mountains': dict(
        geom=alpine,
        focus=[[-0.6, 42.15], [2.3, 42.95]]),          # the central Pyrenees
    'green-north': dict(
        geom=unary_union([P('La Coruña', 'Lugo', 'Orense', 'Pontevedra', 'Asturias', 'Cantabria', 'Bizkaia', 'Gipuzkoa'),
                          prov['Navarra'].intersection(north_of(42.85))]),
        focus=[[-7.3, 42.9], [-3.5, 43.7]]),           # Asturias and the Picos coast
    'dry-interior': dict(
        geom=unary_union([P('Zaragoza', 'Teruel', 'Soria', 'Guadalajara', 'Cuenca', 'Burgos',
                            'Almería', 'Murcia', 'Granada'),
                          prov['Navarra'].intersection(south_of(42.45)),
                          prov['Huesca'].intersection(south_of(41.95))]),
        focus=[[-2.1, 40.3], [0.4, 42.4]]),            # Bardenas, Monegros, Teruel
    'mediterranean': dict(
        geom=P('Gerona', 'Barcelona', 'Tarragona', 'Castellón', 'Valencia', 'Alicante', 'Málaga', 'Cádiz', 'Jaén'),
        focus=[[1.5, 41.2], [3.35, 42.45]]),           # the Costa Brava and Garrotxa
}

out = {}
for slug, l in LANDSCAPES.items():
    g = l['geom'].intersection(mainland).simplify(0.012, preserve_topology=True)
    parts = [p for p in (g.geoms if hasattr(g, 'geoms') else [g]) if isinstance(p, Polygon) and p.area > (0.004 if slug == 'high-mountains' else 0.06)]   # drop enclaves and slivers
    coords = [[[[round(x, 3), round(y, 3)] for x, y in p.exterior.coords]] for p in parts]   # outer rings only
    out[slug] = {'focus': l['focus'], 'areas': coords}
    print(f'{slug}: {len(parts)} areas, {sum(len(c[0]) for c in coords)} points')
path = os.path.join(ROOT, 'tools', 'frontier-landscapes.json')
json.dump(out, open(path, 'w', encoding='utf-8'), separators=(',', ':'))
print(path, os.path.getsize(path) // 1024, 'KB')
