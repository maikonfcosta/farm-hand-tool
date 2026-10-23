# Decisões

## 2026-10-23 (GMT-3)

- A especificação fornecida é o plano aprovado; execução segue F0–F7, sem nova rodada de aprovação.
- Pasta organizada em `src`, `tests`, `scripts`, `public` e `docs`. Especificação preservada em `docs/specs/webapp.md`; manual local em `docs/reference/farm-hand-rules-en.pdf`.
- GitHub público: manual e PNGs excluídos do Git e do deploy pela restrição explícita da seção 8. Fallback SVG integra a versão publicada; imagens locais continuam funcionando.
- MCP da Vercel ausente nesta sessão. Verificar CLI autenticada como alternativa para o deploy autorizado.
- Não havia `qa-ci-local` disponível para este projeto. Criado script local que executa os checks exigidos, sem copiar integrações de outros projetos.
- Pré-cache inclui manifesto gerado de todos os chunks, estilos e fontes do export. Apenas HTML das rotas não garante abertura offline após navegação.
