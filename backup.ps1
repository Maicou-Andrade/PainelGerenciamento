param(
    [string]$versao = "auto",
    [string]$descricao = "Backup automático"
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = "backups\backup_v$versao`_$timestamp"

Write-Host "Iniciando backup..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null

Write-Host "Copiando arquivos..." -ForegroundColor Green
Copy-Item -Path "src" -Destination "$backupFolder\" -Recurse -Force
Copy-Item -Path "package.json" -Destination "$backupFolder\" -Force
Copy-Item -Path "index.html" -Destination "$backupFolder\" -Force

if (Test-Path "vite.config.js") {
    Copy-Item -Path "vite.config.js" -Destination "$backupFolder\" -Force
}

$readme = @"
# Backup v$versao - $timestamp

## Descrição
$descricao

## Arquivos
- src/ - Código fonte
- package.json - Dependências
- index.html - HTML base

## Restaurar
1. Copie os arquivos para a raiz
2. npm install
3. npm run dev
"@

$readme | Out-File -FilePath "$backupFolder\README.md" -Encoding UTF8

Write-Host "Backup concluído: $backupFolder" -ForegroundColor Green