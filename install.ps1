# Ottoidea Etsy Creator - Windows kurulum
# Kullanim: iwr -useb https://raw.githubusercontent.com/esenbora/etsy-ottoidea/main/install.ps1 | iex
# Ozel hedef: $env:TARGET="C:\etsy-ottoidea"; iwr ... | iex

$ErrorActionPreference = "Stop"

# ExecutionPolicy: npm/.ps1 wrapper'lari icin RemoteSigned kalici, Bypass mevcut process
try { Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force } catch {}
try { Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force } catch {}

$REPO_URL = "https://github.com/esenbora/etsy-ottoidea.git"
$TARGET = if ($env:TARGET) { $env:TARGET } else { Join-Path $HOME "etsy-ottoidea" }

Write-Host "=== Ottoidea Etsy Creator Windows kurulum ===" -ForegroundColor Cyan
Write-Host "Hedef: $TARGET"

function Test-Command {
    param([string]$Cmd)
    $null -ne (Get-Command $Cmd -ErrorAction SilentlyContinue)
}

function Refresh-Path {
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path","User")
}

function Install-ViaWinget {
    param([string]$Id, [string]$Name)
    Write-Host ">> $Name kuruluyor (winget)..." -ForegroundColor Yellow
    & winget install --id $Id --exact --silent --accept-source-agreements --accept-package-agreements 2>&1 | Out-Host
    Refresh-Path
}

function Download-File {
    param([string]$Url, [string]$Out)
    $sec = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
    [Net.ServicePointManager]::SecurityProtocol = $sec
    Invoke-WebRequest -Uri $Url -OutFile $Out -UseBasicParsing
}

function Install-GitDirect {
    Write-Host ">> Git direkt indiriliyor (winget yok)..." -ForegroundColor Yellow
    $api = Invoke-RestMethod -Uri "https://api.github.com/repos/git-for-windows/git/releases/latest" -UseBasicParsing
    $asset = $api.assets | Where-Object { $_.name -match "Git-.*-64-bit\.exe$" } | Select-Object -First 1
    if (-not $asset) { throw "Git installer bulunamadi" }
    $tmp = Join-Path $env:TEMP $asset.name
    Download-File -Url $asset.browser_download_url -Out $tmp
    Write-Host "   Git installer indirildi, sessizce kuruluyor..."
    Start-Process -FilePath $tmp -ArgumentList "/VERYSILENT","/NORESTART","/NOCANCEL","/SP-","/CLOSEAPPLICATIONS","/RESTARTAPPLICATIONS" -Wait
    Refresh-Path
    if (-not (Test-Command "git")) {
        $gitBin = "$env:ProgramFiles\Git\cmd"
        if (Test-Path $gitBin) { $env:Path = "$gitBin;$env:Path" }
    }
}

function Install-NodeDirect {
    Write-Host ">> Node.js LTS direkt indiriliyor (winget yok)..." -ForegroundColor Yellow
    $idx = Invoke-RestMethod -Uri "https://nodejs.org/dist/index.json" -UseBasicParsing
    $lts = $idx | Where-Object { $_.lts } | Select-Object -First 1
    $ver = $lts.version
    $msi = "https://nodejs.org/dist/$ver/node-$ver-x64.msi"
    $tmp = Join-Path $env:TEMP "node-$ver.msi"
    Download-File -Url $msi -Out $tmp
    Write-Host "   Node $ver indirildi, sessizce kuruluyor..."
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i","`"$tmp`"","/quiet","/norestart","ADDLOCAL=ALL" -Wait
    Refresh-Path
    if (-not (Test-Command "node")) {
        $nodeBin = "$env:ProgramFiles\nodejs"
        if (Test-Path $nodeBin) { $env:Path = "$nodeBin;$env:Path" }
    }
}

function Install-ChromeDirect {
    Write-Host ">> Chrome direkt indiriliyor (winget yok)..." -ForegroundColor Yellow
    $url = "https://dl.google.com/chrome/install/standalonesetup64.exe"
    $tmp = Join-Path $env:TEMP "chrome_setup.exe"
    Download-File -Url $url -Out $tmp
    Write-Host "   Chrome installer indirildi, sessizce kuruluyor..."
    Start-Process -FilePath $tmp -ArgumentList "/silent","/install" -Wait
}

$hasWinget = Test-Command "winget"
if (-not $hasWinget) {
    Write-Host "   winget yok, direkt indirme moduna gecildi." -ForegroundColor Yellow
}

# 2. Git
if (-not (Test-Command "git")) {
    if ($hasWinget) {
        Install-ViaWinget -Id "Git.Git" -Name "Git"
        if (-not (Test-Command "git")) { Install-GitDirect }
    } else {
        Install-GitDirect
    }
    if (-not (Test-Command "git")) {
        Write-Host "Git kurulamadi. PowerShell'i kapatip tekrar ac, scripti yeniden calistir." -ForegroundColor Red
        exit 1
    }
}
Write-Host "   git: $(git --version)"

# 3. Node 20 LTS
$installNode = $false
if (-not (Test-Command "node")) {
    $installNode = $true
} else {
    $major = [int](((node -v) -replace '^v','') -split '\.')[0]
    if ($major -lt 18) { $installNode = $true }
}
if ($installNode) {
    if ($hasWinget) {
        Install-ViaWinget -Id "OpenJS.NodeJS.LTS" -Name "Node.js LTS"
        if (-not (Test-Command "node")) { Install-NodeDirect }
    } else {
        Install-NodeDirect
    }
    if (-not (Test-Command "node")) {
        Write-Host "Node kurulamadi. PowerShell'i kapatip tekrar ac." -ForegroundColor Red
        exit 1
    }
}
Write-Host "   node: $(node -v)"

# 4. Chrome
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)
$chromePath = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chromePath) {
    if ($hasWinget) {
        Install-ViaWinget -Id "Google.Chrome" -Name "Google Chrome"
        $chromePath = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
        if (-not $chromePath) { Install-ChromeDirect; $chromePath = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1 }
    } else {
        Install-ChromeDirect
        $chromePath = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
    }
}
if ($chromePath) {
    Write-Host "   chrome: $chromePath"
} else {
    Write-Host "   UYARI: Chrome path tespit edilemedi, config.json'a elle yaz." -ForegroundColor Yellow
}

# 5. Clone veya pull
if (Test-Path (Join-Path $TARGET ".git")) {
    Write-Host ">> Mevcut klasor, guncelleniyor..." -ForegroundColor Yellow
    Push-Location $TARGET
    git pull --ff-only origin main
    Pop-Location
} elseif (Test-Path $TARGET) {
    Write-Host "HATA: $TARGET var ama git deposu degil. Sil veya baska hedef: `$env:TARGET='C:\baska\yol'" -ForegroundColor Red
    exit 1
} else {
    Write-Host ">> Clone: $REPO_URL" -ForegroundColor Yellow
    git clone $REPO_URL $TARGET
}

Set-Location $TARGET

# 6. npm install
if (-not (Test-Path "node_modules")) {
    Write-Host ">> npm install..." -ForegroundColor Yellow
    npm install
}

# 7. Playwright chromium
$playwrightCache = Join-Path $env:LOCALAPPDATA "ms-playwright"
if (-not (Test-Path $playwrightCache)) {
    Write-Host ">> Playwright Chromium kuruluyor..." -ForegroundColor Yellow
    npx -y playwright install chromium
}

# 8. config.json
if (-not (Test-Path "config.json")) {
    if ($chromePath) {
        $chromeJsonPath = $chromePath -replace '\\','/'
        $config = @{
            mockup = @{ x = 60; y = 60; width = 680; height = 880 }
            keepPhotoIndexes = @()
            keepPhotoCount = 6
            operaPath = $chromeJsonPath
            cdpPort = 9333
            niche = "glass-wall-decor"
            activeProductType = "glass"
            brand = @{ name = "Ottoidea Etsy Creator"; primary = "#0ea5e9"; accent = "#8b5cf6"; logoUrl = "" }
        }
        $config | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 "config.json"
        Write-Host "   config.json yazildi"
    } else {
        Copy-Item "config.example.json" "config.json"
        Write-Host "   config.json: Chrome path'ini 'operaPath' alanina ELLE yaz" -ForegroundColor Yellow
    }
}

# 9. .env - interaktif key doldurma
$envPath = Join-Path $TARGET ".env"
$envHasPlaceholder = $false
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "your_" -or $envContent -match "^\s*OPENROUTER_API_KEY\s*=\s*$") {
        $envHasPlaceholder = $true
    }
} else {
    Copy-Item ".env.example" $envPath
    $envHasPlaceholder = $true
}

if ($envHasPlaceholder) {
    Write-Host ""
    Write-Host "=== API Key girisi ===" -ForegroundColor Cyan
    Write-Host "Bos birakirsan .env'i sonradan elle doldurmalisin."
    Write-Host ""

    $openrouter = Read-Host "OPENROUTER_API_KEY (ZORUNLU - image+llm+vision hepsi)"
    $wiro = Read-Host "WIRO_API_KEY (opsiyonel image fallback, bos birak gecer)"

    $envLines = @()
    if ($openrouter) { $envLines += "OPENROUTER_API_KEY=$openrouter" } else { $envLines += "OPENROUTER_API_KEY=your_openrouter_api_key_here" }
    if ($wiro)       { $envLines += "WIRO_API_KEY=$wiro" }             else { $envLines += "WIRO_API_KEY=your_wiro_api_key_here" }
    $envLines += "PORT=3000"

    $envLines -join "`r`n" | Set-Content -Encoding UTF8 $envPath
    Write-Host "   .env yazildi" -ForegroundColor Green

    if (-not $openrouter -and -not $wiro) {
        Write-Host "   UYARI: Hicbir API key girilmedi. Server calisir ama tasarim/tag uretimi patlar." -ForegroundColor Yellow
        Write-Host "   Sonra notepad ile ac: $envPath" -ForegroundColor Yellow
    } elseif (-not $openrouter) {
        Write-Host "   UYARI: OPENROUTER_API_KEY yok. Vision (mockup analiz) ve LLM (tag/title) calismaz." -ForegroundColor Yellow
    }
}

# 10. Kisayol bat dosyalari
@"
@echo off
cd /d "%~dp0"
title Ottoidea - Browser
echo === Browser baslatiliyor (CDP modunda) ===
echo.
call npm run browser
echo.
echo --- Cikti yukarida ---
echo Hata varsa screenshot al, destege gonder.
pause
"@ | Set-Content -Encoding ASCII "start-browser.bat"

@"
@echo off
cd /d "%~dp0"
title Ottoidea - Server
echo === Server baslatiliyor ===
echo Tarayici: http://localhost:3000
echo.
call npm start
echo.
echo --- Server kapandi ---
pause
"@ | Set-Content -Encoding ASCII "start.bat"

# 11. Desktop shortcut (opsiyonel)
try {
    $desktop = [Environment]::GetFolderPath("Desktop")
    $wsh = New-Object -ComObject WScript.Shell
    $lnk = $wsh.CreateShortcut((Join-Path $desktop "Glass Wall - Server.lnk"))
    $lnk.TargetPath = (Join-Path $TARGET "start.bat")
    $lnk.WorkingDirectory = $TARGET
    $lnk.Save()

    $lnk2 = $wsh.CreateShortcut((Join-Path $desktop "Glass Wall - Browser.lnk"))
    $lnk2.TargetPath = (Join-Path $TARGET "start-browser.bat")
    $lnk2.WorkingDirectory = $TARGET
    $lnk2.Save()
    Write-Host "   Masaustu kisayollari olusturuldu"
} catch {
    Write-Host "   (masaustu kisayol atlandi)"
}

Write-Host ""
Write-Host "=== KURULUM TAMAM ===" -ForegroundColor Green
Write-Host "Klasor: $TARGET"
Write-Host ""

# 12. Auto-launch prompt
$launch = Read-Host "Simdi baslatayim mi? (browser + server + tarayici) [E/h]"
if ($launch -eq "" -or $launch -match "^[eEyY]") {

    Write-Host ">> Browser aciliyor (CDP Chrome)..." -ForegroundColor Yellow
    Start-Process -FilePath (Join-Path $TARGET "start-browser.bat") -WorkingDirectory $TARGET

    Write-Host "   Acilan pencerede etsy.com + pinterest.com login ol." -ForegroundColor Cyan
    Write-Host "   (pencereyi KAPATMA, arka planda kalmali)"
    Write-Host ""
    Read-Host "Login bitince ENTER'a bas (server baslayacak)"

    Write-Host ">> Server baslatiliyor..." -ForegroundColor Yellow
    Start-Process -FilePath (Join-Path $TARGET "start.bat") -WorkingDirectory $TARGET

    Start-Sleep -Seconds 5
    Write-Host ">> Tarayici aciliyor..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"

    Write-Host ""
    Write-Host "HAZIR. http://localhost:3000" -ForegroundColor Green
    Write-Host "Sonraki aciliistra: masaustu kisayollari (Browser -> Server)."
} else {
    Write-Host ""
    Write-Host "MANUEL BASLATMA:"
    Write-Host "  1. Masaustu > 'Glass Wall - Browser' (etsy+pinterest login)"
    Write-Host "  2. Masaustu > 'Glass Wall - Server'"
    Write-Host "  3. http://localhost:3000"
}
