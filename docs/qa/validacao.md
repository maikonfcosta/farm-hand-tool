# Validação — 2026-10-23 (GMT-3)

Ambiente: Windows, Node.js 24.5.0, Chromium do Playwright, export estático de produção. Testes mobile em 390×844; desktop em 1280×800.

## Checks

- Lint e TypeScript: passaram.
- Vitest: 36 testes passaram; domínio com 100% em linhas, statements, branches e funções.
- Playwright: E1–E12 executados nos dois tamanhos; E13 somente mobile, conforme especificação. Casos extras cobrem fallback SVG, diálogos, ajustes, rotas protegidas, JSON corrompido e limpeza das marcações ao aplicar rodada.
- Resultado E2E final: 35 passaram, 1 omitido (E13 desktop, conforme especificação); zero falhas.
- Offline: contexto sem rede recarregou tokens e abriu regras, cartas e ajustes não visitados anteriormente. Confirmada persistência de pontos.
- `npm audit`: zero vulnerabilidades.
- Responsividade: contador e cartas sem transbordamento horizontal em 320, 390, 640, 768, 1024 e 1280 px. Capturas mobile/desktop inspecionadas.

## Lighthouse mobile

Medição no menu `/`, Lighthouse 13.5.0, throttling mobile padrão e preview HTTP com gzip:

| Categoria      | Resultado | Meta |
| -------------- | --------- | ---- |
| Performance    | 99        | ≥ 90 |
| Acessibilidade | 100       | ≥ 95 |
| Boas práticas  | 100       | ≥ 95 |
| SEO            | 100       | ≥ 90 |

A medição inicial do preview sem compressão ficou em 88. O menu passou a renderizar conteúdo estático antes da hidratação; o servidor local ganhou gzip para representar entrega comprimida de uma CDN. Nenhum throttling foi desativado. A medição é uma amostra local do menu; não representa todas as telas ou todos os dispositivos.

O launcher direto do Lighthouse falhou ao remover a pasta temporária no Windows. A execução programática usou o Chromium do Playwright e encerrou o navegador normalmente. O script aceita o caminho do módulo Lighthouse instalado como ferramenta temporária, fora das dependências do produto.

## Evidências locais

- `docs/qa/lighthouse-menu.json`: relatório bruto.
- `docs/qa/responsive.json`: verificação de transbordamento.
- `docs/qa/menu-{390,1280}.png` e `tokens-{390,1280}.png`: capturas.
- `coverage/`: cobertura Vitest.
- `playwright-report/`: relatório E2E.

Relatórios brutos e capturas ficam fora do Git. Os testes e este resumo são versionados.

## Produção

Deploy: https://farm-hand-tool.vercel.app, projeto `farm-hand-tool` na Vercel. Build remoto passou com `npm ci`, auditoria sem vulnerabilidades e export de todas as oito rotas.

Smoke HTTPS em 2026-10-23 19:44 (GMT-3): todas as rotas, manifesto, service worker e pré-cache responderam HTTP 200. Menu, contadores, persistência após reload, fallback SVG e navegação offline passaram no endereço publicado. Evidência local: `docs/qa/deploy-smoke.json`.

## Limites da validação em dispositivos

Safari iOS, Firefox e Edge não foram executados em dispositivos reais. Vibração e Wake Lock dependem das permissões e do hardware; não foi validada a resposta física de um celular. O teste de ajustes usa vibração simulada. Nenhum PNG ou PDF original é publicado; a versão pública usa fallback SVG.
