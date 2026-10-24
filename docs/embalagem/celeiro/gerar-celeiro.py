"""Two A4 sheets: barn body, pitched removable roof and two roof end caps."""
from math import hypot
from pathlib import Path

import fitz
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
ART = ROOT / 'artes'
RED = colors.HexColor('#b64e39')
DARK_RED = colors.HexColor('#8b382d')
CREAM = colors.HexColor('#fff4df')
GREEN = colors.HexColor('#28695d')
INK = colors.HexColor('#1c302b')
ANIMALS = ['rato', 'pato', 'gato', 'ovelha', 'porco', 'cavalo', 'galo']


def txt(c, x, y, s, size=8, color=INK, bold=False):
    c.setFillColor(color)
    c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.drawCentredString(x*mm, y*mm, s)


def ln(c, x1, y1, x2, y2):
    c.line(x1*mm, y1*mm, x2*mm, y2*mm)


def polygon(c, points, fill=0, stroke=1):
    p = c.beginPath()
    p.moveTo(points[0][0]*mm, points[0][1]*mm)
    for x,y in points[1:]:
        p.lineTo(x*mm,y*mm)
    p.close()
    c.drawPath(p,fill=fill,stroke=stroke)


def image(c, name, x, y, w, h):
    c.drawImage(str(ART/f'{name}.png'), x*mm,y*mm,w*mm,h*mm,mask='auto')


def folds(c, segments):
    # Cream underprint keeps technical marks legible over dark artwork.
    for color, width in [(CREAM,1.1),(INK,0.45)]:
        c.setStrokeColor(color)
        c.setLineWidth(width)
        c.setDash(3,2)
        for segment in segments:
            ln(c,*segment)
    c.setDash()


def cuts(c, points):
    c.setStrokeColor(INK)
    c.setLineWidth(0.65)
    polygon(c,points)
    assert all(10 <= x <= 200 and 10 <= y <= 287 for x,y in points)


def wood(c, width, height):
    c.setFillColor(RED)
    c.rect(0,0,width*mm,height*mm,fill=1,stroke=0)
    c.setStrokeColor(DARK_RED)
    c.setLineWidth(0.55)
    for x in range(0,int(width)+1,6):
        ln(c,x,0,x,height)
    c.setFillColor(CREAM)
    c.rect(0,0,width*mm,1.5*mm,fill=1,stroke=0)
    c.rect(0,(height-1.5)*mm,width*mm,1.5*mm,fill=1,stroke=0)


def front(c):
    wood(c,116,34)
    c.setFillColor(DARK_RED)
    c.rect(34*mm,1.5*mm,48*mm,23*mm,fill=1,stroke=0)
    c.setStrokeColor(CREAM)
    c.setLineWidth(1.5)
    c.rect(34*mm,1.5*mm,48*mm,23*mm,fill=0,stroke=1)
    for seg in [(58,1.5,58,24.5),(34,1.5,58,24.5),(34,24.5,58,1.5),(58,1.5,82,24.5),(58,24.5,82,1.5)]:
        ln(c,*seg)
    image(c,'pato',8,2,15,21)
    image(c,'galo',93,2,15,21)


def side(c):
    wood(c,156,34)
    for i,name in enumerate(ANIMALS):
        image(c,name,7.5+21*i,2,15,20.96)


def body(c):
    x,y,w,h,d,g,t = 47,70.5,116,156,34,25,12
    # Artwork is outside. Upper and lower walls face outward from the floor.
    c.saveState(); c.translate(x*mm,(y+h)*mm); front(c); c.restoreState()
    c.saveState(); c.translate((x+w)*mm,y*mm); c.rotate(180); front(c); c.restoreState()
    c.saveState(); c.translate(x*mm,y*mm); c.rotate(90); side(c); c.restoreState()
    c.saveState(); c.translate((x+w)*mm,(y+h)*mm); c.rotate(-90); side(c); c.restoreState()
    for points in [[(x,y+h+d),(105,y+h+d+g),(x+w,y+h+d)],[(x,y-d),(105,y-d-g),(x+w,y-d)]]:
        c.setFillColor(RED); polygon(c,points,fill=1,stroke=0)
    # Tiny original logo on each gable; normally concealed by the removable cap.
    image(c,'logo',91,261,28,18.3)
    c.saveState(); c.translate(105*mm,36*mm); c.rotate(180); image(c,'logo',-14,0,28,18.3); c.restoreState()
    tabs = [
        [(x,y-d),(x-t,y-d+2),(x-t,y-2),(x,y)],
        [(x+w,y-d),(x+w+t,y-d+2),(x+w+t,y-2),(x+w,y)],
        [(x,y+h),(x-t,y+h+2),(x-t,y+h+d-2),(x,y+h+d)],
        [(x+w,y+h),(x+w+t,y+h+2),(x+w+t,y+h+d-2),(x+w,y+h+d)],
    ]
    c.setFillColor(colors.HexColor('#efe5cf'))
    for tab in tabs: polygon(c,tab,fill=1,stroke=0)
    for px,py,letter in [(41,53.5,'A'),(169,53.5,'B'),(41,243.5,'C'),(169,243.5,'D')]:
        txt(c,px,py,letter,9,bold=True); txt(c,px,py-4,'COLA',5)
    outline=[(x,y-d),(105,y-d-g),(x+w,y-d),(x+w+t,y-d+2),(x+w+t,y-2),(x+w,y),(x+w+d,y),(x+w+d,y+h),(x+w,y+h),(x+w+t,y+h+2),(x+w+t,y+h+d-2),(x+w,y+h+d),(105,y+h+d+g),(x,y+h+d),(x-t,y+h+d-2),(x-t,y+h+2),(x,y+h),(x-d,y+h),(x-d,y),(x,y),(x-t,y-2),(x-t,y-d+2)]
    cuts(c,outline)
    folds(c,[(x,y,x+w,y),(x,y+h,x+w,y+h),(x,y,x,y+h),(x+w,y,x+w,y+h),(x,y-d,x,y),(x+w,y-d,x+w,y),(x,y+h,x,y+h+d),(x+w,y+h,x+w,y+h+d)])
    # Instructions stay on the underside rather than using an extra sheet.
    txt(c,105,207,'FARM HAND · CELEIRO',13,bold=True)
    txt(c,105,198,'1/2 · CORPO',10,bold=True)
    for yy,s in [(185,'Base entre vincos: 156 × 116 mm'),(179,'Paredes: 34 mm · triângulos: 25 mm'),(168,'Conteúdo medido: 150 × 110 × 30 mm'),(162,'32 cartas com sleeves, em 2 montinhos'),(147,'Recorte o contorno contínuo.'),(141,'Vinque apenas as linhas tracejadas.'),(135,'Dobre para longe da face impressa.'),(129,'Cole A–D por dentro das paredes vizinhas.'),(118,'As duas empenas triangulares ficam em pé.'),(112,'Não faça vinco na base dos triângulos.'),(97,'A4 · 100% · SEM AJUSTAR À PÁGINA'),(91,'Sem impressão frente e verso.')]:
        txt(c,105,yy,s,7.5)
    c.setStrokeColor(INK); c.setLineWidth(0.5)
    c.rect(17*mm,15*mm,20*mm,20*mm,fill=0,stroke=1)
    txt(c,27,25,'20 × 20',6); txt(c,27,20,'mm',6)
    txt(c,180,24,'Escala real',6); txt(c,180,19,'Teste em papel',6)
    c.showPage()


HALF, RISE, SKIRT, LENGTH = 60,27,10,162
SLOPE = hypot(HALF,RISE)


def roof_cap(c, cx, cy, name):
    # Sloping tabs are bevelled near the apex to avoid intersecting one another.
    ax = HALF-6*HALF/SLOPE+5*RISE/SLOPE
    ay = 6*RISE/SLOPE+5*HALF/SLOPE
    bx = 6*HALF/SLOPE+5*RISE/SLOPE
    by = RISE-6*RISE/SLOPE+5*HALF/SLOPE
    shape=[(-60,-10),(60,-10),(66,-8),(66,-2),(60,0),(ax,ay),(bx,by),(0,27),(-bx,by),(-ax,ay),(-60,0),(-66,-2),(-66,-8)]
    points=[(cx+a,cy+b) for a,b in shape]
    c.setFillColor(colors.HexColor('#efe5cf')); polygon(c,points,fill=1,stroke=0)
    c.setFillColor(RED); polygon(c,[(cx-60,cy-10),(cx+60,cy-10),(cx+60,cy),(cx,cy+27),(cx-60,cy)],fill=1,stroke=0)
    c.setStrokeColor(CREAM); c.setLineWidth(1.8)
    ln(c,cx-60,cy,cx,cy+27); ln(c,cx,cy+27,cx+60,cy)
    image(c,'logo',cx-14,cy+1,28,18.3)
    txt(c,cx,cy-6,'FARM HAND  ·  '+name,7,CREAM,True)
    for px,py in [(cx-31,cy+18),(cx+31,cy+18)]: txt(c,px,py,'COLA',5)
    cuts(c,points)
    folds(c,[(cx-60,cy,cx,cy+27),(cx,cy+27,cx+60,cy),(cx-60,cy-10,cx-60,cy),(cx+60,cy-10,cx+60,cy)])
    # No fold at the eave baseline: triangle and skirt form one rigid end piece.


def roof(c):
    x0,x1=105-SLOPE-SKIRT,105+SLOPE+SKIRT
    y0,y1=67.5,67.5+LENGTH
    c.setFillColor(GREEN); c.rect(x0*mm,y0*mm,(x1-x0)*mm,LENGTH*mm,fill=1,stroke=0)
    # Simple standing-seam roof; center is the ridge, outer strips are eaves.
    c.setStrokeColor(colors.HexColor('#194c43')); c.setLineWidth(0.5)
    for offset in range(0,163,8): ln(c,x0,y0+offset,x1,y0+offset)
    c.setStrokeColor(colors.HexColor('#679786'))
    for side_sign in [-1,1]:
        for offset in [16,32,48]: ln(c,105+side_sign*offset,y0,105+side_sign*offset,y1)
    # Original game art appears on the roof as well as both body side walls.
    for px,angle in [(105-SLOPE/2,-90),(105+SLOPE/2,90)]:
        c.saveState(); c.translate(px*mm,148.5*mm); c.rotate(angle)
        image(c,'logo',-24,-15.68,48,31.36)
        txt(c,0,-22,'UM CELEIRO CHEIO DE PALPITES',7,CREAM,True)
        c.restoreState()
    cuts(c,[(x0,y0),(x1,y0),(x1,y1),(x0,y1)])
    folds(c,[(105,y0,105,y1),(105-SLOPE,y0,105-SLOPE,y1),(105+SLOPE,y0,105+SLOPE,y1)])
    roof_cap(c,105,27,'FRENTE')
    roof_cap(c,105,257,'FUNDO')
    txt(c,105,61,'Recorte as 3 peças. Cole as empenas nas extremidades do telhado.',6.5)
    txt(c,105,242,'2/2 · TELHADO REMOVÍVEL · VINCO CENTRAL = CUMEEIRA',7,bold=True)
    txt(c,105,237,'Dobre a cumeeira; abas de cola ficam por dentro. Não cole o telhado ao corpo.',6.5)
    c.showPage()


def preview(c):
    # Technical axonometric projection using the same artwork and millimetres.
    # Plan x goes right/down, plan y goes right/up; z is vertical.
    ox,oy=36,125
    def project(x,y,z): return ox+0.78*x+0.37*y,oy-0.24*x+0.35*y+z
    def face(points,color):
        c.setFillColor(color); c.setStrokeColor(INK); c.setLineWidth(.5)
        polygon(c,[project(*p) for p in points],fill=1,stroke=1)
    txt(c,105,276,'FARM HAND · CAIXA CELEIRO',16,bold=True)
    txt(c,105,266,'Prévia geométrica do molde · não imprimir para montar',9)
    # Side wall, then front facade; original card artwork transformed with planes.
    c.saveState(); c.transform(.37,.35,0,1,project(116,0,0)[0]*mm,project(116,0,0)[1]*mm); side(c); c.restoreState()
    c.saveState(); c.transform(.78,-.24,0,1,ox*mm,oy*mm); front(c); c.restoreState()
    # Roof extends 2 mm past the body on each side, and 3 mm at each end.
    roof_z=35
    face([(-2,-3,roof_z),(58,-3,roof_z+27),(58,159,roof_z+27),(-2,159,roof_z)],colors.HexColor('#387e6c'))
    face([(58,-3,roof_z+27),(118,-3,roof_z),(118,159,roof_z),(58,159,roof_z+27)],GREEN)
    # Visible gable end: same graphic as the roof end-cap, without glue tabs.
    gx,gy=project(58,-3,roof_z)
    c.saveState(); c.transform(.78,-.24,0,1,gx*mm,gy*mm)
    c.setFillColor(RED); c.setStrokeColor(CREAM); c.setLineWidth(1.4)
    polygon(c,[(-60,-10),(60,-10),(60,0),(0,27),(-60,0)],fill=1,stroke=1)
    image(c,'logo',-14,1,28,18.3)
    c.restoreState()
    # Roof seams follow the same geometry as the printed roof.
    c.setStrokeColor(colors.HexColor('#164f43')); c.setLineWidth(.45)
    for yy in range(5,159,12):
        ln(c,*project(58,yy,roof_z+27),*project(118,yy,roof_z))
    # The two roof prints use the same affine maps as the unfolded panels.
    for origin, coefficient, angle in [((-2,-3,roof_z),27,-90),((58,-3,roof_z+27),-27,90)]:
        px,py=project(*origin)
        c.saveState()
        c.transform(.78*60/SLOPE,(-.24*60+coefficient)/SLOPE,.37,.35,px*mm,py*mm)
        c.translate(SLOPE/2*mm,LENGTH/2*mm); c.rotate(angle)
        image(c,'logo',-24,-15.68,48,31.36)
        txt(c,0,-22,'UM CELEIRO CHEIO DE PALPITES',7,CREAM,True)
        c.restoreState()
    face([(118,-3,roof_z-10),(118,159,roof_z-10),(118,159,roof_z),(118,-3,roof_z)],GREEN)
    txt(c,105,66,'Telhado inclinado removível · paredes com as cartas originais',9,bold=True)
    txt(c,105,57,'Área das cartas: base 156 × 116 mm; paredes de 34 mm',8)
    txt(c,105,50,'Altura total aproximada: 60–62 mm, incluindo o telhado',8)
    txt(c,105,38,'Protótipo sem teste físico. Use o PDF de 2 páginas para imprimir.',8)
    txt(c,105,30,'Farm Hand © Grail Games · arte original: Samuel Bouvant',7)
    c.showPage()


def main():
    output=ROOT/'celeiro-farm-hand-a4.pdf'
    c=canvas.Canvas(str(output),pagesize=A4,pageCompression=1)
    c.setTitle('Farm Hand — celeiro com telhado removível — 2 A4')
    body(c); roof(c); c.save()
    doc=fitz.open(output)
    assert len(doc)==2
    for i,p in enumerate(doc):
        assert abs(p.rect.width-A4[0])<.01 and abs(p.rect.height-A4[1])<.01
        p.get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(ROOT/f'folha-{i+1}.png')
    # Confirm paper envelopes, roof length and cap slopes match analytically.
    assert 116+2*34 <= 190
    assert 156+2*(34+25) <= 277
    assert abs(hypot(60,27)-SLOPE)<1e-9
    assert 2*(SLOPE+10) <= 190 and LENGTH > 156
    preview_path=ROOT/'previa-celeiro.pdf'
    c=canvas.Canvas(str(preview_path),pagesize=A4,pageCompression=1)
    c.setTitle('Farm Hand — prévia geométrica do celeiro')
    preview(c); c.save()
    fitz.open(preview_path)[0].get_pixmap(matrix=fitz.Matrix(2,2)).save(ROOT/'previa-celeiro.png')
    print('Validated: 2 A4 sheets; cut paths within 10 mm margins; matching roof slopes.')
    print(output)


if __name__=='__main__': main()
