export const rules = [
  {
    id: 'visao-geral',
    title: 'Visão geral',
    text: 'Farm Hand é um jogo de vazas de previsão e dedução para 2 a 5 jogadores, cerca de 20 minutos, a partir de 10 anos. São 6 rodadas, cada uma com 3 fases: Lances, Vazas e Pontuação. As cartas vão de 1 a 7, não há trunfo e existem 3 cartas de cada número distribuídas pelos 6 naipes (21 cartas). Você vê o naipe das cartas dos oponentes (pelas costas), mas não os valores.',
  },
  {
    id: 'componentes',
    title: 'Componentes',
    text: '21 cartas de animais em 6 naipes; 5 cartas de lance; 6 tokens de madeira; 5 cartas de auxílio; 1 carta de rodada; 48 tokens de pontuação (valores 5, 1 e −1).',
  },
  {
    id: 'cartas',
    title: 'Lendo uma carta',
    text: 'o verso mostra o naipe e quais números existem nele (para os oponentes verem). A frente mostra o naipe e os números do naipe, com o número da carta destacado. Isso ajuda a prever quais outras cartas podem estar em jogo.',
  },
  {
    id: 'preparacao',
    title: 'Preparação',
    text: 'coloque os tokens de pontuação no estoque. Cada jogador pega 1 token de madeira, 1 carta de auxílio e 1 carta de lance. A carta de rodada fica visível, com o cubo na rodada 1. O que sobrar volta à caixa.',
  },
  {
    id: 'distribuicao',
    title: 'Distribuição',
    text: 'escolha um dealer, que embaralha as 21 cartas. A quantidade de cartas por jogador depende da rodada e do número de jogadores (veja o Painel da Rodada). Cartas não usadas ficam de lado e voltam na rodada seguinte. Mantenha a mão em segredo, mas deixe todos verem as costas das suas cartas.',
  },
  {
    id: 'fase-lances',
    title: 'Fase de Lances',
    text: 'olhem as próprias cartas e as costas das cartas dos oponentes e prevejam quantas vazas vão ganhar (na rodada 1, só 0 ou 1). Revelem juntos, balançando o punho no ritmo de “E-I-E-I-O!” (ou contagem até 3) e, no “O!”, mostrando com os dedos o número do lance. Depois, coloquem o token de madeira no número correspondente da carta de lance.',
  },
  {
    id: 'fase-vazas',
    title: 'Fase de Vazas',
    text: 'o jogador à esquerda do dealer inicia jogando uma carta com o número para cima. Em sentido horário, cada jogador joga uma carta. Quem não é o primeiro DEVE jogar o mesmo naipe da carta inicial, se tiver; se não tiver, joga qualquer carta. Vence a carta de maior número, de qualquer naipe. Se duas ou mais cartas do MESMO número forem jogadas, elas se anulam e vence a próxima maior (pode não haver vencedor). Quem vence recolhe as cartas e inicia a próxima vaza; se ninguém venceu, o mesmo jogador inicia de novo. Segue até as mãos esvaziarem.',
  },
  {
    id: 'exemplo-vazas',
    title: 'Exemplos de vaza',
    text: '(1) Alex inicia com o 4 azul. Dev não tem azul e joga o 6 verde. Lee tem azul e joga o 1 azul. O 6 é o maior: Dev vence. (2) Dev inicia com o 3 verde. Lee joga o 3 azul. Alex, sem verde, joga o 2 laranja. Os dois 3 se anulam e o 2 laranja de Alex vence.',
  },
  {
    id: 'pontuacao',
    title: 'Fase de Pontuação',
    text: 'compare as vazas ganhas com o lance. Acerto exato: pontos iguais ao número da rodada (R1 = 1, R2 = 2…). Erro: −1 ponto por unidade de diferença (lance 1 e 3 vazas = −2; lance 3 e 1 vaza = −2). A pontuação pode ficar negativa. Pegue tokens de pontuação do estoque para mostrar seu total. O próximo dealer é o jogador seguinte no sentido horário; ele embaralha as 21 cartas, avança o cubo de rodada e distribui. Quem está à esquerda do novo dealer inicia.',
  },
  {
    id: 'exemplo-pontuacao',
    title: 'Exemplo de pontuação (rodada 4)',
    text: 'Alex, lance 3 e 3 vazas: +4. Lee, lance 2 e 0 vazas: −2. Taylor, lance 0 e 1 vaza: −1. Dev, lance 0 e 0 vazas: +4.',
  },
  {
    id: 'fim',
    title: 'Fim de jogo',
    text: 'após 6 rodadas vence quem tiver mais pontos. Em caso de empate no topo, repete-se a última rodada até haver um vencedor.',
  },
  {
    id: 'dois-jogadores',
    title: 'Jogo com 2 jogadores',
    text: 'funciona como o de 3 a 5, com um jogador fictício, o Mac. Ele recebe cartas em toda rodada e joga como um terceiro jogador; considere-o sentado à direita do primeiro dealer (segundo a jogar na rodada 1). Abra as cartas dele em leque, com as costas visíveis. O Mac sempre joga a carta do topo da mão, exceto quando precisa seguir o naipe: aí joga a carta do topo do naipe pedido. Lances do Mac: R1 = 0, R2 = 1, R3 = 0, R4 = 2, R5 = 0, R6 = 3. Os jogadores se revezam como dealer (o Mac inicia nas rodadas 2 e 5). Todos pontuam pelas regras normais.',
  },
  {
    id: 'solitario',
    title: 'Jogo solitário',
    text: 'usa dois jogadores fictícios, Mac (à sua esquerda) e Donald (à sua direita), com as cartas deles em leque, viradas para baixo, na sua frente. Eles jogam a carta do topo ou, quando precisam seguir o naipe, a do topo que siga o naipe. Quem inicia: Mac nas rodadas 1 e 4, Donald nas 2 e 5, você nas 3 e 6. Lances do Mac: 0, 1, 0, 2, 0, 3. Lances do Donald: 1, 0, 1, 0, 2, 0. Objetivo: vencer os dois e fazer a maior pontuação possível. Consegue chegar a 21 pontos?',
  },
  {
    id: 'creditos',
    title: 'Créditos',
    text: 'Farm Hand, design de Craig Somerton, arte de Samuel Bouvant, © 2025 Grail Games. Este app é um utilitário não oficial.',
  },
];
export const summary = [
  'Antes de jogar a rodada, cada um prevê quantas vazas vai ganhar.',
  'Quem puxa a vaza escolhe o naipe; os demais seguem o naipe se tiverem.',
  'Vence a vaza o maior número, de qualquer naipe. Números iguais se anulam.',
  'Acertou o lance exato? Ganha pontos iguais ao número da rodada. Errou? Perde 1 ponto por diferença.',
  'Após 6 rodadas, vence quem tiver mais pontos.',
];
