"""Generate a conventional illustrated rectangular card box at actual size."""
import argparse
from pathlib import Path

import fitz
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parent
ART = ROOT.parent / 'celeiro' / 'artes'
CREAM = colors.HexColor('#fff4df')
TEAL = colors.HexColor('#28695d')
INK = colors.HexColor('#233e34')
ORANGE = colors.HexColor('#f6924c')


def txt(c,x,y,s,size=8,color=INK,bold=False):
    c.setFont('Helvetica-Bold' if bold else 'Helvetica',size)
    c.setFillColor(color)
    c.drawCentredString(x*mm,y*mm,s)


def polygon(c,pts,fill=0,stroke=1):
    p=c.beginPath(); p.moveTo(pts[0][0]*mm,pts[0][1]*mm)
    for x,y in pts[1:]: p.lineTo(x*mm,y*mm)
    p.close(); c.drawPath(p,stroke=stroke,fill=fill)


def image(c,name,x,y,w,h):
    c.drawImage(str(ART/f'{name}.png'),x*mm,y*mm,w*mm,h*mm,mask='auto')


def lid_art(c,w,h):
    """Artwork in a normalized 136 x 97 mm frame, not a structural barn."""
    c.saveState(); c.scale(w/136,h/97)
    c.setFillColor(TEAL); c.rect(0,0,136*mm,97*mm,fill=1,stroke=0)
    c.setFillColor(CREAM); c.roundRect(3*mm,3*mm,130*mm,91*mm,4*mm,fill=1,stroke=0)
    c.setFillColor(colors.HexColor('#dbe6bc'))
    polygon(c,[(4,4),(132,4),(132,25),(111,32),(84,25),(58,35),(31,30),(4,23)],fill=1,stroke=0)
    c.setFillColor(colors.HexColor('#b8d3a7'))
    polygon(c,[(4,4),(132,4),(132,17),(104,25),(75,16),(43,25),(4,14)],fill=1,stroke=0)
    image(c,'logo',45,59,46,30.05)
    # A barn is now only a drawing on the flat lid.
    c.saveState(); c.translate(0,-8*mm)
    c.setFillColor(colors.HexColor('#bd513b')); c.rect(13*mm,33*mm,37*mm,24*mm,fill=1,stroke=0)
    c.setFillColor(TEAL); polygon(c,[(9,57),(31.5,73),(54,57)],fill=1,stroke=0)
    c.setFillColor(colors.HexColor('#883b2e')); c.rect(23*mm,33*mm,17*mm,20*mm,fill=1,stroke=0)
    c.setStrokeColor(CREAM); c.setLineWidth(1.3)
    for a,b,d,e in [(23,33,40,53),(23,53,40,33),(23,33,23,53),(40,33,40,53),(23,53,40,53)]:
        c.line(a*mm,b*mm,d*mm,e*mm)
    c.setFillColor(CREAM); c.circle(31.5*mm,60*mm,3*mm,fill=1,stroke=0)
    c.restoreState()
    # Original cards, fanned like a hand, preserve the source artwork verbatim.
    for name,x,y,angle in [('pato',68,31,13),('porco',88,30,0),('galo',108,31,-13)]:
        c.saveState(); c.translate(x*mm,y*mm); c.rotate(angle)
        image(c,name,-11,-15.37,22,30.74); c.restoreState()
    txt(c,68,10,'32 CARTAS  ·  FARM HAND',8,TEAL,True)
    c.restoreState()


def wall(c,w,h,lid=False,laid_flat=False):
    c.setFillColor(TEAL if lid else ORANGE)
    c.rect(0,0,w*mm,h*mm,fill=1,stroke=0)
    c.setStrokeColor(CREAM); c.setLineWidth(0.6)
    c.line(3*mm,2*mm,(w-3)*mm,2*mm)
    c.line(3*mm,(h-2)*mm,(w-3)*mm,(h-2)*mm)
    c.saveState()
    # Lid walls descend from the top panel; base walls rise from the floor.
    if lid and laid_flat:
        c.translate(w*mm,h*mm); c.rotate(180)
    txt(c,w/2,h/2-1.5,'FARM HAND',11,CREAM,True)
    c.restoreState()
    # Marks distinguish the illustrated lid from the plain orange base.
    for px in [8,w-8]:
        c.setFillColor(CREAM); c.circle(px*mm,h/2*mm,1.2*mm,fill=1,stroke=0)


def sheet(c,index,w,h,depth,lid):
    x,y=(210-w)/2,(297-h)/2
    tab=10
    # Exterior print: art reads upright when walls fold away from the print.
    for px,py,angle,length in [(x,y+h,0,w),(x+w,y,180,w),(x,y,90,h),(x+w,y+h,-90,h)]:
        c.saveState(); c.translate(px*mm,py*mm); c.rotate(angle); wall(c,length,depth,lid,laid_flat=True); c.restoreState()
    if lid:
        c.saveState(); c.translate(x*mm,(y+h)*mm); c.rotate(-90); lid_art(c,h,w); c.restoreState()
    else:
        c.setFillColor(CREAM); c.rect(x*mm,y*mm,w*mm,h*mm,fill=1,stroke=0)
        txt(c,105,165,'FARM HAND',17,bold=True)
        txt(c,105,155,'CAIXA PARA 32 CARTAS',9,bold=True)
        txt(c,105,145,'Dois montinhos de 16',8)
        txt(c,105,135,'Conteúdo: 127 × 88 × 30 mm',8)
        txt(c,105,116,'Arte original: Samuel Bouvant',6.5)
        txt(c,105,111,'Farm Hand © Grail Games',6.5)
    for px,py,side in [(x,y-depth,-1),(x+w,y-depth,1),(x,y+h,-1),(x+w,y+h,1)]:
        pts=[(px,py),(px+side*tab,py+2),(px+side*tab,py+depth-2),(px,py+depth)]
        c.setFillColor(colors.HexColor('#eee4d3')); polygon(c,pts,fill=1,stroke=0)
        txt(c,px+side*tab/2,py+depth/2,'COLA',5)
    outline=[(x,y-depth),(x+w,y-depth),(x+w+tab,y-depth+2),(x+w+tab,y-2),(x+w,y),(x+w+depth,y),(x+w+depth,y+h),(x+w,y+h),(x+w+tab,y+h+2),(x+w+tab,y+h+depth-2),(x+w,y+h+depth),(x,y+h+depth),(x-tab,y+h+depth-2),(x-tab,y+h+2),(x,y+h),(x-depth,y+h),(x-depth,y),(x,y),(x-tab,y-2),(x-tab,y-depth+2)]
    assert all(10<=px<=200 and 10<=py<=287 for px,py in outline)
    c.setStrokeColor(INK); c.setLineWidth(.6); polygon(c,outline)
    segments=[(x,y,x+w,y),(x,y+h,x+w,y+h),(x,y,x,y+h),(x+w,y,x+w,y+h),(x,y-depth,x,y),(x+w,y-depth,x+w,y),(x,y+h,x,y+h+depth),(x+w,y+h,x+w,y+h+depth)]
    for color,width in [(CREAM,1.2),(INK,.4)]:
        c.setStrokeColor(color); c.setLineWidth(width); c.setDash(3,2)
        for a,b,d,e in segments: c.line(a*mm,b*mm,d*mm,e*mm)
    c.setDash()
    txt(c,105,281,f'{index}/2 · '+('TAMPA PLANA ILUSTRADA' if lid else 'FUNDO RETANGULAR'),14,bold=True)
    txt(c,105,272,f'Entre vincos: {h:g} × {w:g} mm · parede {depth:g} mm',9)
    txt(c,105,264,'A4 retrato · 100% / tamanho real · sem ajustar à página',8)
    c.setStrokeColor(INK); c.setLineWidth(.5); c.rect(16*mm,16*mm,20*mm,20*mm,fill=0,stroke=1)
    txt(c,26,27,'20 mm',7); txt(c,26,22,'× 20 mm',7)
    txt(c,121,33,'Linha contínua: corte. Linha tracejada: vinco.',7)
    txt(c,121,27,'Dobre para longe da arte, que deve ficar por fora.',7)
    txt(c,121,21,'Cole as abas por dentro das paredes. Teste antes de colar.',7)
    txt(c,105,10,'Protótipo sem teste físico · somente cartas · sem compartimento para tokens',6.5)
    c.showPage()


def preview(c,length,width,height):
    txt(c,105,276,'FARM HAND · CAIXA RETANGULAR',16,bold=True)
    txt(c,105,265,'Tampa plana ilustrada · somente cartas',9)
    ox,oy=28,141
    def p(x,y,z): return ox+.9*x+.4*y,oy-.22*x+.45*y+z
    # Long front wall and short right wall of the orange base.
    c.saveState(); c.transform(.9,-.22,0,1,ox*mm,oy*mm); wall(c,length,height); c.restoreState()
    px,py=p(length,0,0)
    c.saveState(); c.transform(.4,.45,0,1,px*mm,py*mm); wall(c,width,height); c.restoreState()
    # The lid overlaps the base by 18 mm. Its overhang matches the print plan.
    lx,wy,z=length+4,width+4,height+1
    px,py=p(-2,-2,z-18)
    c.saveState(); c.transform(.9,-.22,0,1,px*mm,py*mm); wall(c,lx,18,True); c.restoreState()
    px,py=p(length+2,-2,z-18)
    c.saveState(); c.transform(.4,.45,0,1,px*mm,py*mm); wall(c,wy,18,True); c.restoreState()
    px,py=p(-2,-2,z)
    c.saveState(); c.transform(.9,-.22,.4,.45,px*mm,py*mm); lid_art(c,lx,wy); c.restoreState()
    txt(c,105,91,'Espaço interno nominal: 130 × 90 × 33 mm',10,bold=True)
    txt(c,105,81,'Prévia geométrica, não fotografia. Encaixe físico ainda não testado.',8)
    txt(c,105,69,'Use o PDF de duas folhas para imprimir, a 100%.',8)
    c.showPage()


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--length',type=float,required=True)
    parser.add_argument('--width',type=float,required=True)
    parser.add_argument('--height',type=float,required=True)
    parser.add_argument('--paper-thickness',type=float,default=.4)
    args=parser.parse_args()
    # Fold axes are taken at the material centerline. The two long side walls
    # have internal corner tabs, hence three thicknesses across the short axis.
    # Long axis has no additional internal tab layers. This is a nominal model;
    # scoring and hand assembly must be checked with a physical prototype.
    length=args.length+args.paper_thickness
    width=args.width+3*args.paper_thickness
    height=args.height+args.paper_thickness
    out=ROOT/'caixa-retangular-farm-hand-a4.pdf'
    c=canvas.Canvas(str(out),pagesize=A4,pageCompression=1)
    c.setTitle('Farm Hand — caixa retangular ilustrada — duas A4')
    sheet(c,1,width,length,height,False)
    sheet(c,2,width+4,length+4,18,True)
    c.save()
    d=fitz.open(out)
    assert len(d)==2
    for i,page in enumerate(d):
        assert abs(page.rect.width-A4[0])<.01 and abs(page.rect.height-A4[1])<.01
        page.get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(ROOT/f'folha-{i+1}.png')
    p=ROOT/'previa-caixa.pdf'
    c=canvas.Canvas(str(p),pagesize=A4,pageCompression=1)
    preview(c,length,width,height); c.save()
    fitz.open(p)[0].get_pixmap(matrix=fitz.Matrix(2,2)).save(ROOT/'previa-caixa.png')
    print('Validated: two A4 sheets, cut paths within 10 mm margins, rendered previews.')
    print(out)


if __name__=='__main__': main()
