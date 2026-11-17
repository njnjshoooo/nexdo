"""Regenerate GenSen UI subsets. Requires fonttools[woff]; input TTCs remain external."""
from pathlib import Path
import argparse
from fontTools.ttLib import TTCollection
from fontTools import subset

parser = argparse.ArgumentParser()
parser.add_argument('font_directory', type=Path, help='Directory containing GenSenRounded-R/M/B.ttc')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
text = ''.join(p.read_text() for p in (root/'src/features/focused').iterdir() if p.suffix in ['.tsx', '.ts'])
for path in ['src/features/focused/catalog.ts','src/pages/PrivacyPolicyPage.tsx','src/data/settings/footerData.ts']:
    text += (root/path).read_text()
text += ''.join(chr(c) for c in range(32,127)) + '，。？！：；、（）「」『』《》【】—…～・✓↗→←'
for source, name in [('R','Regular'),('M','Medium'),('B','Bold')]:
    font = TTCollection(args.font_directory / ('GenSenRounded-' + source + '.ttc')).fonts[0]
    options = subset.Options()
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    options.layout_features = ['*']
    worker = subset.Subsetter(options=options)
    worker.populate(text=text)
    worker.subset(font)
    font.flavor = 'woff2'
    font.save(root/'public/fonts'/('GenSenRounded-TW-' + name + '.woff2'))
