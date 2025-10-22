# Script de Restauração - Painel de Projetos
# Uso: .\restore.ps1 "nome_do_backup"

param(
    [Parameter(Mandatory=$false)]
    [string]$backupName
)

# Função para listar backups disponíveis
function Show-AvailableBackups {
    Write-Host "📚 Backups disponíveis:" -ForegroundColor Cyan
    $backups = Get-ChildItem -Path "backups" -Directory | Sort-Object Name
    
    if ($backups.Count -eq 0) {
        Write-Host "❌ Nenhum backup encontrado!" -ForegroundColor Red
        return $null
    }
    
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $backup = $backups[$i]
        Write-Host "  [$($i + 1)] $($backup.Name)" -ForegroundColor Yellow
        
        # Mostrar README se existir
        $readmePath = Join-Path $backup.FullName "README_BACKUP.md"
        if (Test-Path $readmePath) {
            $firstLine = Get-Content $readmePath | Select-Object -First 3 | Where-Object { $_ -match "##" } | Select-Object -First 1
            if ($firstLine) {
                Write-Host "      $firstLine" -ForegroundColor Gray
            }
        }
    }
    
    return $backups
}

# Se não foi especificado backup, mostrar lista
if (-not $backupName) {
    $backups = Show-AvailableBackups
    if (-not $backups) { exit 1 }
    
    Write-Host "`n🔢 Digite o número do backup para restaurar (ou 0 para cancelar): " -ForegroundColor Green -NoNewline
    $choice = Read-Host
    
    if ($choice -eq "0" -or $choice -eq "") {
        Write-Host "❌ Operação cancelada." -ForegroundColor Yellow
        exit 0
    }
    
    try {
        $index = [int]$choice - 1
        if ($index -lt 0 -or $index -ge $backups.Count) {
            throw "Índice inválido"
        }
        $backupName = $backups[$index].Name
    }
    catch {
        Write-Host "❌ Seleção inválida!" -ForegroundColor Red
        exit 1
    }
}

$backupPath = "backups\$backupName"

# Verificar se o backup existe
if (-not (Test-Path $backupPath)) {
    Write-Host "❌ Backup '$backupName' não encontrado!" -ForegroundColor Red
    Show-AvailableBackups | Out-Null
    exit 1
}

# Confirmação
Write-Host "⚠️  ATENÇÃO: Esta operação irá substituir os arquivos atuais!" -ForegroundColor Red
Write-Host "📁 Backup selecionado: $backupName" -ForegroundColor Yellow
Write-Host "🔄 Deseja continuar? (s/N): " -ForegroundColor Green -NoNewline
$confirm = Read-Host

if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Operação cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🔄 Iniciando restauração..." -ForegroundColor Cyan

# Fazer backup do estado atual antes de restaurar
$currentBackup = "backups\backup_antes_restore_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
Write-Host "💾 Fazendo backup do estado atual em: $currentBackup" -ForegroundColor Blue
New-Item -ItemType Directory -Path $currentBackup -Force | Out-Null
Copy-Item -Path "src" -Destination "$currentBackup\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "package.json" -Destination "$currentBackup\" -Force -ErrorAction SilentlyContinue

# Restaurar arquivos
Write-Host "📋 Restaurando arquivos..." -ForegroundColor Green

# Remover pasta src atual
if (Test-Path "src") {
    Remove-Item -Path "src" -Recurse -Force
}

# Copiar arquivos do backup
Copy-Item -Path "$backupPath\src" -Destination "." -Recurse -Force
Copy-Item -Path "$backupPath\package.json" -Destination "." -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backupPath\index.html" -Destination "." -Force -ErrorAction SilentlyContinue
Copy-Item -Path "$backupPath\vite.config.js" -Destination "." -Force -ErrorAction SilentlyContinue

Write-Host "✅ Restauração concluída com sucesso!" -ForegroundColor Green
Write-Host "💾 Backup do estado anterior salvo em: $currentBackup" -ForegroundColor Blue
Write-Host "🔧 Execute 'npm install' e 'npm run dev' para iniciar o projeto" -ForegroundColor Yellow

# Mostrar informações do backup restaurado
$readmePath = Join-Path $backupPath "README_BACKUP.md"
if (Test-Path $readmePath) {
    Write-Host "`n📖 Informações do backup restaurado:" -ForegroundColor Magenta
    Get-Content $readmePath | Select-Object -First 10 | ForEach-Object {
        if ($_ -match "^#" -or $_ -match "^##") {
            Write-Host $_ -ForegroundColor Cyan
        } elseif ($_ -match "✅|❌|⚠️") {
            Write-Host $_ -ForegroundColor Yellow
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
}