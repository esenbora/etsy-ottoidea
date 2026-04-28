# Ottoidea Etsy Creator

AI-powered Etsy listing factory for printed-on-glass wall decor. Generate designs, compose mockups, scrape competitor tags, auto-upload to Etsy, and pin to Pinterest — all from one local app.

## Quick Install

### Windows

Open PowerShell, paste:

```powershell
iwr -useb https://raw.githubusercontent.com/esenbora/etsy-ottoidea/main/install.ps1 | iex
```

The script auto-installs Git, Node.js LTS, and Chrome (via winget or direct download), clones the repo to `~\etsy-ottoidea\`, runs `npm install` + `playwright install chromium`, prompts for your OpenRouter API key, and creates desktop shortcuts.

### macOS / Linux

Open Terminal, paste:

```bash
curl -fsSL https://raw.githubusercontent.com/esenbora/etsy-ottoidea/main/install.sh | bash
```

The script auto-installs prerequisites via Homebrew (macOS) or apt (Linux), clones the repo to `~/etsy-ottoidea/`, and prepares everything for first launch.

## Required API Key

You need an **OpenRouter API key** for image generation, SEO copy, and tag generation:

- Get one at: https://openrouter.ai/keys
- Free credits available on signup

`WIRO_API_KEY` is optional — it acts as an image-generation fallback only.

## Setup Checklist

After install, complete these steps in the in-app **Setup Wizard** (sidebar → Wizard):

1. **API Key** — paste your OpenRouter key
2. **Browser Path** — auto-detected, verify Chrome path
3. **Etsy Template ID** — pick an existing Etsy listing as your "template" (new listings copy its shipping, returns, etc.)
4. **Alura Extension** — install the Alura SEO Chrome extension into the CDP browser profile
5. **Etsy + Pinterest Login** — log in inside the **CDP browser** (separate from your normal Chrome)

The top status banner shows what's still missing and offers one-click actions for each.

## Daily Use

1. Double-click **"Ottoidea - Browser"** desktop shortcut → CDP browser launches (keep it open in the background)
2. Double-click **"Ottoidea - Server"** desktop shortcut → server starts on `http://localhost:3000`
3. Browser opens automatically. Upload a reference photo, describe the product, click **Generate**.

## Troubleshooting

### Browser shortcut opens then closes immediately
The `.bat` files now `pause` on errors — read the message in the window. Most common cause: `config.json`'s `operaPath` is missing or wrong. Edit it to your real Chrome path.

### "Alura tespit edilmedi" (Alura not detected)
The Alura Chrome extension lives in the CDP browser's separate profile (`data/browser-profile/`). Steps:
1. Sidebar → **Tarayici Bagla** to launch CDP browser
2. In the CDP browser, log in to etsy.com (signin redirect is the most common false-negative)
3. Wizard → Step 4 → **Tarayicida Ac** → CDP browser opens Chrome Web Store → click **Add to Chrome**
4. Wizard → Step 4 → **Otomatik Kontrol Et**

### "scripts disabled" on Windows PowerShell
PowerShell's execution policy is blocking `npm.ps1`. Run once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

### "winget tanimsiz" / winget not recognized
Either install **App Installer** from the Microsoft Store (search for it), or just install Git + Node.js manually from https://git-scm.com and https://nodejs.org — `install.ps1` falls back to direct downloads if winget is missing, but a clean reinstall after manual prereqs is the most reliable path.

### Server port 3000 is in use
Edit `.env`, change `PORT=3000` to `PORT=3001`, restart the server.

### Etsy / Pinterest cookies expired (re-login)
Etsy and Pinterest sessions expire after 30 days. When they do, the status banner will show "Etsy oturumu yok / Pinterest oturumu yok". Click **Tarayici Bagla**, log in again in the CDP browser, refresh the dashboard.

### `npm install` fails with EACCES or permission errors
Don't run `npm install` with `sudo`. On macOS/Linux, fix npm's global directory:

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
```

### "Etsy login yok (signin redirect)" during Alura auto-detect
The CDP browser hasn't been logged in to etsy.com. Open the CDP browser window, navigate to `etsy.com`, log in, then re-run the Alura check.

## Architecture (briefly)

- **`server.js`** — Express SSE pipeline (`/api/create`)
- **`lib/generate-design.js`** — image generation via OpenRouter / WIRO
- **`lib/compose-mockup.js`** — Sharp + remove.bg compositor
- **`lib/scrape-tags.js`** — Playwright + Alura extension over CDP
- **`lib/upload-etsy.js`** — Playwright Etsy listing creator over CDP
- **`lib/pin-to-pinterest.js`** — Playwright Pinterest pinner over CDP
- **`niches/glass-wall-decor.json`** — niche definition (style, audience, banned words, voice)
- **`config.json`** — local instance config (Chrome path, mockup position, brand)

## License

No license set yet — single-tenant local install for one operator.
