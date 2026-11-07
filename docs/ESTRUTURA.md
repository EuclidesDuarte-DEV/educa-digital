# Registro de organização — V111.41

**Origem:** pacote completo `EDUCA_DIGITAL_V111_40_PAINEL_LATERAL_ACESSIBILIDADE_COMPLETO.zip`.

**Tipo:** manutenção estrutural; o conteúdo de `public`, `src`, `banco`, `data`, `lia_motor`, `deploy` e `testes_lia_educa` não foi alterado. Quatro testes em `tests/` receberam apenas atualização dos caminhos dos arquivos movidos.

- Documentos e relatórios históricos da raiz movidos para `docs/historico/`: **75 arquivos**.
- Scripts antigos do Windows movidos para `scripts/windows/`: **8 arquivos**, com caminhos relativos ajustados quando necessário.
- Pasta `LIGAR_LIA_EDUCA/` foi mantida no lugar porque seus scripts usam caminhos relativos.
- Arquivos de mídia não foram excluídos nem recomprimidos: alguns são grandes, mas podem ser consumidos por atividades e pela LIA.
- `README.md` foi consolidado para remover referências contraditórias à versão atual; a documentação anterior foi preservada no histórico.
- `AGENTS.md` atualizado para refletir a ausência de quantidade fixa de atividades no escopo futuro.

## Scripts movidos

- `scripts/windows/CONFIGURAR_LIA_LOCAL_WINDOWS.ps1`
- `scripts/windows/DIAGNOSTICO_AVATAR_WINDOWS.ps1`
- `scripts/windows/INICIAR_LIA3D_KOKORO_WINDOWS.ps1`
- `scripts/windows/INICIAR_LIA_VOZ_HUMANA_WINDOWS.ps1`
- `scripts/windows/INICIAR_MOTOR_LIA_WINDOWS.ps1`
- `scripts/windows/INICIAR_V110_WINDOWS.cmd`
- `scripts/windows/PREPARAR_VOZ_FEMININA_LIA_WINDOWS.ps1`
- `scripts/windows/TESTAR_VOZ_LIA_WINDOWS.ps1`

## Cuidado ao atualizar o GitHub

O ZIP é uma cópia de trabalho independente: **nada foi apagado no GitHub**. Abra a pasta no VS Code, teste primeiro e só então sincronize em uma branch própria. Não copie arquivos `.env`, credenciais, bancos SQLite locais ou caches.

O conjunto de testes automatizados cobre a aplicação, mas não substitui a validação visual em Chrome, Android e iPhone, nem a execução do Kokoro com uma GPU/CPU real.

## Validação

`npm test`: **146 testes aprovados** no pacote reorganizado. Não houve publicação remota nem migração de banco.
