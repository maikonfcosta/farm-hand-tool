# Plano e evidências por fase

Plano aprovado: [especificação](../specs/webapp.md), seção 11. Uma fase por card; concluir somente após checks, commit e push na main.

| Fase | Arquivos e responsabilidade                                               | Aceite                        | Estado                             |
| ---- | ------------------------------------------------------------------------- | ----------------------------- | ---------------------------------- |
| F0   | Configurações, scripts, fontes e organização dos documentos               | lint, typecheck, test e build | Publicado: 278fb00                 |
| F1   | src/domain: tokens, pontuação, cartas, dealer, ranking e transições puras | Casos 10.1 e cobertura ≥ 90%  | Publicado: bc691cf, cobertura 100% |
| F2   | src/store: Zustand persist; hidratação e ações                            | Unitários e reload E5         | Publicado: 2389a7b                 |
| F3   | Menu, nova partida, contador e componentes compartilhados                 | E1–E5 mobile/desktop          | Publicado: 643c8a6                 |
| F4   | Regras exatas, busca sem acentos e cartas vistas                          | E6–E7                         | Publicado: 70d7f79                 |
| F5   | Lances/vazas, histórico, resultado, solo e desempate                      | E8–E12                        | Publicado: 51d1041                 |
| F6   | Ajustes, PWA, fontes/chunks em cache e APIs do dispositivo                | E13 e Lighthouse mobile       | Publicado: 246ae10                 |
| F7   | README, decisões, acessibilidade e publicação                             | Suite completa e deploy       | Concluído: QA, README e produção   |

Revisão transversal: limite 99 e desfazer com saturação; dados inválidos; URLs com/sem barra final; falha de PNG; navegação para páginas não visitadas offline.

Auditoria de dependências: inicialmente 7 alertas. Vitest 4.1.12, Sharp 0.35.5 e override PostCSS 8.5.23 eliminam os alertas. `npm audit`: zero vulnerabilidades em 2026-10-23.
