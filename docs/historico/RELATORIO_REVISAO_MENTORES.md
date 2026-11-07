# Revisão da mentoria — Educa+ Digital V104

## O que foi ajustado

1. **Cards das atividades:** unificação do título, espaçamento consistente, textos com quebra de linha, ícones uniformes e botões grandes. A lista mantém todos os conteúdos e atalhos funcionais.
2. **Visualização dos vídeos:** opção **Ampliar vídeo** com player nativo no iPhone/Safari e Fullscreen API nos demais navegadores compatíveis, preservando enquadramento em 16:9 e proporção completa (sem cortar laterais).
3. **Descrição dos vídeos:** removi do texto da interface a afirmação não verificada de que *todos* já têm narração brasileira. A narração dentro dos vídeos não foi modificada.

## O que ainda precisa de revisão editorial

- **Sotaque português:** identificar qual arquivo tem locução de Portugal e regravar/substituir a faixa por uma voz pt-BR (preferencialmente com revisão humana). Não é possível atestar o sotaque apenas pelos metadados e frames dos vídeos.
- **Texto sobreposto nos próprios MP4:** a maioria tem textos incorporados à imagem (não são legendas HTML). O botão de ampliar melhora a leitura, mas **não modifica nem conserta sobreposições gravadas**. Corrigir diretamente no projeto de edição ou recriar apenas os trechos afetados.
- **Vídeos externos:** algumas aulas referenciam arquivos de terceiros fora da pasta `public/static/videos`. Devem ser auditados também. Se os links forem temporários ou tiverem restrições, substituí-los por arquivos autorizados e estáveis.

## Inventário de vídeos locais a conferir

- [ ] `bank.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `code.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `fake-bank-call.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `family.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `gov-logout.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `gov-service.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `pix-key.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `pix_seguranca.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `play-developer.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `play-find.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `play-permissions.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `play-protect.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `settings-font.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `settings-volume.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `settings-wifi.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `wa-call.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `wa-list.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular
- [ ] `wa-message.mp4` — áudio pt-BR / texto sem sobreposição / tipografia legível no celular

## Validação executada

- Seis testes de JavaScript/Worker passando (`npm test`).
- Dois testes de banco local passando (`python -m unittest ...`).
- Comparação visual dos cards em larguras de 320, 390 e 430 px: não foi observada rolagem horizontal nem texto saindo dos botões.
- A interface inteira e a reprodução de mídia em aparelhos reais **ainda exigem testes manuais**.

## Publicação sem perder dados

Conferir localmente com `py -3 app.py`. Se aprovada, publicar com `npx.cmd wrangler deploy` a partir da pasta principal. **Não executar `schema.sql` ou migrações no banco D1 existente.**
