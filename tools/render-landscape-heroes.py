"""Hero images for the four landscape pages: the dark shaded relief of
The Frontier, cropped to the landscape, with its regions lit up and the
rest of Spain dimmed. No photos, no text in the image (Tom's spec,
"Pages build/README.md").

The regions are the `hero.highlight` boxes from tools/landscape-pages.json.
Only land inside a box lights up, so the sea stays black and the boxes read
as soft pools of light, not rectangles.

Usage (needs numpy and Pillow; shares the tile cache of render-relief.py):
  python tools/render-landscape-heroes.py <tiles_dir>
Writes img/landscapes/<slug>-relief.webp.
"""
import importlib.util, json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('rr', os.path.join(ROOT, 'tools', 'render-relief.py'))
rr = importlib.util.module_from_spec(spec); spec.loader.exec_module(rr)
rr.TILES = sys.argv[1]
Z, WORLD = rr.Z, 256 * 2 ** rr.Z

px_x = lambda lon: (lon + 180) / 360 * WORLD
px_y = lambda lat: (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * WORLD
ASPECT = 16 / 9
OUT_W = 2400

for page in json.load(open(os.path.join(ROOT, 'tools', 'landscape-pages.json'), encoding='utf-8')):
    boxes = [h['box'] for h in page['hero']['highlight']]   # [lat_min, lat_max, lon_min, lon_max]
    x0 = px_x(min(b[2] for b in boxes)); x1 = px_x(max(b[3] for b in boxes))
    y0 = px_y(max(b[1] for b in boxes)); y1 = px_y(min(b[0] for b in boxes))
    # Pad, then widen or heighten to 16:9 around the centre.
    pad = 0.18 * max(x1 - x0, y1 - y0)
    x0, x1, y0, y1 = x0 - pad, x1 + pad, y0 - pad, y1 + pad
    cx, cy, w, h = (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0
    if w / h < ASPECT: w = h * ASPECT
    else: h = w / ASPECT
    X0, Y0, W, H = int(cx - w / 2), int(cy - h / 2), int(w), int(h)

    img = np.asarray(rr.render(rr.elevation_px(X0, Y0, W, H)), np.float32)

    # Light: 1 inside the boxes (land only), feathered; the rest dimmed.
    mask = Image.new('L', (W, H), 0)
    m = np.zeros((H, W), np.uint8)
    for lat0, lat1, lon0, lon1 in boxes:
        a, b = int(px_x(lon0) - X0), int(px_x(lon1) - X0)
        c, d = int(px_y(lat1) - Y0), int(px_y(lat0) - Y0)
        m[max(c, 0):max(d, 0), max(a, 0):max(b, 0)] = 255
    soft = Image.fromarray(m).filter(ImageFilter.GaussianBlur(W * 0.028))
    light = np.asarray(soft, np.float32)[..., None] / 255
    out = img * (0.26 + 0.84 * light)
    rel = f"img/landscapes/{page['slug']}-relief.webp"
    os.makedirs(os.path.join(ROOT, 'img', 'landscapes'), exist_ok=True)
    rr.save(Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)), rel, OUT_W, 0.05)   # edges fade into the page
