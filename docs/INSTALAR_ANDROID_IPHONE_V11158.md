# Educa+ Digital V111.58 — Android e iPhone

## Plataforma
- **Site web:** https://educa-digital.educamaisdigital.workers.dev/ — mantém página pública com apresentação e protótipo simulado.
- **Versão celular:** https://educa-digital.educamaisdigital.workers.dev/?app=1 — ocupa todo o viewport, sem a moldura do celular simulado.
- **Página de instalação:** https://educa-digital.educamaisdigital.workers.dev/instalar.html
- **Backend único:** Cloudflare Workers + AI (Gemma 4), modelo Kokoro de voz e banco D1 oficial. O APK não contém segredos e não acessa o banco diretamente.

## Android — arquivo APK de teste
O código-fonte da embalagem Android está em `android-app/`.
O GitHub Actions publica o APK instalável com Android WebView e permissão de câmera/microfone **somente após o usuário aprovar a solicitação do Android**, e apenas para a origem HTTPS da Cloudflare.

Baixe o APK em:
https://github.com/EuclidesDuarte-DEV/educa-digital/releases/download/v11158-android-prototype/EducaMaisDigital-Android-v11158.apk

O APK é um **protótipo assinado com chave de depuração**, para instalação manual e testes; não é uma publicação pela Play Store e novas compilações podem exigir desinstalação para atualizar.
Com internet, a interface carrega o app publicado na Cloudflare. Se a rede cair, a IA não poderá responder.

## iPhone — instalar agora sem App Store
1. No **Safari** do iPhone abra https://educa-digital.educamaisdigital.workers.dev/?app=1
2. Toque em **Compartilhar**.
3. Toque em **Adicionar à Tela de Início**.
4. Mantenha **Abrir como App da Web** ativado e toque em **Adicionar**.

O ícone Educa+ abrirá como aplicativo independente, sem barra de navegação do Safari e sem a moldura de telefone. Não existe arquivo `.ipa` assinado nesta entrega: a Apple exige assinatura e o programa de distribuição/TestFlight para um download nativo instalável. A PWA usa o mesmo backend e mantém as funcionalidades compatíveis com Safari.

## Limitações importantes
- A voz Kokoro é sintetizada no dispositivo; em alguns iPhones o carregamento do modelo pode demorar, e o reconhecimento de voz depende das permissões e compatibilidade do navegador.
- O aplicativo **não** executa ligações telefônicas reais nem transações Pix reais. As simulações são educativas.
- Assinatura de publicação Play Store / Apple App Store exigem contas, certificados e revisão próprios; não incluídos.
- APK de teste não substitui os testes em aparelhos Android reais, e a experiência de iPhone precisa ser validada no Safari instalado.
