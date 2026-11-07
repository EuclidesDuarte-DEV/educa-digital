# Educa+ Digital V111.29 — diagnóstico Kokoro pf_dora

## O que mudou
- Espeak explicitamente usa build browser e versão 0.2.1, reduzindo falhas de importação de módulos Node.
- Mostra a etapa atual do carregamento e permite copiar diagnóstico (sem segredos).
- Modo `Kokoro pf_dora` não finge ser a voz oficial reproduzindo a voz Chrome se der erro. O usuário pode selecionar explicitamente a alternativa.
- Não instala serviços no notebook nem ativa Containers pagos.
- A voz ainda requer download de bibliotecas e modelo (origens esm.sh, jsdelivr e huggingface.co) no dispositivo; HTTPS, WebAssembly e suficiente memória.
- Sincronia dos clipes de vídeo continua aproximada (não MuseTalk).

## Teste recomendado
1. Abra a V111.29 no VS Code e execute `npm.cmd test`, depois `npx.cmd wrangler dev`.
2. Abra `http://localhost:8787/testar-voz-lia.html`.
3. Clique `Preparar modelo pf_dora` e `Gerar voz e ouvir`. Aguarde os downloads na primeira execução.
4. Se falhar, clique `Copiar diagnóstico` e forneça o texto do erro.
5. **Só após ouvir pf_dora no navegador**, execute `npm.cmd run deploy` e confira a mesma página no domínio da Cloudflare.

## Limitações não resolvidas
- Inferência Kokoro no navegador depende do dispositivo, da conectividade e de CDN externas. Não foi possível realizar teste neural completo neste ambiente sem acesso aos modelos remotos.
- Não há sincronização de fonemas exata aplicada aos clipes MP4 do avatar.
- Não habilitamos nenhum plano pago nem mudamos o banco D1.
