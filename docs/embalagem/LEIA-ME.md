# Caixa Farm Hand — protótipo em duas folhas A4

**Versão atual solicitada: caixa retangular ilustrada, com espaço interno
nominal de 130 × 90 × 33 mm.** Veja
[o PDF final](caixa-retangular/caixa-retangular-farm-hand-a4.pdf) e
[suas instruções](caixa-retangular/LEIA-ME.md).
O celeiro com telhado e o molde abaixo foram preservados como propostas anteriores.

## Medidas usadas

O conjunto informado pelo usuário mede **150 × 110 × 30 mm**, com dois montinhos
de 16 cartas cada, incluindo guias. As cartas sem sleeves medem 63,5 × 88 mm.
O molde considera que a medição do conjunto já inclui os sleeves. Se a medição
foi feita sem eles, confira as medidas antes de imprimir.

| Peça | Painel entre vincos | Altura da parede | Envelope do molde |
| --- | --- | --- | --- |
| Fundo | 156 × 116 mm | 34 mm | 224 × 184 mm |
| Tampa | 160 × 120 mm | 22 mm | 204 × 164 mm |

Os moldes são girados na folha A4 retrato: o fundo ocupa 184 × 224 mm e a tampa
164 × 204 mm. Cada peça cabe em uma folha, com contorno a pelo menos 10 mm das
bordas. As abas ficam dentro desses envelopes, sem peças extras.

As cotas são entre vincos, não uma garantia da dimensão interna final. A
espessura do papel, as abas e a precisão das dobras reduzem um pouco o espaço
útil. A sobra nominal sobre o conteúdo é de 6 mm na largura e no comprimento,
e 4 mm na altura. A tampa tem painel 4 mm maior que o fundo em cada dimensão
para acomodar paredes e abas. A folga foi planejada para papel com espessura
de aproximadamente 0,3 a 0,5 mm; papelão mais espesso exige outro molde.

**Tokens não têm compartimento reservado.** A medida foi usada somente para as
32 cartas. O pontilhado central do fundo representa o volume medido; não é
divisória, corte nem vinco.

## Imprimir e montar

1. Abra `molde-caixa-farm-hand-a4.pdf` e imprima as duas páginas em folhas
   separadas, A4 retrato, **100% / tamanho real**, sem ajustar à página e sem
   impressão frente e verso. Primeiro teste em papel comum.
2. Meça o quadrado: deve ter **20 mm nos dois lados**. Se estiver diferente,
   ajuste a impressão antes de cortar.
3. Recorte somente o contorno contínuo. Preserve as quatro abas de cada peça.
4. Vinque as linhas tracejadas com ferramenta sem lâmina. Erga todas as paredes
   em direção à face impressa, deixando as instruções dentro da caixa.
5. Dobre as abas A–D para dentro. Aplique cola no verso de cada aba e encoste na
   face interna da parede vizinha. As abas ficam dentro, sem saliências externas.
6. Antes de colar definitivamente, monte com fita removível. Coloque os dois
   montinhos lado a lado, teste a retirada das cartas e o encaixe da tampa.
7. Depois do teste, use papel mais firme dentro da espessura prevista. Mantenha
   os cantos em 90° enquanto a cola seca. Só guarde as cartas quando estiver seca.

Esta é uma caixa de tampa solta, não uma embalagem com trava. A tampa de 22 mm
deixa parte do fundo de 34 mm exposta para facilitar a abertura.

## Arquivos e validação

- `molde-caixa-farm-hand-a4.pdf`: duas páginas vetoriais, prontas para o protótipo.
- `previa-1.png` e `previa-2.png`: visualização; não usar para impressão em escala.
- `gerar-molde.py`: fonte do molde, usando ReportLab e PyMuPDF.

Validação digital: tamanho A4, duas páginas, dimensões das peças, margens e
renderização. **Encaixe, resistência e capacidade física ainda não foram testados.**
O molde não inclui as artes originais do jogo.

Para gerar novamente: `python docs/embalagem/gerar-molde.py`.
