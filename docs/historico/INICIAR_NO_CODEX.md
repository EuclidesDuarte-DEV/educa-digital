# Abrir o Educa+ Digital no Codex (VS Code / Windows)

1. Extraia este ZIP em uma pasta permanente (exemplo: `Documentos\educa-digital-v1046`).
2. VS Code > Arquivo > Abrir pasta... > selecione `EDUCA_DIGITAL_V104_6_PREPARADO_PARA_CODEX` (a pasta contendo `app.py` e `AGENTS.md`).
3. Abra o painel **Codex** e entre com sua conta do ChatGPT.
4. Cole a mensagem abaixo no Codex:

> Leia completamente AGENTS.md e CONTEXTO_PROJETO_CODEX.md. Identifique a estrutura do Educa+ Digital e a diferença entre V104.6 local, GitHub main (README V102) e Cloudflare em produção. Antes de alterar arquivos, apresente um diagnóstico, execute os testes sem mudanças destrutivas, identifique o player `pix-key` com voz Archie brasileira e proponha os próximos passos. Não publique, não altere o banco D1, não substitua mídia e não crie vozes alternativas sem minha autorização.

5. Comandos PowerShell opcionais:
```powershell
py -3 -m pip install -r requirements.txt
py -3 app.py
# Acesse http://127.0.0.1:5000
npm.cmd install
npm.cmd test
py -3 -m unittest discover -s tests -p "test_*.py" -v
```
6. O repositório GitHub `main` está em versão distinta. NÃO execute `git pull` indiscriminadamente na pasta V104.6 sem analisar o diff. Se desejar versionar, peça ao Codex uma estratégia de branch/backup segura.
