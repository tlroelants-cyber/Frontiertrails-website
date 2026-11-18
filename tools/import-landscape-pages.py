"""Read Tom's landscape page specs ("Pages build/*.md") into
tools/landscape-pages.json, which tools/build-pages.mjs turns into the four
landscape pages under /the-frontier/.

The .md files are the source; re-run this after editing them:
  python tools/import-landscape-pages.py "../Pages build"

Changes made on import (Tom's calls, 2026-11-17), nothing else:
  · no drive times: the "Drive: ~…" part of each highlight is dropped, and
    so are the FAQ questions that are only about drive time (SKIP_FAQ)
  · pages live under /the-frontier/<slug>/ (not /landscapes/)
  · the CTA buttons ("See the cars", "Plan your route") become one button
    to the signup form (see build-pages.mjs); the hero button says the same
  · sales lines out of the intros (INTRO_CUTS), so the pages stay informative;
    "You just drive." stays in the signup band only
"""
import json, os, re, sys

SRC = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['high-mountains', 'green-north', 'dry-interior', 'mediterranean']

# FAQ questions that only answer "how far from Barcelona" (no drive times).
SKIP_FAQ = {
    'How far are the Pyrenees from Barcelona?',
    'Is Northern Spain far from Barcelona?',
    'How far is the Bardenas Reales from Barcelona?',
    'How long does it take to drive from Barcelona to Andalusia?',
}

# Sales lines cut from the intros (Tom, 2026-11-17: "purely informative").
INTRO_CUTS = [
    ', which is exactly why a capable car makes all the difference',
    "This landscape starts at Frontier Trails' doorstep. ",
    ' You just drive.',
]
HERO_BUTTON = 'Sign up for your dream trip'


def front_matter(text):
    """The small YAML subset the specs use: scalars, lists, hero.highlight."""
    fm, body = text.split('\n---\n', 1)
    data, key, sub = {}, None, None
    for raw in fm.strip('-\n').split('\n'):
        line = raw.split('  #')[0].rstrip()
        if not line.strip():
            continue
        unq = lambda v: v.strip().strip('"')
        if not line.startswith(' '):
            key, _, val = line.partition(':')
            data[key] = unq(val) if val.strip() else None
            sub = None
        elif key == 'hero':
            s = line.strip()
            if s.startswith('- name:'):
                data['hero'].setdefault('highlight', []).append({'name': unq(s[7:])})
            elif s.startswith('box:'):
                data['hero']['highlight'][-1]['box'] = json.loads(s[4:])
            else:
                k, _, v = s.partition(':')
                if data['hero'] is None:
                    data['hero'] = {}
                if k != 'highlight':
                    data['hero'][k] = unq(v)
                elif 'highlight' not in data['hero']:
                    data['hero']['highlight'] = []
        elif line.strip().startswith('- '):
            if not isinstance(data[key], list):
                data[key] = []
            data[key].append(unq(line.strip()[2:]))
    return data, body


def sections(body):
    out, name = {}, None
    for line in body.split('\n'):
        if line.startswith('## '):
            name = line[3:].strip()
            out[name] = []
        elif name:
            out[name].append(line)
    return out


def paragraphs(lines):
    """Blank-line separated paragraphs, wrapped lines joined."""
    paras, cur = [], []
    for l in lines:
        if l.strip():
            cur.append(l.strip())
        elif cur:
            paras.append(' '.join(cur)); cur = []
    if cur:
        paras.append(' '.join(cur))
    return paras


def bullets(lines):
    """'- ' items (two-space indent = sub-item), wrapped lines joined."""
    items = []
    for l in lines:
        if not l.strip():
            continue
        m = re.match(r'^( *)- (.*)$', l)
        if m:
            if len(m.group(1)) >= 2 and items:
                items[-1]['sub'].append(m.group(2).strip())
            else:
                items.append({'text': m.group(2).strip(), 'sub': []})
        elif items:   # continuation of the last item or sub-item
            if items[-1]['sub']:
                items[-1]['sub'][-1] += ' ' + l.strip()
            else:
                items[-1]['text'] += ' ' + l.strip()
    return items


def blocks(lines):
    """'### title' blocks with their lines."""
    out = []
    for l in lines:
        if l.startswith('### '):
            out.append({'title': l[4:].strip(), 'lines': []})
        elif out:
            out[-1]['lines'].append(l)
    return out


def lead(text):
    """'**Label** – text' or '**Label:** text' → (label, text)."""
    m = re.match(r'^\*\*(.+?)\*\*\s*(?:[–:-]\s*)?(.*)$', text)
    return (m.group(1).rstrip(':'), m.group(2)) if m else (None, text)


pages = []
for name in FILES:
    fm, body = front_matter(open(os.path.join(SRC, f'{name}.md'), encoding='utf-8').read())
    sec = sections(body)
    page = {
        'slug': name,
        'name': fm['menu_label'],
        'number': fm['number'],
        'title': fm['meta_title'],
        # No Routes section on the pages (Tom, 2026-11-17), so the description doesn't promise them.
        'description': re.sub(r'Routes, (\w)', lambda m: m.group(1).upper(), fm['meta_description']),
        'h1': fm['h1'],
        'hook': fm['hook'],
        'best_season': fm['best_season'],
        'hero': fm['hero'],
        'cta_primary': HERO_BUTTON,
        'intro': paragraphs(sec['Intro']),
    }
    for cut in INTRO_CUTS:
        page['intro'] = [t.replace(cut, '') for t in page['intro']]

    page['highlights'] = []
    for b in blocks(sec['Highlights']):
        num, _, title = b['title'].partition('. ')
        items = bullets(b['lines'])
        meta = dict(part.split(': ', 1) for part in items[0]['text'].split(' · '))
        page['highlights'].append({
            'n': int(num), 'name': title,
            'area': meta.get('Area'), 'best': meta.get('Best'),
            'best_for': [x.strip() for x in meta.get('Best for', '').split(',') if x.strip()],
            'text': ' '.join(i['text'] for i in items[1:]),
            'link': None, 'image': None,   # future spot page / photo
        })

    page['activities'] = [dict(zip(('label', 'text'), lead(i['text']))) for i in bullets(sec['What to do'])]

    page['routes'] = [{'title': b['title'], 'days': [
        dict(zip(('day', 'text'), (i['text'].split(': ', 1) + [''])[:2])) for i in bullets(b['lines'])
    ]} for b in blocks(sec['Routes'])]

    when = sec['When to go']
    rows = [l for l in when if l.startswith('|')]
    page['months'] = [c.strip() for c in rows[2].strip('|').split('|')]
    page['when_notes'] = [dict(zip(('label', 'text'), lead(i['text']))) for i in bullets([l for l in when if not l.startswith('|')])]

    page['road'] = [{'label': lead(i['text'])[0], 'text': lead(i['text'])[1], 'sub': i['sub']} for i in bullets(sec['On the road'])]

    faq, q = [], None
    for p in paragraphs(sec['FAQ']):
        m = re.match(r'^\*\*(.+?)\*\*\s*(.*)$', p)
        if m:
            faq.append({'q': m.group(1), 'a': m.group(2)})
    page['faq'] = [f for f in faq if f['q'] not in SKIP_FAQ]

    cta = [p for p in paragraphs(sec['CTA band']) if not p.startswith('Explore other')]
    head_line = re.match(r'^\*\*(.+?)\*\*\s*(.*)$', cta[0])
    sub = head_line.group(2)
    sub = re.sub(r'\s*\[[^\]]+\](\s*\[[^\]]+\])*\s*$', '', sub).strip()   # drop the button labels
    page['cta'] = {'heading': head_line.group(1), 'sub': sub}

    # Drive times are out: catch any that slipped through.
    blob = json.dumps(page, ensure_ascii=False)
    for hit in re.findall(r'Drive: ~[^"·]*', blob):
        print('WARNING drive time left:', name, hit)
    pages.append(page)
    print(f"{name}: {len(page['highlights'])} highlights, {len(page['activities'])} activities, "
          f"{len(page['routes'])} routes, {len(page['road'])} road notes, {len(page['faq'])} FAQ")

out = os.path.join(ROOT, 'tools', 'landscape-pages.json')
json.dump(pages, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote', out)
