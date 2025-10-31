# Install script for gh-commit-stats (PowerShell)
# Usage: irm https://raw.githubusercontent.com/JohanBellander/CommitGraph/master/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/JohanBellander/CommitGraph.git"
$Branch = if ($env:COMMITGRAPH_BRANCH) { $env:COMMITGRAPH_BRANCH } else { "master" }
$InstallDir = if ($env:COMMITGRAPH_INSTALL_DIR) { $env:COMMITGRAPH_INSTALL_DIR } else { "$HOME\.gh-commit-stats" }

Write-Host "🚀 Installing gh-commit-stats..." -ForegroundColor Cyan

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    Write-Host "   Visit: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check Node.js version
$nodeMajorVersion = (node --version).Substring(1).Split('.')[0]
if ([int]$nodeMajorVersion -lt 16) {
    Write-Host "❌ Node.js version 16+ is required. Current version: $nodeVersion" -ForegroundColor Red
    exit 1
}

# Clone or update repository
if (Test-Path $InstallDir) {
    Write-Host "📦 Updating existing installation..." -ForegroundColor Cyan
    Set-Location $InstallDir
    try {
        git fetch origin *>$null
    } catch {}
    $currentBranch = (git rev-parse --abbrev-ref HEAD 2>$null)
    if ($currentBranch -ne $Branch) {
        try {
            git checkout $Branch *>$null
        } catch {
            try {
                git checkout master *>$null
            } catch {}
        }
    }
    try {
        git pull origin $Branch *>$null
    } catch {
        try {
            git pull origin master *>$null
        } catch {}
    }
} else {
    Write-Host "📦 Cloning repository..." -ForegroundColor Cyan
    git clone -b $Branch $RepoUrl $InstallDir
    Set-Location $InstallDir
}

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Cyan
npm install

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

# Create global command using npm link
Write-Host "🔗 Setting up global command..." -ForegroundColor Cyan
npm link

# Also create a .cmd wrapper for better Windows compatibility
$BinPath = "$InstallDir\dist\cli.js"
$LocalBin = "$env:USERPROFILE\AppData\Local\Microsoft\WindowsApps"
if (Test-Path $LocalBin) {
    $CmdWrapper = "$LocalBin\ghstats.cmd"
    @"
@echo off
node "$BinPath" %*
"@ | Out-File -FilePath $CmdWrapper -Encoding ASCII
    Write-Host "✓ Created wrapper at $CmdWrapper" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Set your GitHub token:" -ForegroundColor Yellow
Write-Host "      `$env:GITHUB_TOKEN = 'your-token-here'"
Write-Host ""
Write-Host "   2. Run the tool:" -ForegroundColor Yellow
Write-Host "      ghstats --help"
Write-Host ""
Write-Host "   If 'ghstats' is not recognized, restart your PowerShell session." -ForegroundColor Yellow
Write-Host "   Or run directly: node $BinPath --help" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 For more info, visit: https://github.com/JohanBellander/CommitGraph" -ForegroundColor Cyan
