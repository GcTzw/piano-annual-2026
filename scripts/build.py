"""Generate the buildless website from the shared concert data."""
import json
import html
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'data/program.json').read_text(encoding='utf-8'))
esc = html.escape

def section(part):
    rows = []
    for song in data['program']:
        if song['part'] != part:
            continue
        n = song['order']
        source = song.get('source', '') or ('特別演出・鋼琴與鼓' if n == 26 else '鋼琴演出')
        rows.append(f'''<details class="piece" name="concert-program" id="piece-{n:02}">
          <summary><span class="number">{n:02}</span><span class="piece-title">{esc(song['title'])}</span><span class="performer">{esc(song['performer']).replace(chr(10), "<br>")}</span><span class="plus" aria-hidden="true">+</span></summary>
          <div class="piece-info"><div class="source-copy"><span class="source-label">作品出處</span><p>{esc(source)}</p></div></div>
        </details>''')
    return '\n'.join(rows)

web = ROOT / 'web'
event = data['event']


def read(name):
    return (web / name).read_text(encoding='utf-8').strip()


def render(template, **fields):
    for name, value in fields.items():
        template = template.replace('{{' + name + '}}', value)
    return template


layout = read('template.html')
venue = event['venue']
address = event['address']
destination = f'{venue} {address}'
current = ' aria-current="page"'

program = render(read('program.html'), FIRST=section(1), SECOND=section(2))
traffic = render(
    read('traffic-template.html'),
    MAP_EMBED=esc('https://maps.google.com/maps?' + urlencode(
        {'q': destination, 'z': 17, 'hl': 'zh-TW', 'output': 'embed'}
    )),
    MAP_DIRECTIONS=esc('https://www.google.com/maps/dir/?' + urlencode(
        {'api': 1, 'destination': destination}
    )),
)

for filename, content, page_title, description, target, is_program in (
    ('index.html', program, '共響共享｜2026 音樂會', '探索演出曲目與演出者。', '#program', True),
    ('traffic.html', traffic, '交通資訊｜2026 共響共享音樂會', '查看場地地圖與交通路線。', '#traffic', False),
):
    page = render(
        layout,
        TITLE=page_title,
        DESCRIPTION=description,
        SKIP_TARGET=target,
        PROGRAM_CURRENT=current if is_program else '',
        TRAFFIC_CURRENT='' if is_program else current,
        CONTENT=content,
        SHORTCUT=read('program-shortcut.html') if is_program else '',
        VENUE=esc(venue),
        ADDRESS=esc(address),
        DOORS=esc(event['doors']),
        SHOW_TIME=esc(event['time']),
    )
    (web / filename).write_text(page + '\n', encoding='utf-8')
    print(f'Generated web/{filename}')
