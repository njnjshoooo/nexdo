"""Bundle a review-only HTML preview with local images and webfonts embedded."""
from pathlib import Path
import base64
import mimetypes
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as folder:
    bundle = Path(folder) / 'preview.js'
    subprocess.run([str(ROOT / 'node_modules/.bin/esbuild'), 'scripts/offline-preview.tsx', '--bundle', '--minify', '--format=iife', '--loader:.css=empty', '--outfile=' + str(bundle)], cwd=ROOT, check=True)
    js = bundle.read_text()
css = '\n'.join((ROOT / path).read_text() for path in ['src/features/focused/focused.css', 'src/features/focused/typography.css', 'src/features/focused/course.css'])

def embed(path):
    asset = ROOT / 'public' / path.lstrip('/')
    mime = 'font/woff2' if asset.suffix == '.woff2' else mimetypes.guess_type(str(asset))[0]
    if not asset.is_file() or not mime:
        raise ValueError('Missing asset: ' + path)
    return 'data:' + mime + ';base64,' + base64.b64encode(asset.read_bytes()).decode()

for asset in set(re.findall(r'/images/[A-Za-z0-9_./-]+\.(?:webp|png|jpg)', js)):
    js = js.replace(asset, embed(asset))
for asset in set(re.findall(r'/fonts/[A-Za-z0-9_./-]+\.woff2', css)):
    css = css.replace(asset, embed(asset))
base = 'body{margin:0;font-family:system-ui,sans-serif}h1,h2,h3,h4,p,figure,ol,ul,dl,dd{margin:0}svg{vertical-align:middle}img{display:block;max-width:100%}button{cursor:pointer}#offline-label{padding:7px 14px;background:#F2F8F5;color:#164D43;font-size:14px;text-align:center}'
html = '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>好齡居改版預覽</title><style>' + base + css + '</style><div id="offline-label">好齡居改版・離線預覽｜可操作頁面與表單，不會送出資料或收款</div><div id="root"></div><script>' + js.replace('</script', '<\\/script') + '</script></html>'
target = ROOT.parent / '好齡居改版預覽.html'
target.write_text(html)
print('Saved:', target)
