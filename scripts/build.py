"""Generate the buildless website from the shared concert data."""
import json
import html
from pathlib import Path

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

template = (ROOT / 'web/template.html').read_text(encoding='utf-8')
(ROOT / 'web/index.html').write_text(template.replace('{{FIRST}}', section(1)).replace('{{SECOND}}', section(2)), encoding='utf-8')
print('Generated web/index.html: 26 program entries')
