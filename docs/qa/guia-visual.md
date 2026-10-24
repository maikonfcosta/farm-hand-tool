# Guia visual de cartas e tokens

Implementação local em 2026-10-24 (GMT-3), branch `feat/illustrated-card-guide`.

## Escopo

- Nova rota pública `/guia/`, acessível por Cartas, Regras e Contador de Tokens.
- Frente e verso esquemáticos, com legenda numerada e ampliação em diálogo.
- Seis naipes com símbolos, cores e números obtidos do domínio existente.
- Carta de apoio: lance, vazas, igualdade, diferença absoluta, rodada e multiplicação.
- Tokens +5/+1/−1, soma ilustrada e orientação para evitar pontuação duplicada.
- Cartas de lance e rodada, com exemplos de posição dos marcadores.
- Inclusão no cache offline e conteúdo pesquisável nas regras.

## Referências e imagens

Conferência visual de `Cartas.pdf` fornecido pelo usuário, em especial a página 8,
e manual local `docs/reference/farm-hand-rules-en.pdf`, páginas 4–9 e 13.
Os nomes dos desenhos dos naipes são descritivos. Os símbolos identificam naipes,
sem poderes especiais. As ilustrações usam SVGs próprios e ícones Lucide locais;
nenhuma arte original ou PDF foi acrescentado ao repositório.

## Validação

- Lint e TypeScript: passaram.
- Vitest: 36 testes passaram; cobertura do domínio em 100%.
- Build estático: passou, incluindo `/guia/`.
- Suíte E2E completa: 39 passaram; 1 ignorado por configuração (offline desktop,
  cenário executado no projeto mobile).
- Testes novos verificam ampliação, fechamento por Escape/botão, restauração
  de foco, navegação por âncora, ausência de overflow horizontal em 390 px,
  preservação de cartas vistas e de pontuação.
- Teste offline ampliado verifica acesso ao guia ainda não visitado,
  abertura da ilustração e recarga sem rede.
- Inspeção visual em 390×844 e 1280×800; evidências locais:
  `guia-390.png` e `guia-1280.png` (ignoradas pelo Git).

O primeiro teste de ampliação revelou foco perdido ao remover o diálogo ainda
modal. Correção: fechar o diálogo antes de desmontá-lo e devolver o foco ao botão.
O teste confirmou a correção nos dois tamanhos.

Prévia local: `http://127.0.0.1:4173/guia/`.
README atualizado com a logo extraída da capa do manual e cinco capturas locais
em `docs/images/`, usando dados demonstrativos e tokens numéricos de fallback.
Logo incluída a pedido explícito do mantenedor; PDF e artes dos tokens continuam
fora do versionamento. Nenhum deploy de produção foi executado nesta tarefa.
