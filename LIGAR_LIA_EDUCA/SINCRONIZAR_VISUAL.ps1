$ErrorActionPreference='Stop'
$src=Join-Path $env:USERPROFILE 'Desktop\LIA_AI_INDEPENDENTE_V1_0\static'
$dest=Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'public\static'
if(-not (Test-Path $src)){throw 'LIA independente nao localizada no Desktop.'}
$folder=Join-Path (Join-Path $PSScriptRoot '..') ('BACKUP_VISUAL_'+(Get-Date -Format 'yyyyMMdd_HHmmss'))
$files=@(
 'videos\lia-ouvindo.mp4','videos\lia-ouvindo-b.mp4','videos\lia-ouvindo-c.mp4',
 'videos\lia-conversando-a.mp4','videos\lia-conversando-b.mp4','videos\lia-conversando-c.mp4',
 'img\avatar-lia-v110.webp','img\lia-lovable-poster.jpg'
)
$changed=0
foreach($name in $files){
 $a=Join-Path $src $name;$b=Join-Path $dest $name
 if((Test-Path $a) -and (Test-Path $b)){
  $backup=Join-Path $folder $name
  New-Item -ItemType Directory -Path (Split-Path $backup) -Force|Out-Null
  Copy-Item $b $backup -Force
  Copy-Item $a $b -Force
  $changed++
 }
}
Write-Host "Copiados $changed arquivos visuais. Backup: $folder" -ForegroundColor Green
Write-Host 'Nao foram copiados arquivos privados, bancos, senhas, codigo da LIA pessoal ou modelos grandes.'
