# Relatório técnico — V111.24 (base V111.23)

## Escopo verificado
- ZIP de entrada continha 214 entradas, aprox. 21 MB compactados.
- Preservados código web, módulos, atividades, banco, arquivos estáticos e
  os vídeos originais sem modificações de conteúdo.
- Mudanças restritas a `lia_educa_local.py`, `lia_motor/server.py`,
  `lia_motor/phoneme_visemes.py`, `public/static/js/free-video.js`,
  `public/html/index.html` (cache busting), testes e estes documentos.
- `src/worker.js`, `src/free-chat.js`, `data/modulos.json`, CSS,
  scripts de inicialização e banco **inalterados**.

## Validações realizadas em ambiente de execução
- **Node:** 94 testes aprovados / 94 executados; 0 falhas.
- **Motor FastAPI:** 28 testes aprovados / 28 executados; 0 falhas.
- **Sintaxe:** `py_compile` nos Python modificados e `node --check`
  no JavaScript de videochamada: aprovado.
- **Flask:** os testes `testes_lia_educa` não foram executados neste
  ambiente porque Flask não estava instalado e a instalação via pip não tinha
  rede. As rotas novas têm testes para rodar no Windows equipado.
- **Navegador real:** a política local bloqueou o acesso HTTP do navegador
  automatizado. Portanto NÃO houve validação visual em múltiplos dispositivos.
- **IA/voz/face real:** não validados nesta execução (requerem Ollama,
  Kokoro, microfone, dispositivo e, para sincronia exata, MuseTalk GPU).

## Checklist manual — executar no seu notebook
1. Tela inicial → pré-teste obrigatório → cadastro/login → Android simulado.
2. Verificar os 6 módulos, 22 atividades, navegação, vídeos, acessibilidade.
3. Modo Livre: mensagem WhatsApp, responder e bloquear/verificar.
4. Confirmar que a **videochamada vem em segundo** e ligação em terceiro.
5. Chamada: atender; conferir introdução e usar teclado; verificar se a
   resposta depende da pergunta atual e do histórico, sempre em português.
6. Ativar microfone (permitir), falar frase longa com pausa e conferir se é
   transcrita uma vez; interromper a LIA durante a resposta.
7. Ouvir Kokoro `pf_dora`, confirmar voz feminina, pausas e ausência de voz
   masculina; em falha, verificar aviso e seleção de voz do navegador.
8. Alternar fala e repouso, silenciar e reativar, desligar chamada, e confirmar
   que vídeos/áudio não continuam quando chamada é encerrada.
9. Verificar em Windows Chrome, Android Chrome e iPhone Safari; contemplar
   telas de 390 px, 768 px e 1366 px. Verificar permissão de áudio iOS.
10. Se a opção MuseTalk estiver ativada, testar geração REAL de MP4 por frase
    e medir atraso áudio↔boca. Sem MuseTalk, os vídeos são ilustrativos.

**Pendente:** medição ponta a ponta de STT → Ollama → TTS → audiovisual,
correção fonema-tempo por alinhador real, e publicação futura segura.
