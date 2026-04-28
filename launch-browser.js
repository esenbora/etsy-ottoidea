const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const port = config.cdpPort || 9333;
const browserPath = config.operaPath;
if (!browserPath) {
  console.error('ERROR: config.json icinde "operaPath" tanimli degil. Chrome/Opera path ekle.');
  process.exit(1);
}
// Always use separate profile so CDP works even when user has normal Chrome open.
// Override via config.userDataDir if needed.
const userDataDir = config.userDataDir || path.join(__dirname, 'data', 'browser-profile');

async function isCdpRunning() {
  try {
    const res = await fetch(`http://localhost:${port}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

function killExistingOpera() {
  return new Promise((resolve) => {
    exec('powershell -Command "Get-Process opera -ErrorAction SilentlyContinue | Stop-Process -Force"', () => {
      setTimeout(resolve, 3500);
    });
  });
}

async function main() {
  console.log('=== Ottoidea Browser Launcher ===');
  console.log(`Browser path: ${browserPath}`);
  console.log(`CDP port:     ${port}`);
  console.log(`Profile dir:  ${userDataDir}`);
  console.log('');

  if (!fs.existsSync(browserPath)) {
    console.error(`ERROR: Browser bulunamadi: ${browserPath}`);
    console.error('config.json icindeki "operaPath" alanini kontrol et.');
    process.exit(1);
  }

  if (await isCdpRunning()) {
    console.log(`Browser zaten CDP port ${port} uzerinde calisiyor. URL: http://localhost:${port}`);
    return;
  }

  fs.mkdirSync(userDataDir, { recursive: true });

  console.log(`Launching browser (CDP ${port}, ayri profil)...`);
  const child = exec(`"${browserPath}" --remote-debugging-port=${port} --user-data-dir="${userDataDir}" --no-first-run --no-default-browser-check`, { windowsHide: false });
  child.on('error', (err) => console.error('Spawn error:', err.message));
  child.unref();

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (await isCdpRunning()) {
      console.log(`OK - Browser hazir, CDP port ${port}.`);
      console.log(`Test: http://localhost:${port}/json/version`);
      console.log('Bu pencereyi kapatabilirsin, browser arka planda calisir.');
      return;
    }
    if (i % 5 === 4) console.log(`  ${i+1}s... CDP henuz cevap vermedi.`);
  }

  console.error(`ERROR: Browser CDP'ye 30s icinde baglanmadi (port ${port}).`);
  console.error('Olasi sebep: browser path yanlis, port baska uygulamada, veya browser anti-otomasyon.');
  process.exit(1);
}

main();
