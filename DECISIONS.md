# Decisões

## 2026-10-23 (GMT-3)

- A especificação fornecida é o plano aprovado; execução segue F0–F7, sem nova rodada de aprovação.
- Pasta organizada em `src`, `tests`, `scripts`, `public` e `docs`. Especificação preservada em `docs/specs/webapp.md`; manual local em `docs/reference/farm-hand-rules-en.pdf`.
- GitHub público: manual e PNGs excluídos do Git e do deploy pela restrição explícita da seção 8. Fallback SVG integra a versão publicada; imagens locais continuam funcionando.
- MCP da Vercel ausente nesta sessão. Verificar CLI autenticada como alternativa para o deploy autorizado.
- Não havia `qa-ci-local` disponível para este projeto. Criado script local que executa os checks exigidos, sem copiar integrações de outros projetos.
- Pré-cache inclui manifesto gerado de todos os chunks, estilos e fontes do export. Apenas HTML das rotas não garante abertura offline após navegação.
- Vitest e Sharp não têm major fixada na especificação: usadas versões corrigidas 4.1.12 e 0.35.5. PostCSS corrigido com override 8.5.23. npm 11.5.2 falha ao resolver peers opcionais do Vitest; `.npmrc` usa `legacy-peer-deps` e lockfile preserva a árvore validada.
- Alvos de token mantêm 56 px. Nos cartões estreitos de tablets, os dois botões podem quebrar linha para evitar sobreposição; o grid de jogadores segue os breakpoints pedidos.
- URLs do Next podem chegar sem barra final na navegação cliente. O shell normaliza antes de determinar proteção, navegação e wake lock.
- Menu público renderiza os seis atalhos estáticos antes da hidratação. A primeira medição Lighthouse mostrou LCP de 3,8 s por esperar JavaScript para conteúdo que não depende da partida; as telas com dados locais mantêm o esqueleto.
