# Educa+ Digital — V109 | Recursos reais do navegador no Modo Livre

## O que foi feito

A V109 preserva o pré-teste, seis módulos/22 atividades, a interface Android original, as conversas do WhatsApp original, os eventos inesperados, as ligações de treinamento, o Pix FICTÍCIO e a API de IA Cloudflare Workers AI da V108.

O modo livre ganhou uma tela funcional, com identidade visual original, ao tocar nos apps **Câmera, Fotos, Gmail, Agenda, Chrome, Telefone, Mensagens, Play Store, Maps e YouTube**. Fora do modo livre, as atividades guiadas não foram modificadas. Banco Educa, WhatsApp, GOV.BR e Ajustes continuam usando as telas educativas originais.

## Funcionamento real vs limitações — sem confundir com Android nativo

| Ícone | Implementação V109 | Limite |
|---|---|---|
| Câmera | `navigator.mediaDevices.getUserMedia()` com autorização, troca frontal/traseira e foto | Requer HTTPS ou localhost e permissão. Testar no aparelho real |
| Fotos | Importação de imagens, capturas da câmera, galeria IndexedDB local, download e exclusão | Não lê toda a galeria privada do sistema; somente imagens selecionadas ou capturadas |
| Gmail | Abrir Gmail oficial e preparar mensagem via `mailto:` | Leitura/envio dentro do protótipo exige Google OAuth 2.0 + APIs Gmail + consentimento/verificação |
| Agenda | Criar/excluir lembretes salvos no navegador, exportar `.ics`, abrir Google Agenda | Sincronizar com Google Calendar exige OAuth + autorização |
| Chrome | Digitar site ou pesquisa e abrir em aba do navegador real | É uma aba web, não o Chrome completo rodando dentro do celular simulado |
| Telefone | Preparar discagem `tel:` após confirmar número | Site não realiza/chama/atende chamadas reais sozinho; o usuário decide no discador |
| Mensagens | Preparar SMS `sms:` após confirmação, com texto | Não lê caixa de SMS e não envia SMS silenciosamente |
| Play Store | Abre Google Play oficial e página do WhatsApp oficial | Página web não pode instalar APKs/apps automaticamente |
| Maps | Buscar no Google Maps; opção de pedir localização por permissão | Não acessa histórico de localização ou conta privada |
| YouTube | Pesquisa e abre vídeos no YouTube oficial | Não acessa histórico ou conta privada |

**Segurança:** o Modo Livre de golpes continua 100% fictício. Nunca peça CPF, senhas, códigos ou dados bancários reais. Abrir qualquer recurso externo é decisão do usuário. Fotos são salvas apenas no IndexedDB do mesmo navegador (não na Cloudflare). Agenda de treino fica no `localStorage` do navegador. Não subir fotos ou contatos ao backend.

## Como iniciar em seu VS Code no Windows

Abra a pasta `EDUCA_DIGITAL_V109_RECURSOS_REAIS_WEB`.

```powershell
npm.cmd install
npm.cmd test
npx.cmd wrangler dev
```

Abra `http://127.0.0.1:8787` (ou a URL que o terminal indicar). **O D1 local precisa ter a estrutura das tabelas**; se aparecer `no such table: usuarios`, execute UMA VEZ, no mesmo diretório:

```powershell
npx.cmd wrangler d1 execute educa-digital --local --file=./banco/schema.sql
```

NÃO utilize `--remote` para criar tabelas. NÃO execute deploy antes de testar a IA real, o pré-teste e os recursos de câmera no seu telefone, com sua autorização.

O `env.AI` em `wrangler dev` pode acessar o serviço Workers AI remoto e consumir a franquia. Confirme as permissões e o uso no painel Cloudflare.

## Testes realizados

- `npm test` -> **21 aprovados, zero falhas**.
- Interface em Chromium por conteúdo injetado: navegação em tela de 1280 px e 390 px, abertura de Câmera, Agenda, Gmail e Chrome, lembretes locais; sem erros de JavaScript.
- A câmera real, link `tel:`, SMS, serviços externos e OAuth NÃO foram acionados no teste automatizado. Dependem do aparelho, permissões e credenciais.

## Se você quiser o Android realmente nativo

Uma aplicação web no Cloudflare **não consegue usar todas as APIs privadas do Android**. É necessário criar um aplicativo Android (Kotlin + Jetpack ou WebView/TWA com ponte nativa), configurando permissões específicas, tratamento do ciclo de vida, conta Google OAuth, Play Store via Intents oficiais e conformidade com as regras do Google Play. Nunca adicione permissões para ler SMS, ligações ou contatos sem necessidade explícita e consentimento. Prefira `ACTION_DIAL`, `ACTION_SENDTO` e contratos do Photo Picker em vez de permissões amplas.

**Hospedagem existente:** `https://educa-digital.educamaisdigital.workers.dev`
**GitHub:** `https://github.com/EuclidesDuarte-DEV/educa-digital`
**Situação:** V109 está apenas no ZIP para teste. Não foi publicada, nem enviada ao GitHub, nem alterou o banco remoto.
