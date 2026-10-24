"""Generate a two-sheet, actual-size A4 tray and lid. Dimensions are in mm."""

from pathlib import Path

import fitz
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'molde-caixa-farm-hand-a4.pdf'
INK = colors.HexColor('#263b35')
MUTED = colors.HexColor('#5a645e')
FOLD = colors.HexColor('#337e75')


def text(c, x, y, value, size=8, font='Helvetica', color=INK, align='left'):
    c.setFont(font, size)
    c.setFillColor(color)
    getattr(c, {'left': 'drawString', 'center': 'drawCentredString', 'right': 'drawRightString'}[align])(x * mm, y * mm, value)


def line(c, x1, y1, x2, y2):
    c.line(x1 * mm, y1 * mm, x2 * mm, y2 * mm)


def path(c, points, stroke=1, fill=0):
    p = c.beginPath()
    p.moveTo(points[0][0] * mm, points[0][1] * mm)
    for x, y in points[1:]:
        p.lineTo(x * mm, y * mm)
    p.close()
    c.drawPath(p, stroke=stroke, fill=fill)


def sheet(c, index, w, h, depth, title):
    x, y = (210 - w) / 2, (297 - h) / 2
    tab, bevel = 12, 2
    outline = [
        (x, y-depth), (x+w, y-depth),
        (x+w+tab, y-depth+bevel), (x+w+tab, y-bevel),
        (x+w, y), (x+w+depth, y),
        (x+w+depth, y+h), (x+w, y+h),
        (x+w+tab, y+h+bevel), (x+w+tab, y+h+depth-bevel),
        (x+w, y+h+depth), (x, y+h+depth),
        (x-tab, y+h+depth-bevel), (x-tab, y+h+bevel),
        (x, y+h), (x-depth, y+h),
        (x-depth, y), (x, y),
        (x-tab, y-bevel), (x-tab, y-depth+bevel),
    ]
    assert all(10 <= px <= 200 and 10 <= py <= 287 for px, py in outline)
    assert w + 2 * depth <= 190 and h + 2 * depth <= 277

    text(c, 13, 281, 'FARM HAND', 19, 'Helvetica-Bold')
    text(c, 197, 282, f'{index}/2  ·  {title.upper()}', 10, 'Helvetica-Bold', align='right')
    text(c, 13, 273, 'Molde em escala real  ·  A4 retrato  ·  imprimir a 100%, sem ajustar', 8)
    text(c, 13, 267, f'Entre vincos: {h} × {w} mm  |  parede: {depth} mm  |  abas: 12 mm', 7, color=MUTED)

    # Light glue areas are part of the piece, not extra overlapping rectangles.
    tabs = [
        [(x,y-depth),(x-tab,y-depth+bevel),(x-tab,y-bevel),(x,y)],
        [(x+w,y-depth),(x+w+tab,y-depth+bevel),(x+w+tab,y-bevel),(x+w,y)],
        [(x,y+h),(x-tab,y+h+bevel),(x-tab,y+h+depth-bevel),(x,y+h+depth)],
        [(x+w,y+h),(x+w+tab,y+h+bevel),(x+w+tab,y+h+depth-bevel),(x+w,y+h+depth)],
    ]
    c.setFillColor(colors.HexColor('#eeeeeb'))
    for points in tabs:
        path(c, points, stroke=0, fill=1)

    c.setStrokeColor(INK)
    c.setLineWidth(0.65)
    path(c, outline)

    c.setStrokeColor(FOLD)
    c.setLineWidth(0.55)
    c.setDash(3, 2)
    for a, b, d, e in [
        (x,y,x+w,y), (x,y+h,x+w,y+h),
        (x,y,x,y+h), (x+w,y,x+w,y+h),
        (x,y-depth,x,y), (x+w,y-depth,x+w,y),
        (x,y+h,x,y+h+depth), (x+w,y+h,x+w,y+h+depth),
    ]:
        line(c, a, b, d, e)
    c.setDash()

    for label, px, py in [
        ('A',x-tab/2,y-depth/2), ('B',x+w+tab/2,y-depth/2),
        ('C',x-tab/2,y+h+depth/2), ('D',x+w+tab/2,y+h+depth/2),
    ]:
        text(c, px, py+2, label, 9, 'Helvetica-Bold', align='center')
        text(c, px, py-2, 'ABA', 5, color=MUTED, align='center')

    text(c, 105, y-depth/2, 'PAREDE · DOBRAR 90°', 7, align='center')
    text(c, 105, y+h+depth/2, 'PAREDE · DOBRAR 90°', 7, align='center')
    for px in [x-depth/2, x+w+depth/2]:
        c.saveState()
        c.translate(px*mm, 148.5*mm)
        c.rotate(90)
        text(c, 0, 0, 'PAREDE · DOBRAR 90°', 7, align='center')
        c.restoreState()

    text(c, 105, y+h-15, title.upper(), 13, 'Helvetica-Bold', align='center')
    text(c, 105, y+h-21, f'{h} × {w} mm entre vincos', 9, align='center')
    if index == 1:
        # Packed volume supplied by the user, rotated on the sheet for A4 fit.
        c.setStrokeColor(colors.HexColor('#a1a9a3'))
        c.setLineWidth(0.4)
        c.setDash(1, 3)
        c.rect((x+3)*mm, (y+3)*mm, 110*mm, 150*mm, stroke=1, fill=0)
        c.setDash()
        text(c, 105, 151, '32 CARTAS SLEEVADAS', 11, 'Helvetica-Bold', align='center')
        text(c, 105, 144, '2 montinhos de 16 cartas', 10, align='center')
        text(c, 105, 137, 'Volume medido: 150 × 110 × 30 mm', 8, align='center')
        text(c, 105, 123, 'Pontilhado interno = volume de referência.', 7, color=MUTED, align='center')
        text(c, 105, 118, 'Não cortar nem dobrar o pontilhado.', 7, color=MUTED, align='center')
    else:
        text(c, 105, 151, 'FARM HAND', 24, 'Helvetica-Bold', align='center')
        text(c, 105, 140, 'Tampa removível · encaixe sobre o fundo', 8, align='center')
        text(c, 105, 126, 'O painel é 4 mm maior em cada dimensão.', 7, color=MUTED, align='center')
        text(c, 105, 121, 'Teste o encaixe antes da colagem definitiva.', 7, color=MUTED, align='center')
    text(c, 105, y+14, 'IMPRESSÃO PARA O INTERIOR DA CAIXA', 7, 'Helvetica-Bold', align='center')
    text(c, 105, y+9, 'Erga as paredes em direção ao lado impresso.', 7, color=MUTED, align='center')

    # Calibration square uses real geometry, not an approximate raster graphic.
    c.setStrokeColor(INK)
    c.setLineWidth(0.5)
    c.rect(13*mm, 12*mm, 20*mm, 20*mm, stroke=1, fill=0)
    text(c, 23, 23, '20 mm', 7, align='center')
    text(c, 23, 18, '× 20 mm', 7, align='center')
    text(c, 40, 29, 'Meça o quadrado antes de cortar. Não use impressão frente e verso.', 7)
    line(c, 40, 23, 50, 23)
    text(c, 53, 22, 'Cortar', 7)
    c.setStrokeColor(FOLD)
    c.setDash(3,2)
    line(c, 82, 23, 92, 23)
    c.setDash()
    text(c, 95, 22, 'Vincar e dobrar', 7)
    text(c, 40, 16, 'Cole o verso das abas A–D na face interna das paredes vizinhas.', 7)
    text(c, 40, 11, 'Protótipo: folga calculada para papel de 0,3 a 0,5 mm. Confira após montar.', 6.5, color=MUTED)
    c.showPage()


def main():
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle('Farm Hand — molde de caixa A4, fundo e tampa')
    c.setAuthor('Farm Hand — projeto pessoal')
    sheet(c, 1, 116, 156, 34, 'Fundo')
    sheet(c, 2, 120, 160, 22, 'Tampa')
    c.save()
    doc = fitz.open(OUTPUT)
    assert len(doc) == 2
    for i, page in enumerate(doc):
        assert abs(page.rect.width - A4[0]) < 0.01
        assert abs(page.rect.height - A4[1]) < 0.01
        assert '20 mm' in page.get_text()
        page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5)).save(ROOT / f'previa-{i+1}.png')
    print(f'PDF validado: {OUTPUT}; 2 páginas A4; escala em mm; contornos dentro das margens.')


if __name__ == '__main__':
    main()
