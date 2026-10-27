"""Mach33 brand pieces shared by the page, the kit and the viewer (Brand MCP, brand version 2026-10-23).

Colours: Black Space #030911, Mission White #FAFEFF, Orbital Signal Blue #1C79D6 (brand book p.5) and the chart blues,
greys and reds (p.15). Deep Orbit Blue #094683 is never a background (OOTWD rule, Eugene, 2026-10-09).
Type: Mach 33 Grotesk for headers, body and captions (p.6); Turret Road only for number call-outs (p.7-8).

Mach 33 Grotesk is licensed and this repository is public, so the font files live in share/brand/fonts/ (git-ignored,
from the Brand MCP's font links) and are embedded only when M33_EMBED_FONTS=1 is set, for the published artifacts.
Without it the pages fall back to Hanken Grotesk.
"""
import base64, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, 'brand', 'fonts')
FACES = [('Mach 33 Grotesk Titles', 'grotesk-titles.woff2'), ('Mach 33 Grotesk Body', 'grotesk-body.woff2'),
         ('Mach 33 Grotesk Captions', 'grotesk-captions.woff2')]


def font_css():
    """@font-face rules with the woff2 files inlined, or '' unless M33_EMBED_FONTS=1 and the files are present."""
    if os.environ.get('M33_EMBED_FONTS') != '1':
        return ''
    out = []
    for family, fn in FACES:
        p = os.path.join(FONTS, fn)
        if not os.path.exists(p):
            raise SystemExit(f'M33_EMBED_FONTS=1 but {p} is missing (download it from the Brand MCP font links)')
        b64 = base64.b64encode(open(p, 'rb').read()).decode()
        out.append(f"@font-face{{font-family:'{family}';src:url(data:font/woff2;base64,{b64}) format('woff2');font-display:swap}}")
    return '\n'.join(out)


def wordmark(height=18, label='Mach33', colour='white'):
    """A Mach33 wordmark file from the Brand MCP (white or black), inline and unchanged apart from the XML prolog.
    The files style their paths with a shared class name, so each copy gets its own prefix to keep the two apart."""
    svg = open(os.path.join(HERE, 'brand', f'mach33-wordmark-{colour}.svg')).read()
    svg = svg[svg.index('<svg'):].replace('st0', f'wm-{colour}')
    return f'<span class="wordmark wordmark-{colour}" role="img" aria-label="{label}" style="display:inline-block;height:{height}px;line-height:0">' \
           + re.sub(r'<svg ', f'<svg height="{height}" aria-hidden="true" ', svg, count=1) + '</span>'
