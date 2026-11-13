# V111.70 — guia de protecao gratuita de chamadas no iOS Web/PWA

O Educa+ instalado gratuitamente pelo Safari recebe um botao **Proteção de chamadas** fora do telefone simulado. Ele mostra o texto educativo solicitado:

> Educa+ Digital — Atenção
>
> Número desconhecido. Tenha cuidado com possíveis tentativas de golpe. Nunca compartilhe senhas ou códigos.

**Essa mensagem nao e um aviso automatico em uma ligacao real.** O PWA nao tem acesso a chamadas celulares, seus numeros ou contatos e nao recebe evento de chamada recebida. A permissao para notificacoes Web Push nao oferece essas informacoes. O painel nao solicita essa permissao, nem inventa detecções.

## Protecao realmente automatica e gratuita do iPhone

A Apple permite configurar no **proprio iPhone** a Filtragem de Ligações:

1. Abra **Ajustes → Apps → Telefone**.
2. Procure **Filtrar Números Desconhecidos**.
3. Selecione **Perguntar Motivo da Ligação**.

Quando um numero nao salvo liga, **o iOS** pede o nome e o motivo antes de tocar (conforme suporte do aparelho/versao), apresentando a propria interface do sistema. Nao e a mensagem personalizada do Educa+ nem exige instalar um aplicativo.

Fonte oficial Apple: https://support.apple.com/pt-br/guide/iphone/iphe4b3f7823/ios

## Instalar gratuitamente e atualizar automaticamente

1. No **Safari** do iPhone, abra https://educa-digital.educamaisdigital.workers.dev/?app=1
2. Toque em **Compartilhar → Adicionar à Tela de Início**; se exibido, marque **Abrir como App da Web**.
3. Abra o Educa+ pela tela inicial, toque em **Proteção de chamadas** e siga as orientacoes do iOS.
4. Conteudo e interface web continuam atualizados pela Cloudflare quando uma versao e publicada; o PWA pode servir recursos em cache antes de atualizar.

## Limites

- Na versao nativa iOS assinada, a extensao Call Directory do Educa+ pode identificar numeros que o proprio usuario marcou antes, quando habilitada nos Ajustes. Nao classifica automaticamente todo numero nao salvo.
- No PWA gratis, **CallKit nao funciona** e nao e possivel tornar o aviso Educa+ automatico a cada chamada real.
- Nenhum codigo do Android, do canal Web padrao, do backend e do banco de dados foi editado.
