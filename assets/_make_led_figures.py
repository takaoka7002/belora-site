# -*- coding: utf-8 -*-
"""LEDライトのページに置く比較図を2組ぶん書き出す。

いずれも抽象。ただし飾りではなく、論点そのものを絵にする。

  figure 1  演色性   近い色どうしの境目が、見えるか／溶けるか
  figure 2  調光方式 撮影したときに縞が出るか／出ないか

低演色側は勘で色を置かない。青色LED＋黄色蛍光体の白色LEDが深い赤の
成分を欠く性質を変換として当て、その結果として境目が溶ける。

出力: led-fig-cri.svg / led-fig-flicker.svg
"""
import io
import math
import os

BASE = os.path.dirname(os.path.abspath(__file__))

W, H = 300, 200
GAP = 40
PAIR_W = W * 2 + GAP


# ---------------------------------------------------------------- 色
def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def rgb2hex(r, g, b):
    f = lambda v: max(0, min(255, int(round(v * 255))))
    return '#%02X%02X%02X' % (f(r), f(g), f(b))


def lum(rgb):
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]


def low_cri(rgb):
    """低演色の白色光で照らしたときの見え方へ寄せる。

    その波長を含まない以上、赤みの情報は返ってこない。赤い色ほど
    「色みが抜けて明るさだけが残る」状態へ近づく。ここでは各色を、
    自分の明るさに対応する暖かい灰へ寄せる操作として当てる。
    """
    r, g, b = rgb
    red = max(0.0, r - (g + b) / 2.0) / max(r, 1e-6)
    y = lum(rgb)
    grey = (min(1.0, y * 1.05), y * 0.97, y * 0.91)
    k = 0.30 + 0.55 * red
    out = tuple(c * (1 - k) + t * k for c, t in zip(rgb, grey))
    return tuple(min(1.0, c + 0.06 * red * (1 - c)) for c in out)


def hsl(h_deg, s, l):
    import colorsys
    return colorsys.hls_to_rgb((h_deg % 360) / 360.0, l, s)


def match_lum(rgb, target):
    y = lum(rgb)
    if y <= 1e-6:
        return rgb
    k = target / y
    return tuple(min(1.0, c * k) for c in rgb)


# ---------------------------------------------------------------- 図1 演色性
# 明るさを揃えた赤系の帯を並べる。違うのは色みだけ。
# 高演色なら段が見え、低演色では境目が溶けて一枚の面になる。
N = 7
TARGET_Y = 0.60
bands_true = []
for i in range(N):
    h = 352 + (i - (N - 1) / 2) * 7.5        # 色相を少しずつ振る
    s = 0.34 + 0.09 * math.cos(i / (N - 1) * math.pi)
    bands_true.append(match_lum(hsl(h, s, 0.62), TARGET_Y))
_low_raw = [low_cri(c) for c in bands_true]
# 明るさは揃える。変わるのは色の分かれ方だけ、という比較にするため
_y_true = sum(lum(c) for c in bands_true) / len(bands_true)
_y_low = sum(lum(c) for c in _low_raw) / len(_low_raw)
bands_low = [match_lum(c, lum(c) * _y_true / _y_low) for c in _low_raw]


def strip(colors, x0, idx):
    p = ['<defs><clipPath id="cl%d"><rect x="%d" y="0" width="%d" height="%d" rx="8"/></clipPath></defs>'
         % (idx, x0, W, H)]
    p.append('<g clip-path="url(#cl%d)">' % idx)
    bw = W / float(N)
    for i, c in enumerate(colors):
        p.append('<rect x="%.2f" y="0" width="%.2f" height="%d" fill="%s"/>'
                 % (x0 + i * bw, bw + .6, H, rgb2hex(*c)))
    # 上からの光。中央がわずかに明るい
    p.append('<radialGradient id="lt%d" cx="50%%" cy="28%%" r="80%%">'
             '<stop offset="0" stop-color="#fff" stop-opacity=".10"/>'
             '<stop offset="1" stop-color="#000" stop-opacity=".14"/></radialGradient>' % idx)
    p.append('<rect x="%d" y="0" width="%d" height="%d" fill="url(#lt%d)"/>' % (x0, W, H, idx))
    p.append('</g>')
    return '\n  '.join(p)


def panel(inner, label):
    head = ('<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" '
            'role="img" aria-label="%s">' % (W, H, label))
    return head + inner + '</svg>'


io.open(os.path.join(BASE, 'led-cri-low.svg'), 'w', encoding='utf-8').write(
    panel(strip(bands_low, 0, 1),
          '演色性の低い光で照らしたときの見え方。色みだけが少しずつ違う帯が、'
          '境目が溶けて一枚の面に見える。'))
io.open(os.path.join(BASE, 'led-cri-high.svg'), 'w', encoding='utf-8').write(
    panel(strip(bands_true, 0, 2),
          '高演色 Ra90 で照らしたときの見え方。同じ帯の境目が、一つずつ見分けられる。'))


# ---------------------------------------------------------------- 図2 調光方式
# 同じ面を撮影したとき、PWM調光では横方向の明暗の帯が写る。
# 帯は輪郭がやわらかく、明暗差は控えめ。ゼブラ模様にはしない。
FIELD = match_lum(hsl(352, 0.34, 0.62), 0.60)


def field(x0, idx, banding):
    p = ['<defs><clipPath id="cf%d"><rect x="%d" y="0" width="%d" height="%d" rx="8"/></clipPath></defs>'
         % (idx, x0, W, H)]
    p.append('<g clip-path="url(#cf%d)">' % idx)
    p.append('<rect x="%d" y="0" width="%d" height="%d" fill="%s"/>' % (x0, W, H, rgb2hex(*FIELD)))
    if banding:
        rows = 100
        rh = H / float(rows)
        for i in range(rows):
            # 周期は一定でない。下へ行くほどわずかに伸びる（シャッターとの干渉）
            t = i / float(rows)
            v = math.sin(t * 5.6 * math.pi + t * t * 0.9)
            if abs(v) < 0.04:
                continue
            col = '#000000' if v < 0 else '#ffffff'
            p.append('<rect x="%d" y="%.2f" width="%d" height="%.2f" fill="%s" opacity="%.3f"/>'
                     % (x0, i * rh, W, rh + .6, col, abs(v) * 0.095))
    p.append('<radialGradient id="lf%d" cx="50%%" cy="28%%" r="80%%">'
             '<stop offset="0" stop-color="#fff" stop-opacity=".10"/>'
             '<stop offset="1" stop-color="#000" stop-opacity=".14"/></radialGradient>' % idx)
    p.append('<rect x="%d" y="0" width="%d" height="%d" fill="url(#lf%d)"/>' % (x0, W, H, idx))
    p.append('</g>')
    return ''.join(p)


io.open(os.path.join(BASE, 'led-dim-pwm.svg'), 'w', encoding='utf-8').write(
    panel(field(0, 1, True),
          'PWM調光の光を撮影したとき。横方向の明暗の帯が写る。'))
io.open(os.path.join(BASE, 'led-dim-dc.svg'), 'w', encoding='utf-8').write(
    panel(field(0, 2, False),
          'DC調光の光を撮影したとき。帯は写らず、一様に見える。'))


# ---------------------------------------------------------------- 確認
def dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** .5 * 255


print('図1 帯どうしの差（隣り合う帯。小さいほど境目が見えない）')
hi = [dist(bands_true[i], bands_true[i + 1]) for i in range(N - 1)]
lo = [dist(bands_low[i], bands_low[i + 1]) for i in range(N - 1)]
print('  高演色 Ra90   平均 %.1f' % (sum(hi) / len(hi)))
print('  演色性が低い  平均 %.1f  （%.0f%% に縮む）'
      % (sum(lo) / len(lo), sum(lo) / sum(hi) * 100))
print()
print('図1 端から端まで（全体の色幅）')
print('  高演色 %.1f ／ 低演色 %.1f' % (dist(bands_true[0], bands_true[-1]),
                                       dist(bands_low[0], bands_low[-1])))
print()
print('書き出し: led-fig-cri.svg / led-fig-flicker.svg')
