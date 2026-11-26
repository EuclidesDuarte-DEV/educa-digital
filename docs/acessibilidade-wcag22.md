# Política de qualidade — acessibilidade Educa+ Digital

Objetivo: WCAG 2.2 nível AA como referência de conformidade e critérios adicionais de usabilidade para pessoas idosas. A auditoria automatizada é uma parte da avaliação, não certificação de conformidade.

## Antes de publicar
- Executar a ação "Acessibilidade WCAG 2.2 AA — público idoso" em cada PR.
- Revisar report.json e capturas de tela, inclusive itens axe incompletos (necessitam revisão humana).
- Não aprovar uma mudança enquanto houver falha de acessibilidade não tratada. Não reduzir as exigências de teste para obter aprovação.
- Configurar o check "WCAG e legibilidade (Chromium e WebKit)" como obrigatório na proteção da main e assegurar que o deploy Cloudflare não preceda essa aprovação. O workflow, por si só, não impede um merge nem um deploy externo.
- Preservar a separação de produção e preview. Os testes da interface usam respostas fictícias locais, não contas ou banco de produção.

## Critérios
| Tema | Referência WCAG 2.2 | Padrão Educa+ |
| --- | --- | --- |
| Contraste | 1.4.3 AA: 4,5:1 texto normal; 3:1 texto grande; 1.4.11 AA: 3:1 quando aplicável a elementos não textuais | Preferir contraste alto inclusive em instruções e controles |
| Área de toque | 2.5.8 AA: 24 × 24 CSS px ou exceções previstas | 44 × 44 CSS px no mínimo para controles principais; preferir 48 × 48 |
| Fonte | 1.4.4 AA: ampliação até 200% sem perda de conteúdo ou funcionalidade | Conteúdo principal >=18 CSS px; rótulos principais >=16 CSS px; fonte sem serifa e espaçamento confortável |
| Reflow | 1.4.10 AA: sem rolagem em duas direções a 320 CSS px para conteúdo vertical, salvo exceções | Sem texto cortado, sobreposição ou botões inacessíveis |
| Espaçamento | 1.4.12 AA: suportar espaçamento de texto customizado | Preferir entrelinhas de 1,5 em textos longos |
| Teclado | 2.1.1 A, 2.1.2 A, 2.4.7 AA e 2.4.11 AA | Tab/Shift+Tab, foco perceptível e não encoberto |
| Nome e instruções | 3.3.1 A, 3.3.2 A, 4.1.2 A | Rótulos claros, erros compreensíveis e instruções simples |

WCAG: https://www.w3.org/TR/WCAG22/

## Matriz automatizada
320×640, 390×844, 844×390, 768×1024, 1024×768, 1366×768, 1920×1080; Chromium e WebKit; landing, login, central, introdução e painel de acessibilidade. O teste de texto a 200% atua nos textos selecionados da introdução; não equivale a uma auditoria integral de zoom. Relatórios incluem violações axe, itens inconclusivos, geometria e capturas. Outros aplicativos simulados, autenticação por código, dispositivos nativos e navegação completa necessitam testes adicionais; não inferir cobertura total.

## Revisão humana obrigatória
- Zoom real do navegador a 200% e 400%, fontes do sistema, espaçamento de texto (1,5 linha, 2 parágrafos, 0,12 em letras e 0,16 em palavras) e rolagem sem perda de conteúdo.
- Navegar de ponta a ponta com teclado; testar foco, saída de tela cheia, ordem de leitura e ausência de armadilhas.
- NVDA/Windows, VoiceOver/iOS/macOS, TalkBack/Android: nomes, estados, avisos e mensagens de erro.
- Testar contraste em imagens, gradientes e estados que o axe não consegue determinar; não usar apenas cor para indicar erro ou acerto.
- Revisar telefone e código de login, Pix, WhatsApp, SMS, GOV.BR, Gmail, Fotos, chamadas e Lia; modo claro/alto contraste; teclado virtual, orientação e fonte ampliada.
- Testes reais com participantes idosos: ler instruções, encontrar botões, voltar, concluir treino e recuperar um erro sem ajuda. Registrar dificuldades e corrigir antes da publicação.

O check de CI é uma barreira de qualidade proposta, não comprovação automática de WCAG 2.2 AA. 
