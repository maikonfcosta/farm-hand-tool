# Farm Hand Tracker — Especificação Completa do WebApp

_Versão 1.0 · Produto em pt-BR · Documento para IA de desenvolvimento executar de forma autônoma, sem pedir aprovações_

## 0. Protocolo de execução (ler primeiro)

1. Este documento é a única fonte de verdade. Todas as decisões já foram tomadas.
2. Proibido pedir aprovação ou confirmação. Se um ponto não estiver coberto, escolher a opção mais simples que não crie funcionalidade nova e registrar em `DECISIONS.md` (data, dúvida, escolha).
3. Proibido inventar regra do jogo. Regras, números e textos de regra vêm somente das seções 2 e 7.6.
4. Proibido adicionar biblioteca, tela, funcionalidade ou tipo de token fora desta especificação (a seção 12 lista o que está fora).
5. Seguir a ordem das fases da seção 11. Cada fase só termina quando seus critérios de aceite passam.
6. Todo texto de interface fica em `src/content/ptbr.ts`, usando os textos definidos aqui.
7. Versões: usar as majors indicadas; se a versão exata não existir, usar a mais recente da mesma major, sem consultar.
8. Entregáveis: código, testes, `README.md` (rodar, testar, build, deploy) e `DECISIONS.md`.
9. Commits em inglês, detalhados (motivo, o que mudou, verificação), sem trailer `Co-Authored-By` nem atribuição a IA. Se o repositório for Azure DevOps: PRs com `!` e Work Items com `#`.

## 1. Visão geral

**Produto:** webapp mobile-first para usar à mesa durante partidas de **Farm Hand** (jogo de vazas de Craig Somerton, Grail Games, 2–5 jogadores, cerca de 20 min). Substitui os tokens físicos de pontuação por contadores e oferece consulta rápida a regras e cartas.

**Em uma frase:** cada jogador tem 3 contadores (imagem do token + botões − e +), com menu inicial, regras sempre à mão e ferramentas de apoio à rodada.

| #   | Funcionalidade                                                                               | Tela          |
| --- | -------------------------------------------------------------------------------------------- | ------------- |
| F1  | Menu inicial com acesso ao contador e às regras                                              | `/`           |
| F2  | Configuração de partida: 2 a 5 jogadores, nomes, primeiro dealer, modo solo                  | `/jogo/novo/` |
| F3  | Contador de tokens por jogador (somente imagem + − / +), total automático e ranking          | `/jogo/`      |
| F4  | Painel da rodada: cartas por jogador, dealer, quem inicia, lances, vazas e pontos calculados | `/rodada/`    |
| F5  | Guia de cartas com marcação de cartas vistas e contagem do que resta por número              | `/cartas/`    |
| F6  | Regras completas em pt-BR, com busca e resumo rápido                                         | `/regras/`    |
| F7  | Mac e Donald (jogadores fictícios) com lances automáticos                                    | F2 e F4       |
| F8  | Fim de jogo com ranking, desempate e meta solo de 21 pontos                                  | `/fim/`       |
| F9  | Persistência local, PWA offline, tela sempre ligada, vibração                                | `/ajustes/`   |

## 2. Fatos do jogo (fonte: manual oficial em inglês)

### 2.1 Tokens de pontuação — os únicos que viram contador

O manual lista 48 tokens de pontuação “valorados 5 / 1 / −1”. Eles registram a pontuação de cada jogador.

| id       | Nome no app   | Valor | Como identificar a imagem                      | Arquivo                                 |
| -------- | ------------- | ----- | ---------------------------------------------- | --------------------------------------- |
| `saco`   | Saco de grãos | +5    | saco bege de estopa com o número 5             | `public/assets/tokens/saco-5.png`       |
| `espiga` | Espiga        | +1    | espiga (folha) de trigo dourada com o número 1 | `public/assets/tokens/espiga-1.png`     |
| `rato`   | Rato          | −1    | rato cinza com “-1” em vermelho                | `public/assets/tokens/rato-menos-1.png` |

- Pontuação total do jogador = `5 × sacos + 1 × espigas − 1 × ratos`. Pode ser negativa (o manual permite).
- O manual **não informa** quantos tokens de cada tipo existem. Decisão: estoque ilimitado no app; limite técnico de 99 por contador.
- Os nomes “Saco de grãos / Espiga / Rato” descrevem o desenho; o manual só os chama de “scoring tokens”.

### 2.2 Demais componentes (não viram contador)

6 tokens de madeira (5 marcadores de lance + 1 cubo de rodada), 5 cartas de lance (0–6), 1 carta de rodada, 5 cartas de auxílio e 21 cartas de animais em 6 naipes.

### 2.3 Cartas (21): números por naipe

Cada número de 1 a 7 existe em exatamente 3 naipes. Não há trunfo.

| Naipe (cor)        | Números          | Qtde |
| ------------------ | ---------------- | ---- |
| Menta (verde-água) | 1, 3, 4, 5, 6    | 5    |
| Laranja            | 2, 7             | 2    |
| Azul               | 1, 2, 3, 4, 5, 7 | 6    |
| Amarelo            | 1, 4, 7          | 3    |
| Lima (verde-limão) | 2, 3, 5, 6       | 4    |
| Rosa               | 6                | 1    |

### 2.4 Cartas por jogador em cada rodada

A contagem de jogadores inclui Mac e Donald.

| Rodada | 2–3 jogadores | 4 jogadores | 5 jogadores |
| ------ | ------------- | ----------- | ----------- |
| 1      | 1             | 1           | 1           |
| 2      | 2             | 2           | 2           |
| 3      | 3             | 3           | 3           |
| 4      | 4             | 4           | 4           |
| 5      | 5             | 5           | 4           |
| 6      | 6             | 5           | 4           |

Cartas não distribuídas na rodada = `21 − (jogadores × cartas por jogador)`. A quantidade de vazas da rodada é igual às cartas por jogador.

### 2.5 Lances fixos dos jogadores fictícios

| Rodada | 1   | 2   | 3   | 4   | 5   | 6   |
| ------ | --- | --- | --- | --- | --- | --- |
| Mac    | 0   | 1   | 0   | 2   | 0   | 3   |
| Donald | 1   | 0   | 1   | 0   | 2   | 0   |

Na partida de 2 jogadores só o Mac existe; o Donald só existe no solo.

### 2.6 Pontuação de rodada

- Lance igual às vazas ganhas → pontos = número da rodada (R1 = 1, …, R6 = 6).
- Lance diferente → −1 ponto por unidade de diferença (lance 1 e 3 vazas → −2; lance 3 e 1 vaza → −2).
- Máximo possível no jogo: 1+2+3+4+5+6 = 21.

### 2.7 Lacunas do manual e decisões do app

| Lacuna                                        | Decisão                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Quantos tokens de cada tipo existem           | Ilimitado; máximo 99 por contador                                                                                     |
| Como representar pontos em tokens             | Positivos viram sacos + espigas (menos tokens possível); negativos viram ratos; contadores também são editáveis à mão |
| Dealer no modo solo                           | Não existe; o app mostra só quem inicia, conforme o manual                                                            |
| Empate: pontos da rodada 6 original           | Mantidos; a rodada extra soma por cima, vale 6 pontos e mantém dealer e quem inicia da rodada 6                       |
| Restrição entre lances (ex.: soma dos lances) | Não existe no manual; o app não restringe                                                                             |

## 3. Decisões fechadas

| Tema                       | Decisão                                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jogadores (partida padrão) | Mínimo 2, máximo 5 humanos                                                                                                                                              |
| 2 humanos                  | Mac entra automaticamente (obrigatório pelo manual) → 3 cartões; ordem horária J1 → J2 → Mac; J1 é o primeiro dealer                                                    |
| Solo                       | 1 humano (“Você”) + Mac + Donald → 3 cartões; meta de 21 pontos                                                                                                         |
| Contador                   | 3 tipos de token por jogador; faixa 0–99; cada contador exibe apenas a imagem do token, a quantidade numérica e os botões − e +; nenhum rótulo textual do token na tela |
| Total                      | Exibido no cabeçalho do cartão do jogador                                                                                                                               |
| Idioma                     | Somente pt-BR; “trick” = “vaza”                                                                                                                                         |
| Tema                       | Somente claro, com a paleta do manual (seção 8)                                                                                                                         |
| Dados                      | `localStorage`; sem backend, login ou analytics                                                                                                                         |
| Offline                    | PWA instalável com service worker escrito à mão                                                                                                                         |
| Orientação                 | Mobile-first em retrato; funciona em tablet e desktop                                                                                                                   |
| Nome de jogador            | 1–16 caracteres, únicos (ignora maiúsculas), padrão “Jogador N”                                                                                                         |
| Deploy                     | Export estático (`output: 'export'`), hospedável na Vercel ou em qualquer CDN                                                                                           |

## 4. Stack e arquitetura

| Item             | Escolha                                                               | Em termos práticos                                         |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Framework        | Next.js 15 (App Router), React 19, TypeScript estrito                 | Estrutura de páginas pronta; roda como site estático       |
| Export estático  | `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true` | Gera só HTML/JS/CSS; sem servidor para manter              |
| Estilo           | Tailwind CSS 4                                                        | Estilos nas próprias classes; sem CSS solto                |
| Estado           | Zustand 5 com middleware `persist` (localStorage)                     | Um cofre global que sobrevive a recarregar a página        |
| Ícones           | `lucide-react`                                                        | Ícones do menu e dos botões                                |
| Fontes           | `next/font/google`: Josefin Sans (corpo) e Chango (títulos)           | Visual parecido com o do manual; fontes embutidas no build |
| Testes unitários | Vitest                                                                | Conferem contas e regras sem abrir navegador               |
| Testes E2E       | Playwright (Chromium; viewports 390×844 e 1280×800)                   | Um robô usa o app como o jogador usa                       |
| Qualidade        | ESLint, Prettier, `tsc --noEmit`                                      | Pega erro antes de rodar                                   |
| PWA              | `public/manifest.webmanifest` + `public/sw.js` escrito à mão          | Instala na tela inicial e abre sem internet                |

Scripts do `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `icons`.

**Princípio:** a lógica do jogo vive em funções puras em `src/domain` (sem React e sem localStorage); os componentes só exibem e chamam ações do store. Na prática: as contas ficam isoladas e 100% testáveis.

**Hidratação:** o store usa `skipHydration: true`; um `StoreProvider` client chama `rehydrate()` num `useEffect`, e as telas mostram um esqueleto até `hydrated === true`. Na prática: evita a tela piscar com dados diferentes entre servidor e navegador.

## 5. Estrutura de pastas

```
src/
  app/  layout.tsx, page.tsx (menu), jogo/page.tsx, jogo/novo/page.tsx,
        rodada/page.tsx, cartas/page.tsx, regras/page.tsx, ajustes/page.tsx, fim/page.tsx
  domain/     types.ts, tokens.ts, scoring.ts, rounds.ts, cards.ts, ranking.ts, dummies.ts
  store/      gameStore.ts, StoreProvider.tsx
  components/ AppShell, BottomNav, PageHeader, MenuCard, PlayerCard, TokenCounter, TokenImage,
              RoundBar, StepperField, ConfirmDialog, RulesAccordion, CardGrid, RankingList, Toggle
  content/    ptbr.ts, rules.ts
  hooks/      useHydrated.ts, useWakeLock.ts, useHaptics.ts
public/  assets/tokens/, icons/, manifest.webmanifest, sw.js
scripts/ generate-icons.mjs
tests/   unit/*.test.ts, e2e/*.spec.ts
README.md, DECISIONS.md
```

## 6. Modelo de dados e lógica

### 6.1 Tipos (`src/domain/types.ts`)

```ts
export type TokenType = 'saco' | 'espiga' | 'rato';
export const TOKEN_ORDER: TokenType[] = ['saco', 'espiga', 'rato'];
export const TOKEN_VALUE: Record<TokenType, number> = {
  saco: 5,
  espiga: 1,
  rato: -1,
};
export const TOKEN_MIN = 0;
export const TOKEN_MAX = 99;
export type TokenCounts = Record<TokenType, number>;

export type Mode = 'standard' | 'solo';
export type PlayerKind = 'human' | 'mac' | 'donald';
export type RoundNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface Player {
  id: string;
  name: string;
  kind: PlayerKind;
  tokens: TokenCounts;
}
export interface Draft {
  bid: number;
  tricks: number;
}

export interface RoundResult {
  round: RoundNumber;
  tiebreak: number; // 0 = rodada normal; 1, 2... = rodadas extras de desempate
  entries: { playerId: string; bid: number; tricks: number; points: number }[];
  delta: Record<string, TokenCounts>; // tokens somados por jogador (usado no desfazer)
}

export interface GameState {
  schemaVersion: 1;
  mode: Mode;
  players: Player[]; // ordem de exibição; no modo padrão é também a ordem horária à mesa
  firstDealerId: string | null; // null no solo
  currentRound: RoundNumber;
  tiebreakCount: number;
  draft: Record<string, Draft>; // chave = playerId
  history: RoundResult[];
  finished: boolean;
}

export interface Settings {
  vibrate: boolean;
  wakeLock: boolean;
}
export interface RootState {
  game: GameState | null;
  seenCards: string[];
  settings: Settings;
}
```

Chave do localStorage: `farmhand-tracker:v1`. Padrões: `vibrate: true`, `wakeLock: true`, `seenCards: []`. Ids: Mac = `mac`, Donald = `donald`; humanos usam `crypto.randomUUID()`.

### 6.2 Funções puras (`src/domain`)

```ts
totalPoints(t: TokenCounts): number            // 5*saco + espiga - rato
clampToken(n: number): number                  // limita a 0..99
cardsPerPlayer(round: RoundNumber, n: number): number
  // n <= 3 → round ; n === 4 → [1,2,3,4,5,5][round-1] ; n === 5 → [1,2,3,4,4,4][round-1]
unusedCards(round: RoundNumber, n: number): number   // 21 - n * cardsPerPlayer(round, n)
scoreRound(roundValue: number, bid: number, tricks: number): number
  // bid === tricks ? roundValue : -Math.abs(bid - tricks)
pointsToTokens(points: number): TokenCounts
  // p > 0: saco = floor(p/5), espiga = p % 5, rato = 0 ; p < 0: rato = -p ; p = 0: tudo 0
dummyBid(kind: 'mac' | 'donald', round: RoundNumber): number   // tabela 2.5
dealerId(game: GameState, round: RoundNumber): string | null    // null no solo
leaderId(game: GameState, round: RoundNumber): string
rankPlayers(players: Player[]): { player: Player; total: number; position: number }[]
  // ordena por total desc; empate recebe a mesma posição (1, 1, 3)
```

### 6.3 Dealer e quem inicia

- **Padrão (3 a 5 humanos):** `seat = players` na ordem cadastrada (sentido horário). `dealerIdx(r) = (idx(firstDealerId) + r − 1) mod n` e `leaderIdx(r) = (dealerIdx(r) + 1) mod n`.
- **Padrão (2 humanos + Mac):** `players = [J1, J2, Mac]`, `firstDealerId = J1`, mesma fórmula. Dealers por rodada: `[J1, J2, Mac, J1, J2, Mac]`. Quem inicia: `[J2, Mac, J1, J2, Mac, J1]` (o Mac inicia nas rodadas 2 e 5, como diz o manual).
- **Solo:** sem dealer. Quem inicia por rodada (tabela fixa): `[Mac, Donald, Você, Mac, Donald, Você]`. Ordem de exibição: Você, Mac, Donald.
- **Rodada extra de desempate:** reutiliza dealer e quem inicia da rodada 6.

### 6.4 Ações do store

`startGame(config)`, `setTokens(playerId, type, ±1)`, `resetPlayerTokens(playerId)`, `resetAllTokens()`, `renamePlayer(id, name)`, `setDraft(playerId, field, value)`, `applyRound()`, `undoLastRound()`, `startTiebreak()`, `finishGame()`, `toggleSeenCard(key)`, `clearSeenCards()`, `setSetting(key, value)`, `clearAllData()`.

- `setTokens` ignora a ação se o resultado sair de 0..99.
- Chave de carta vista: `${suitId}-${numero}` (ex.: `azul-3`; ids de naipe: `menta`, `laranja`, `azul`, `amarelo`, `lima`, `rosa`).
- `draft` inicial: `{ bid: 0, tricks: 0 }` por jogador; para Mac/Donald, `bid = dummyBid(kind, currentRound)` (somente leitura na UI). O draft é recriado ao mudar de rodada.

**`applyRound`:**

1. Pré-condição: soma das `tricks` de todos ≤ `cardsPerPlayer(currentRound, n)` (pode ser menor, pois vaza anulada não tem vencedor). Se violada, não altera o estado.
2. Para cada jogador: `points = scoreRound(currentRound, bid, tricks)` (na rodada extra o valor é 6).
3. `delta = pointsToTokens(points)`; somar ao contador com `clampToken`.
4. Inserir `RoundResult` em `history`; limpar `seenCards`.
5. Se `currentRound < 6`: `currentRound += 1` e recriar `draft`. Senão: `finished = true` e a UI navega para `/fim/`.

**`undoLastRound`:** remove o último item de `history`; subtrai `delta` dos contadores (mínimo 0); restaura `currentRound`, `tiebreakCount` e `draft` (com os `bid`/`tricks` do item); `finished = false`.

**`startTiebreak`:** só quando `finished` e há empate na 1ª posição: `tiebreakCount += 1`, `finished = false`, `currentRound` permanece 6, `draft` recriado.

## 7. Telas

Todas as telas, exceto `/` e `/jogo/novo/`, exibem `BottomNav` fixo com 5 itens: Menu, Tokens, Rodada, Cartas, Regras. As rotas `/jogo/`, `/rodada/` e `/fim/` redirecionam para `/jogo/novo/` quando não há partida.

### 7.1 Menu inicial (`/`)

- Título “Farm Hand Tracker”; subtítulo “Controle de tokens e consulta rápida”.
- Com partida em andamento: faixa “Continuar partida” com “Rodada X de 6 · N jogadores” (no solo: “Rodada X de 6 · Solitário”), que leva a `/jogo/`.
- Cartões de menu (1 coluna abaixo de 640 px; 2 colunas a partir de 640 px), cada um com ícone, título e uma linha de descrição:

| Título             | Descrição                    | Destino                               | `data-testid`        |
| ------------------ | ---------------------------- | ------------------------------------- | -------------------- |
| Contador de Tokens | Pontuação de cada jogador    | `/jogo/` (sem partida: `/jogo/novo/`) | `menu-card-contador` |
| Regras             | Como jogar, em português     | `/regras/`                            | `menu-card-regras`   |
| Painel da Rodada   | Lances, vazas e pontos       | `/rodada/`                            | `menu-card-rodada`   |
| Guia de Cartas     | Quais cartas existem         | `/cartas/`                            | `menu-card-cartas`   |
| Nova Partida       | Escolher jogadores e modo    | `/jogo/novo/`                         | `menu-card-nova`     |
| Ajustes            | Vibração, tela ligada, dados | `/ajustes/`                           | `menu-card-ajustes`  |

### 7.2 Nova Partida (`/jogo/novo/`)

- Seletor de modo (2 botões segmentados): “Partida padrão” (padrão) e “Solitário”.
- **Padrão:** stepper “Jogadores” com − e +, mínimo **2**, máximo **5**, valor inicial 3 (− desabilitado em 2; + desabilitado em 5). Um campo de nome por jogador (placeholder “Jogador N”). Com 3 a 5 jogadores: seleção “Quem é o primeiro dealer” (rádio, padrão Jogador 1). Com 2 jogadores: aviso “O Mac, jogador fictício, entra automaticamente” e o primeiro dealer é o Jogador 1.
- **Solitário:** um campo “Seu nome” (padrão “Você”) e o aviso “Você joga contra o Mac e o Donald. Meta: 21 pontos”.
- Validação: máximo 16 caracteres; nomes únicos (ignora maiúsculas). Erro inline: “Os nomes precisam ser diferentes.” e botão de iniciar desabilitado. Nome vazio vira o padrão.
- Botão “Iniciar partida” (`start-game`). Se já existe partida não finalizada: `ConfirmDialog` “Substituir a partida atual? Os tokens atuais serão perdidos.” com \[Cancelar\] e \[Substituir\]. Após iniciar, vai para `/jogo/`.
- Todos começam com `{ saco: 0, espiga: 0, rato: 0 }`.

### 7.3 Contador de Tokens (`/jogo/`)

- Cabeçalho: voltar ao Menu, título “Contador de Tokens” e menu “⋯” com “Zerar todos os tokens”, “Encerrar partida” (executa `finishGame` e vai a `/fim/`) e “Nova partida”. Todas com `ConfirmDialog`.
- `RoundBar` fixa abaixo do cabeçalho: “Rodada X de 6 · N cartas por jogador” e “Dealer: Nome · Começa: Nome” (no solo, só “Começa: Nome”). Em rodada extra: “Rodada 6 · Desempate #K”.
- Grade de `PlayerCard`: 1 coluna abaixo de 640 px, 2 colunas a partir de 640 px, 3 colunas a partir de 1024 px.
- **`PlayerCard`:** faixa com a cor do jogador; nome (toque abre diálogo de renomear, só para humanos); total “N pts” (`player-{i}-total`); três `TokenCounter` lado a lado na ordem saco, espiga, rato; botão discreto “Zerar” (com confirmação).
- **`TokenCounter`** (de cima para baixo): imagem do token (64 px no celular, 96 px a partir de 640 px), quantidade numérica e uma linha com botão − e botão +. − desabilitado em 0; + desabilitado em 99. Alvos de toque de pelo menos 56×56 px. **Sem legenda textual**; o `aria-label` descreve (seção 9). `data-testid`: `player-{i}-token-{saco|espiga|rato}-{minus|plus|count}`, com `i` começando em 0.
- Abaixo da grade: `RankingList` (posição, nome, total; empate compartilha a posição).
- Vibração de 10 ms ao tocar − ou + se estiver habilitada e suportada.

### 7.4 Painel da Rodada (`/rodada/`)

- Cartão de informações: “Rodada X de 6”, “Cartas por jogador: C”, “Cartas fora da rodada: U”, “Acerto vale: X pts”, dealer e quem começa (como em 7.3).
- Lista de jogadores na ordem de exibição. Cada linha: nome; `StepperField` “Lance” (0 a C); `StepperField` “Vazas” (0 a C); chip de pontos previstos (“+3” verde, “−2” vermelho) calculado ao vivo por `scoreRound`. Mac e Donald: lance fixo e travado (ícone de cadeado); vazas editável.
- Indicador “Vazas atribuídas: S/C”. Se S > C: indicador vermelho, mensagem “A soma das vazas não pode passar de C.” e botão de aplicar desabilitado.
- Botão primário “Aplicar pontos da rodada” (`apply-round`) abre `ConfirmDialog` listando “Nome: lance L, vazas V → +P”; ao confirmar executa `applyRound`.
- Botão secundário “Desfazer última rodada” (`undo-round`), desabilitado sem histórico.
- “Histórico”: tabela rodadas × jogadores com os pontos de cada rodada e linha de total.
- Com jogo finalizado: botão “Ver resultado” que leva a `/fim/`.

### 7.5 Guia de Cartas (`/cartas/`)

- Grade de 6 linhas (naipes, com cor e nome) × 7 colunas (números 1 a 7). Carta que existe: botão colorido com o número. Carta que não existe: célula cinza vazia com “·”.
- Tocar numa carta alterna “vista” (riscada, opacidade 35%), salva em `seenCards`.
- Linha de rodapé “Restam”: `3 − marcadas daquele número`. Contador “Vistas: X de 21” e botão “Limpar marcações”.
- Texto fixo: “Cada número existe em 3 naipes. Números iguais na mesma vaza se anulam.”
- As marcações são limpas ao aplicar uma rodada. Esta tela funciona mesmo sem partida.

### 7.6 Regras (`/regras/`)

- Campo de busca “Buscar nas regras”: filtra seções por título ou texto, sem diferenciar acentos nem maiúsculas (`normalize('NFD')`). Sem resultado: “Nenhuma regra encontrada.”.
- Cartão “Resumo em 30 segundos” sempre visível (abaixo).
- Seções em acordeão (a primeira aberta), cada uma com âncora igual ao seu id (ex.: `#fase-vazas`). Textos em `src/content/rules.ts`, implementados **exatamente como abaixo**.

**Resumo em 30 segundos**

1. Antes de jogar a rodada, cada um prevê quantas vazas vai ganhar.
2. Quem puxa a vaza escolhe o naipe; os demais seguem o naipe se tiverem.
3. Vence a vaza o maior número, de qualquer naipe. Números iguais se anulam.
4. Acertou o lance exato? Ganha pontos iguais ao número da rodada. Errou? Perde 1 ponto por diferença.
5. Após 6 rodadas, vence quem tiver mais pontos.

**Seções (id · título · texto)**

- `visao-geral` · Visão geral: Farm Hand é um jogo de vazas de previsão e dedução para 2 a 5 jogadores, cerca de 20 minutos, a partir de 10 anos. São 6 rodadas, cada uma com 3 fases: Lances, Vazas e Pontuação. As cartas vão de 1 a 7, não há trunfo e existem 3 cartas de cada número distribuídas pelos 6 naipes (21 cartas). Você vê o naipe das cartas dos oponentes (pelas costas), mas não os valores.
- `componentes` · Componentes: 21 cartas de animais em 6 naipes; 5 cartas de lance; 6 tokens de madeira; 5 cartas de auxílio; 1 carta de rodada; 48 tokens de pontuação (valores 5, 1 e −1).
- `cartas` · Lendo uma carta: o verso mostra o naipe e quais números existem nele (para os oponentes verem). A frente mostra o naipe e os números do naipe, com o número da carta destacado. Isso ajuda a prever quais outras cartas podem estar em jogo.
- `preparacao` · Preparação: coloque os tokens de pontuação no estoque. Cada jogador pega 1 token de madeira, 1 carta de auxílio e 1 carta de lance. A carta de rodada fica visível, com o cubo na rodada 1. O que sobrar volta à caixa.
- `distribuicao` · Distribuição: escolha um dealer, que embaralha as 21 cartas. A quantidade de cartas por jogador depende da rodada e do número de jogadores (veja o Painel da Rodada). Cartas não usadas ficam de lado e voltam na rodada seguinte. Mantenha a mão em segredo, mas deixe todos verem as costas das suas cartas.
- `fase-lances` · Fase de Lances: olhem as próprias cartas e as costas das cartas dos oponentes e prevejam quantas vazas vão ganhar (na rodada 1, só 0 ou 1). Revelem juntos, balançando o punho no ritmo de “E-I-E-I-O!” (ou contagem até 3) e, no “O!”, mostrando com os dedos o número do lance. Depois, coloquem o token de madeira no número correspondente da carta de lance.
- `fase-vazas` · Fase de Vazas: o jogador à esquerda do dealer inicia jogando uma carta com o número para cima. Em sentido horário, cada jogador joga uma carta. Quem não é o primeiro DEVE jogar o mesmo naipe da carta inicial, se tiver; se não tiver, joga qualquer carta. Vence a carta de maior número, de qualquer naipe. Se duas ou mais cartas do MESMO número forem jogadas, elas se anulam e vence a próxima maior (pode não haver vencedor). Quem vence recolhe as cartas e inicia a próxima vaza; se ninguém venceu, o mesmo jogador inicia de novo. Segue até as mãos esvaziarem.
- `exemplo-vazas` · Exemplos de vaza: (1) Alex inicia com o 4 azul. Dev não tem azul e joga o 6 verde. Lee tem azul e joga o 1 azul. O 6 é o maior: Dev vence. (2) Dev inicia com o 3 verde. Lee joga o 3 azul. Alex, sem verde, joga o 2 laranja. Os dois 3 se anulam e o 2 laranja de Alex vence.
- `pontuacao` · Fase de Pontuação: compare as vazas ganhas com o lance. Acerto exato: pontos iguais ao número da rodada (R1 = 1, R2 = 2…). Erro: −1 ponto por unidade de diferença (lance 1 e 3 vazas = −2; lance 3 e 1 vaza = −2). A pontuação pode ficar negativa. Pegue tokens de pontuação do estoque para mostrar seu total. O próximo dealer é o jogador seguinte no sentido horário; ele embaralha as 21 cartas, avança o cubo de rodada e distribui. Quem está à esquerda do novo dealer inicia.
- `exemplo-pontuacao` · Exemplo de pontuação (rodada 4): Alex, lance 3 e 3 vazas: +4. Lee, lance 2 e 0 vazas: −2. Taylor, lance 0 e 1 vaza: −1. Dev, lance 0 e 0 vazas: +4.
- `fim` · Fim de jogo: após 6 rodadas vence quem tiver mais pontos. Em caso de empate no topo, repete-se a última rodada até haver um vencedor.
- `dois-jogadores` · Jogo com 2 jogadores: funciona como o de 3 a 5, com um jogador fictício, o Mac. Ele recebe cartas em toda rodada e joga como um terceiro jogador; considere-o sentado à direita do primeiro dealer (segundo a jogar na rodada 1). Abra as cartas dele em leque, com as costas visíveis. O Mac sempre joga a carta do topo da mão, exceto quando precisa seguir o naipe: aí joga a carta do topo do naipe pedido. Lances do Mac: R1 = 0, R2 = 1, R3 = 0, R4 = 2, R5 = 0, R6 = 3. Os jogadores se revezam como dealer (o Mac inicia nas rodadas 2 e 5). Todos pontuam pelas regras normais.
- `solitario` · Jogo solitário: usa dois jogadores fictícios, Mac (à sua esquerda) e Donald (à sua direita), com as cartas deles em leque, viradas para baixo, na sua frente. Eles jogam a carta do topo ou, quando precisam seguir o naipe, a do topo que siga o naipe. Quem inicia: Mac nas rodadas 1 e 4, Donald nas 2 e 5, você nas 3 e 6. Lances do Mac: 0, 1, 0, 2, 0, 3. Lances do Donald: 1, 0, 1, 0, 2, 0. Objetivo: vencer os dois e fazer a maior pontuação possível. Consegue chegar a 21 pontos?
- `creditos` · Créditos: Farm Hand, design de Craig Somerton, arte de Samuel Bouvant, © 2025 Grail Games. Este app é um utilitário não oficial.

### 7.7 Ajustes (`/ajustes/`)

- Toggle “Vibração ao tocar” (padrão ligado; oculto se `navigator.vibrate` não existir).
- Toggle “Manter a tela ligada” (padrão ligado; usa a Wake Lock API em `/jogo/`, `/rodada/` e `/cartas/`, pede de novo no evento `visibilitychange`; oculto se a API não existir).
- Botão “Apagar todos os dados” com `ConfirmDialog` “Apagar partida, marcações e ajustes?”; executa `clearAllData` e vai ao menu.
- Bloco “Sobre”: “Farm Hand Tracker v1.0 · Utilitário não oficial, de uso pessoal, sem vínculo com a Grail Games. Farm Hand: design de Craig Somerton, arte de Samuel Bouvant, © 2025 Grail Games.”

### 7.8 Fim de jogo (`/fim/`)

- Título “Fim de jogo”. `RankingList` com destaque para o(s) primeiro(s) colocado(s): “Vencedor: Nome” ou “Empate: Nome e Nome”.
- Empate na 1ª posição: botão “Rejogar rodada 6 (desempate)” que executa `startTiebreak` e leva a `/rodada/`.
- Solo: linhas “Você venceu o Mac e o Donald: Sim/Não” (total do humano maior que o dos dois) e “Meta de 21 pontos: Atingida/Não atingida”.
- Botões: “Voltar ao contador” (`/jogo/`), “Nova partida” (`/jogo/novo/`) e “Voltar ao menu” (`/`).

## 8. Design system e assets

| Item                             | Valor                                                                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cores base                       | `--bg #FFE4D2`, `--surface #FFF4EA`, `--teal #25756D`, `--teal-dark #1B5852`, `--orange #F26D3D`, `--ink #2B2B2B`, `--muted #7A6A60`, `--positive #2E7D32`, `--negative #C0392B` |
| Cores dos jogadores (por índice) | `#5C5CAA`, `#3AA6A6`, `#8BB63F`, `#B5316E`, `#D98A1F`; Mac `#6B7280`; Donald `#8D6E63`                                                                                           |
| Cores dos naipes                 | menta `#6FC7B0`, laranja `#F28A4B`, azul `#5B8BD0`, amarelo `#F2B632`, lima `#8CC63F`, rosa `#E5588F`; texto sobre elas `#1F1F1F`                                                |
| Tipografia                       | Chango para títulos (h1 28 px, h2 20 px); Josefin Sans no corpo (16 px); quantidade dos tokens 32 px, negrito, `tabular-nums`                                                    |
| Forma                            | Cartões com raio 16 px; botões − e + circulares de 56 px (+ preenchido `--teal` com texto branco; − só com contorno `--teal`)                                                    |
| Movimento                        | Transições de 150 ms; nada além disso; respeitar `prefers-reduced-motion`                                                                                                        |
| Layout                           | `viewport` com `viewport-fit=cover`; `BottomNav` usa `env(safe-area-inset-bottom)`                                                                                               |

**Imagens dos tokens (fornecidas pelo usuário):** três PNGs com fundo transparente, 512×512, recortados do quadro “48 scoring tokens” da página 3 do manual, salvos nos caminhos da seção 2.1. As artes pertencem à Grail Games: uso pessoal, sem publicar o repositório com elas.

**Fallback obrigatório:** `TokenImage` tenta carregar o PNG; em `onError` renderiza um SVG inline (círculo com o valor “5”, “1” ou “−1” em branco; fundo saco `#C8A57A`, espiga `#E2A92B`, rato `#8A8A8A`). Assim o app funciona sem os PNGs.

## 9. Acessibilidade, PWA e desempenho

**Acessibilidade**

- `lang=pt-BR`; contraste AA; foco visível; navegação por teclado.
- `aria-label` dos botões: “Diminuir saco de 5 pontos de {nome}”, “Aumentar espiga de 1 ponto de {nome}”, “Aumentar rato de menos 1 ponto de {nome}” (e equivalentes para diminuir). `alt` das imagens: “Saco de 5 pontos”, “Espiga de 1 ponto”, “Rato de menos 1 ponto”.
- Quantidade e total com `aria-live=polite`.
- Diálogos com `role=dialog`, foco preso e fechamento por Esc.

**PWA**

- `manifest.webmanifest`: `name` “Farm Hand Tracker”, `short_name` “FH Tracker”, `start_url` `/`, `display` `standalone`, `theme_color` `#25756D`, `background_color` `#FFE4D2`, `lang` `pt-BR`, ícones 192, 512 e maskable 512.
- `scripts/generate-icons.mjs` (devDependency `sharp`) gera os PNGs a partir de `public/icons/icon.svg` (círculo `--teal` com “FH” branco).
- `sw.js` com `CACHE_VERSION = 'v1'`: instala pré-cacheando as rotas (`/`, `/jogo/`, `/jogo/novo/`, `/rodada/`, `/cartas/`, `/regras/`, `/ajustes/`, `/fim/`), o manifesto, os ícones e os tokens; navegações usam rede primeiro com fallback ao cache; arquivos em `/_next/static/` e `/assets/` usam cache primeiro; na ativação apaga caches de versões antigas. Registrar o service worker somente em produção.

**Desempenho e compatibilidade:** Lighthouse mobile com Performance ≥ 90, Acessibilidade ≥ 95, Boas práticas ≥ 95 e SEO ≥ 90. Suporte: Safari iOS 16+, Chrome Android atual, Chrome, Edge e Firefox desktop atuais.

## 10. Testes

### 10.1 Unitários (Vitest, cobertura ≥ 90% em `src/domain`)

| Alvo                                                   | Entrada                                              | Esperado                                                         |
| ------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------- |
| `totalPoints`                                          | saco 2, espiga 3, rato 4                             | 9                                                                |
| `totalPoints`                                          | saco 0, espiga 0, rato 3                             | −3                                                               |
| `scoreRound` (exemplo oficial, rodada 4)               | (3,3), (2,0), (0,1), (0,0)                           | +4, −2, −1, +4                                                   |
| `scoreRound`                                           | rodada 6, (1,3) e (3,1)                              | −2 e −2                                                          |
| `pointsToTokens`                                       | 6, 4, −3, 0, 11                                      | {1,1,0}, {0,4,0}, {0,0,3}, {0,0,0}, {2,1,0} (saco, espiga, rato) |
| `cardsPerPlayer`                                       | (R5,n3), (R6,n3), (R5,n4), (R6,n4), (R5,n5), (R6,n5) | 5, 6, 5, 5, 4, 4                                                 |
| `unusedCards`                                          | (R1,n5), (R6,n3), (R6,n4), (R5,n5)                   | 16, 3, 1, 1                                                      |
| `dummyBid`                                             | Mac R1 a R6; Donald R1 a R6                          | 0,1,0,2,0,3; 1,0,1,0,2,0                                         |
| `dealerId` e `leaderId`, 2 humanos + Mac               | rodadas 1 a 6                                        | dealers J1,J2,Mac,J1,J2,Mac; líderes J2,Mac,J1,J2,Mac,J1         |
| `dealerId` e `leaderId`, 4 humanos, primeiro dealer P1 | rodadas 1 a 6                                        | dealers P1,P2,P3,P4,P1,P2; líderes P2,P3,P4,P1,P2,P3             |
| Solo                                                   | rodadas 1 a 6                                        | líderes Mac,Donald,Você,Mac,Donald,Você; `dealerId` = null       |
| `rankPlayers`                                          | totais 10, 10, 7                                     | posições 1, 1, 3                                                 |
| `setTokens`                                            | espiga 0 com −1; espiga 99 com +1                    | ignorado; ignorado                                               |
| `applyRound` (3 humanos, R1)                           | J1 lance 1 e vazas 1; J2 e J3 lance 0 e vazas 0      | cada um com espiga 1; `currentRound` = 2                         |
| `applyRound`                                           | soma das vazas maior que as cartas                   | estado inalterado                                                |
| `applyRound` na rodada 6                               | qualquer válido                                      | `finished` = true                                                |
| `undoLastRound`                                        | logo após `applyRound`                               | tokens, rodada e `draft` restaurados                             |
| `startTiebreak`                                        | jogo finalizado com empate                           | `currentRound` = 6, `tiebreakCount` = 1, `finished` = false      |

### 10.2 E2E (Playwright)

| ID  | Cenário                                                                      | Resultado esperado                                                                               |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| E1  | Abrir `/` e clicar em Contador de Tokens sem partida                         | 6 cartões no menu; navega para `/jogo/novo/`                                                     |
| E2  | Stepper de jogadores                                                         | Em 2, − desabilitado; em 5, + desabilitado; 2 jogadores geram 3 cartões (J1, J2, Mac); 5 geram 5 |
| E3  | Nomes duplicados                                                             | Erro “Os nomes precisam ser diferentes.” e iniciar desabilitado                                  |
| E4  | Jogador 0: espiga + 3 vezes, saco + 1 vez, rato + 1 vez                      | Total 7; − em contador zerado desabilitado                                                       |
| E5  | Recarregar `/jogo/`                                                          | Contadores mantidos                                                                              |
| E6  | Menu → Regras, buscar “anulam”                                               | Seção `fase-vazas` visível; BottomNav volta ao menu                                              |
| E7  | Guia de Cartas: marcar azul 3                                                | “Restam” do 3 mostra 2; “Vistas: 1 de 21”; Limpar zera                                           |
| E8  | 3 humanos, R1: J1 lance 1 e vazas 1; J2 e J3 lance 0 e vazas 0; aplicar      | Cada um com total 1; “Rodada 2 de 6”                                                             |
| E9  | R1 com J1 vazas 1 e J2 vazas 1                                               | Aplicar desabilitado e mensagem de soma                                                          |
| E10 | Aplicar R1 e desfazer                                                        | Totais voltam a 0; “Rodada 1 de 6”                                                               |
| E11 | Modo solo                                                                    | Cartões Você, Mac, Donald; Mac começa; lance do Donald travado em 1 na R1                        |
| E12 | 3 humanos; 6 rodadas com todos lance 0 e vazas 0                             | Empate triplo com 21 pontos; botão de desempate visível                                          |
| E13 | Build de produção, carregar, `context.setOffline(true)`, recarregar `/jogo/` | A página abre normalmente                                                                        |

Rodar E1 a E12 em 390×844 e 1280×800; E13 só em 390×844 contra `npm run build` servido da pasta `out`.

## 11. Plano de implementação (ordem obrigatória)

| Fase | Entrega                                                                                          | Critério de aceite                                            |
| ---- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| F0   | Projeto Next.js com TypeScript estrito, Tailwind, ESLint, Prettier, Vitest, Playwright e scripts | `lint`, `typecheck`, `test` e `build` passam no projeto vazio |
| F1   | `src/domain` completo                                                                            | Todos os casos da seção 10.1 passam; cobertura ≥ 90%          |
| F2   | Store, persistência e hidratação                                                                 | Testes de store passam; recarregar mantém o estado            |
| F3   | AppShell, Menu, Nova Partida e Contador (MVP)                                                    | E1 a E5 passam                                                |
| F4   | Regras e Guia de Cartas                                                                          | E6 e E7 passam                                                |
| F5   | Painel da Rodada e Fim de jogo (incluindo solo e desempate)                                      | E8 a E12 passam                                               |
| F6   | Ajustes, PWA, wake lock, vibração e ícones                                                       | E13 passa; Lighthouse conforme seção 9                        |
| F7   | Acabamento, `README.md`, `DECISIONS.md`, revisão de acessibilidade                               | Definição de pronto cumprida                                  |

## 12. Fora de escopo (não implementar)

Backend, login, sincronização entre dispositivos ou multiplayer em tempo real, histórico entre partidas, estatísticas, sons, animações complexas, modo escuro, outros idiomas, simulação de cartas e jogadas, simulação dos tokens de madeira e das cartas de lance, qualquer reprodução do PDF do manual, anúncios, analytics e configuração de limites de tokens.

## 13. Definição de pronto

- [ ] Todas as telas da seção 7 implementadas com os `data-testid` descritos.
- [ ] `npm run lint`, `typecheck`, `test`, `test:e2e` e `build` passam sem erros.
- [ ] Cobertura de `src/domain` ≥ 90%.
- [ ] Lighthouse mobile conforme a seção 9.
- [ ] App funciona com os PNGs e sem eles (fallback SVG).
- [ ] Offline validado (E13).
- [ ] `README.md` e `DECISIONS.md` entregues.
- [ ] Nenhuma dependência fora da seção 4 e nenhuma funcionalidade da seção 12.
