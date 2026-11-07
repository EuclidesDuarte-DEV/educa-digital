# Revisão audiovisual — Educa+ Digital V104.1

## Correção aplicada e verificada

- **Arquivo corrigido:** `public/static/videos/pix_seguranca.mp4`.
- Os quatro títulos de cena foram redimensionados para não invadir o celular virtual, inclusive o título do passo 2.
- Duração preservada (~26 segundos), enquadramento original 1920 × 1080.
- **Áudio original preservado sem modificações.** A correção é de vídeo, não de narração.
- URL da aula alterada para `?v=1041` para evitar o cache do arquivo antigo após a publicação.
- As demais atividades, vídeos e dados não foram alterados.

## Narração: pendência explícita

O sotaque de português europeu ainda **não foi atribuído de modo seguro a um arquivo específico**. Nenhuma faixa de voz foi modificada. Para corrigi-la adequadamente:

1. Escute os vídeos em busca do sotaque diferente e anote o arquivo e o trecho.
2. Regrave a locução em português brasileiro, com voz natural e ritmo moderado, mantendo o roteiro sincronizado à demonstração.
3. Substitua somente a faixa de áudio do MP4 depois de revisar a duração; mantenha imagens e instruções.
4. Teste em Android/iPhone e confira que nenhuma instrução perdeu sincronia.

## Auditoria visual

- Em `pix_seguranca.mp4`, o título do segundo passo extrapolava e era encoberto pelo mockup do telefone; o título foi redesenhado em área segura.
- Foi feito um exame visual dos demais vídeos locais por quadros de referência, mas isso **não garante** que todos os frames estejam livres de sobreposições.
- Três aulas utilizam arquivos remotos compartilhados; esses vídeos não estão dentro deste pacote e não foram editados.

## Teste antes de publicar

Execute `py -3 app.py`, abra a atividade Pix com segurança e assista ao vídeo até o final. A seguir, confira áudio e etapas na V104.1 e só então execute `npx.cmd wrangler deploy`.

**Não execute migrações SQL para esta atualização visual.**
