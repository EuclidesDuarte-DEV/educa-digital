# Validação V110

- Testes automatizados Node: executar `npm test`; arquivos originais de teste foram preservados e novos testes de videochamada foram adicionados.
- Validação visual com Chromium headless: montagem com scripts e estilos incluídos na página, sem acesso à rede; cenários desktop (1280 px) e celular (390 px).
- Fluxo de navegador verificado por respostas de IA **simuladas somente para teste**: abrir videochamada, atender, enviar texto, receber resposta, verificar identidade, sair para a tela de resultado.
- Limitações: voz pt-BR real, microfone físico, câmera física, latência do Workers AI remoto e sistemas operacionais dos aparelhos não foram verificados nesse teste; testar em seu Windows/Android via Wrangler.
