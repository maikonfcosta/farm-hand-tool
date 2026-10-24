# Caixa retangular Farm Hand — versão final solicitada

Caixa pequena convencional, só para cartas, com tampa plana removível. A tampa
leva a logo e imagens originais do jogo, junto de um desenho de fazenda.
O celeiro é apenas uma ilustração: a caixa não tem telhado ou partes salientes.

## Arquivos

- **Para imprimir:** [caixa-retangular-farm-hand-a4.pdf](caixa-retangular-farm-hand-a4.pdf).
  Duas folhas A4: fundo e tampa.
- **Para visualizar:** [previa-caixa.png](previa-caixa.png).
- `folha-1.png` e `folha-2.png`: conferência visual, não impressão em escala.
- `gerar-caixa.py`: fonte do PDF; reutiliza as imagens originais em `../celeiro/artes/`.

## Medidas adotadas

**Espaço interno nominal solicitado: 130 × 90 × 33 mm.**

O usuário informou que os dois montinhos de 16 cartas sem sleeves medem
127 × 88 × 30 mm e pediu expressamente esta caixa de 130 × 90 × 33 mm.
Há intenção de usar sleeves, mas suas medidas externas não foram fornecidas.
A capacidade com esses sleeves deve ser conferida no protótipo; não foi
calculada a partir de uma medida real deles.

O molde compensa nominalmente papel de **0,4 mm** e abas internas nos cantos.
As cotas entre vincos, por isso, diferem do espaço interno:

| Peça | Painel entre vincos | Altura das paredes |
| --- | --- | --- |
| Fundo | 130,4 × 91,2 mm | 33,4 mm |
| Tampa | 134,4 × 95,2 mm | 18 mm |

A compensação usa o centro da espessura como eixo de dobra. Os cantos com abas
têm uma camada adicional. A tampa é maior para encaixar sobre o fundo.
As dimensões externas da caixa fechada serão, portanto, maiores que
130 × 90 × 33 mm. Papel mais grosso e diferenças na execução alteram o encaixe.

## Impressão e montagem

1. Imprima o PDF em A4 retrato, **100% / tamanho real**, sem ajustar e sem frente
   e verso. Comece com papel comum e fita removível.
2. Confira o quadrado de 20 × 20 mm nas duas direções antes de cortar.
3. Recorte o contorno contínuo de cada peça. Preserve as quatro abas.
4. Vinque somente as linhas tracejadas.
5. Dobre para longe da face impressa, mantendo a arte do lado externo. No fundo,
   as paredes sobem ao redor do espaço das cartas. Na tampa, descem a partir do
   painel ilustrado. Os textos laterais da tampa foram orientados para isso.
6. Dobre as abas para dentro. A face marcada COLA deve tocar a face interna da
   parede vizinha. Monte os cantos em 90° e teste o encaixe antes da cola final.
7. Coloque os dois montinhos lado a lado e confira a retirada das cartas.
   Depois, teste os sleeves que pretende usar. Não force um encaixe apertado.
8. Só guarde as cartas após a secagem completa.

O fundo não tem divisória nem compartimento para tokens.

## Validação

Duas páginas A4 de 210 × 297 mm, desenho vetorial em milímetros, contornos
dentro das margens de 10 mm, imagens incorporadas e prévias renderizadas.
Inspeção visual da arte, das dobras e da orientação dos textos.
**A caixa ainda não foi montada fisicamente.**

As artes originais pertencem aos respectivos titulares: Farm Hand, Grail Games;
arte de Samuel Bouvant. Uso neste projeto pessoal solicitado pelo usuário.

Para regenerar:

```powershell
python docs/embalagem/caixa-retangular/gerar-caixa.py --length 130 --width 90 --height 33 --paper-thickness 0.4
```
