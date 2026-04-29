const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const OUTPUT_DIR = path.join(__dirname, '..', 'output');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const IMAGE_MODEL = 'google/gemini-2.5-flash-image';

const OR_HEADERS = (apiKey) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'http://localhost:3000',
  'X-Title': 'Etsy Lifestyle Mockup',
});

const SCENE_POOLS = {
  kitchen: [
    'warm kitchen counter with herbs, olive oil bottle, mediterranean feel',
    'marble kitchen island with morning sunlight, fresh bread and linen towel',
    'rustic dark wood kitchen table with a candle and small plant',
    'white subway tile backdrop, wooden cutting board with fresh basil',
    'farmhouse kitchen counter with ceramic jars and dried herbs',
    'modern kitchen island with sleek black surface and warm pendant light',
    'sunlit breakfast nook with coffee cup and croissant nearby',
    'rustic butcher block counter with cast iron and copper pots',
    'cozy kitchen with open shelving of spices and vintage scales',
    'travertine counter with a bowl of lemons and linen cloth',
  ],
  bathroom: [
    'natural stone bathroom vanity with soft towels, spa atmosphere',
    'marble bathroom counter with rolled white towels and eucalyptus sprig',
    'minimalist bathroom shelf with candle and small plant',
    'white ceramic sink surround with amber soap bottle',
    'dark slate bathroom counter with brass fixtures, moody spa look',
    'scandinavian bathroom vanity with wooden accessories',
    'bright bathroom window ledge with fresh flowers',
    'travertine bathroom surround with linen hand towel',
  ],
  desk_office: [
    'light oak wood desk with a green potted plant, scandinavian minimal',
    'walnut desk with open notebook, pen, and warm lamp light',
    'white modern desk with books, reading glasses and coffee',
    'industrial metal desk with leather notebook and brass accents',
    'home office shelf with stacked books and soft daylight',
    'minimalist desk with laptop off to the side, morning light',
  ],
  living_room: [
    'cozy coffee table with books and a warm throw blanket visible',
    'rustic wood coffee table with open hardcover book and candle',
    'modern side table next to a linen sofa, soft ambient lighting',
    'fireplace mantle with warm ambient glow, winter cozy',
    'mid-century sideboard with a vase of branches and vintage frame',
    'round coffee table with magazines and a steaming mug',
  ],
  bedroom: [
    'vintage wooden tray on white bedding, lifestyle morning scene',
    'nightstand with open book, brass lamp glow, and linen sheets',
    'boho bedroom dresser with dried flowers and jewelry dish',
    'sunlit bed with wrinkled white linen and coffee cup',
    'minimalist bedside table with small plant and reading glasses',
  ],
  dining: [
    'elegant dining table with fresh flowers in a vase, dinner setting',
    'rustic wooden dining table with linen runner and candlesticks',
    'set dinner table with wine glass and soft candlelight',
    'brunch table with fresh fruit, pastries and fresh flowers',
    'formal dining surface with silverware and cloth napkin',
  ],
  outdoor: [
    'outdoor wooden table with garden bokeh and golden hour sunlight',
    'woven picnic blanket on green grass, dappled sunlight',
    'patio table with greenery background and iced drink',
    'weathered garden bench with wildflowers and morning dew',
    'terracotta tile surface with small succulents, bohemian warm',
  ],
  jewelry: [
    'dark velvet fabric draped surface with warm accent lighting, gift presentation style',
    'marble jewelry dish with soft diffused light and rose petals',
    'cream silk fabric with pearl accents, luxury editorial style',
    'open vintage jewelry box on a wooden vanity, soft light',
    'black velvet pad with spotlight, high-end jewelry display',
    'soft pink satin surface with golden hour window light',
  ],
  clothing: [
    'wooden hanger against a neutral wall with soft window light',
    'folded on a linen chair with natural daylight',
    'flat lay on white bedsheet with coffee and sunglasses',
    'hung on a vintage clothing rack with boutique vibes',
    'wooden mannequin with plants in the background',
  ],
  wall_art: [
    'bright modern living room wall with linen sofa and indoor plant in the foreground',
    'bedroom wall above a minimalist nightstand with warm lamp glow',
    'scandinavian hallway wall with wooden bench and coat rack',
    'cozy reading nook wall next to a leather armchair and throw blanket',
    'entryway wall with a wooden console table, vase of branches and key dish',
    'home office wall behind a walnut desk with open books',
  ],
  decor_general: [
    'clean white marble surface with minimal shadows, modern and elegant',
    'warm marble countertop with morning sunlight and dried eucalyptus',
    'rustic dark wood table with soft window light and candle',
    'dark slate surface with dramatic side lighting, moody luxury aesthetic',
    'concrete surface with architectural shadows, industrial modern',
    'windowsill scene with soft rain light, atmospheric and moody',
    'artisan workshop bench with natural textures, handcrafted feel',
    'beach house weathered wood table, seashells nearby, coastal light',
    'glass shelf with soft backlighting, modern retail display',
  ],
};

// Camera angles - rotated through generated mockups so each photo feels distinct
const ANGLE_POOL = [
  { name: 'eye-level front', desc: 'eye-level straight-on hero shot, product centered, professional product photography' },
  { name: '3/4 angle', desc: '3/4 angle perspective from above, slight tilt, dynamic composition' },
  { name: 'top-down flat lay', desc: 'top-down flat lay, bird\'s eye view, styled props arranged around product' },
  { name: 'side profile', desc: 'side profile view, clean horizontal composition, soft side lighting' },
  { name: '45-degree hero', desc: '45-degree hero shot, slight upward angle, magazine-quality lighting' },
  { name: 'low angle drama', desc: 'low angle dramatic shot looking up at product, cinematic depth' },
  { name: 'lifestyle wide', desc: 'lifestyle wide shot, product in context with surrounding scene visible, environmental story' },
  { name: 'macro detail', desc: 'tight macro close-up showing texture and craft detail, shallow depth of field' },
  { name: 'overhead 60deg', desc: 'overhead 60-degree angle, soft shadows, editorial style' },
  { name: 'in-use scene', desc: 'product shown in natural use context, hands or environment partially visible, candid feel' },
];

// Theme presets: user-friendly groupings mapped to scene pool keys + label
const THEME_PRESETS = {
  bedroom:        { label: 'Yatak Odasi',       pool: 'bedroom' },
  living_room:    { label: 'Salon / Living',    pool: 'living_room' },
  kitchen:        { label: 'Mutfak',            pool: 'kitchen' },
  bathroom:       { label: 'Banyo',             pool: 'bathroom' },
  dining:         { label: 'Yemek Odasi',       pool: 'dining' },
  desk_office:    { label: 'Ofis / Calisma',    pool: 'desk_office' },
  outdoor:        { label: 'Disarisi / Bahce',  pool: 'outdoor' },
  wall_art:       { label: 'Duvar Sahnesi',     pool: 'wall_art' },
  jewelry:        { label: 'Taki Sahnesi',      pool: 'jewelry' },
  clothing:       { label: 'Giyim Sahnesi',     pool: 'clothing' },
  decor_general:  { label: 'Genel Lifestyle',   pool: 'decor_general' },
  studio_white:   { label: 'Studyo Beyaz Arkaplan', scenes: [
    'pure white seamless studio backdrop, soft even lighting, no shadows, professional product shot',
    'clean white studio with soft drop shadow under product, minimal, e-commerce style',
    'bright white background, single hero product centered, magazine catalog style',
    'pure white cyclorama studio, gentle gradient floor-to-wall, premium e-commerce look',
    'crisp white seamless paper backdrop, soft directional light, product hero shot',
  ] },
  studio_black:   { label: 'Studyo Siyah Arkaplan', scenes: [
    'deep black studio backdrop, dramatic side lighting, luxury product shot',
    'matte black surface, single rim light from above, moody luxury feel',
    'pitch black background with single hero product, high contrast editorial',
    'velvet black drape backdrop, soft top light, jewelry-store style premium look',
  ] },
  studio_neutral: { label: 'Studyo Notr (kraft/bej)', scenes: [
    'warm beige seamless studio backdrop, soft daylight, organic minimalist tone',
    'kraft paper background, subtle texture, handcrafted feel',
    'cream linen studio backdrop, soft window light, editorial calm',
  ] },
  macro_detail:   { label: 'Yakin Plan Detay', scenes: [
    'tight macro close-up showing material texture and craftsmanship detail, shallow depth of field',
    'extreme close-up on a single design feature, dramatic narrow focus',
    'detail shot revealing surface finish and material grain, soft directional light',
  ] },
  in_use:         { label: 'Kullanim Halinde', scenes: [
    'product shown in natural use context, hands or environment partially visible, candid feel',
    'real-life use shot with model interacting subtly, lifestyle authentic',
    'in-context shot demonstrating function, environment lightly visible',
  ] },
};

function pickScenePool(desc) {
  const t = (desc || '').toLowerCase();
  if (/wall.art|poster|canvas|print|painting|tablo|poster|kanvas|duvar/.test(t)) return 'wall_art';
  if (/kitchen|cook|chef|spatula|utensil|cutting.board|apron|pot.holder|oven.mitt|coaster|trivet|towel.holder|paper.towel|spice|salt|pepper|olive.oil|recipe|mug|cup|tea|coffee|bowl|plate|mutfak|kupa|kase|tabak/.test(t)) return 'kitchen';
  if (/bathroom|bath|shower|soap|towel|toothbrush|vanity|spa|toilet|banyo|havlu/.test(t)) return 'bathroom';
  if (/desk|office|pen|notebook|journal|laptop|mouse.pad|monitor|bookend|planner|calendar|ofis|defter/.test(t)) return 'desk_office';
  if (/living.room|sofa|couch|throw|pillow|blanket|coffee.table|fireplace|mantel|mantle|salon|şömine|somine|yastık/.test(t)) return 'living_room';
  if (/bedroom|bed|nightstand|sheet|duvet|lamp|yatak|nevresim/.test(t)) return 'bedroom';
  if (/dining|dinner|placemat|napkin|centerpiece|candlestick|tablecloth|yemek.masası/.test(t)) return 'dining';
  if (/garden|outdoor|patio|porch|yard|lawn|picnic|bbq|grill|bahçe|bahce/.test(t)) return 'outdoor';
  if (/necklace|ring|earring|bracelet|jewelry|pendant|charm|brooch|anklet|kolye|küpe|yüzük/.test(t)) return 'jewelry';
  if (/shirt|tee|tshirt|hoodie|sweater|sweatshirt|dress|pants|hat|cap|scarf|clothing|apparel|tişört|elbise|şapka/.test(t)) return 'clothing';
  return 'decor_general';
}

function readAsBase64(imagePath) {
  const buf = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return { base64: buf.toString('base64'), mime };
}

async function geminiGenerateImage({ imageParts, prompt, apiKey }) {
  const content = imageParts.map(img => ({
    type: 'image_url',
    image_url: { url: `data:${img.mime};base64,${img.base64}` },
  }));
  content.push({ type: 'text', text: prompt });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: OR_HEADERS(apiKey),
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [{ role: 'user', content }],
        response_modalities: ['IMAGE', 'TEXT'],
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Image gen failed (${response.status}): ${errBody.slice(0, 400)}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  if (!message) throw new Error('No message from image model');

  const allParts = [];
  if (Array.isArray(message.content)) allParts.push(...message.content.filter(p => p.type === 'image_url'));
  if (Array.isArray(message.images)) allParts.push(...message.images.filter(p => p.type === 'image_url'));

  for (const part of allParts) {
    const url = part.image_url?.url;
    if (!url) continue;
    if (url.startsWith('data:')) return Buffer.from(url.split(',')[1], 'base64');
    const r = await fetch(url);
    return Buffer.from(await r.arrayBuffer());
  }
  return null;
}

async function toSquareBuffer(buffer) {
  const meta = await sharp(buffer).metadata();
  const size = Math.min(meta.width || 1024, meta.height || 1024);
  return sharp(buffer)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toBuffer();
}

function buildPrompt({ productDesc, scene, angle, mode, idx, total }) {
  if (mode === 'bg-replace') {
    // legacy: keep product pixel-faithful, change ONLY background. No angle variation.
    return `Edit this product photo: REPLACE ONLY THE BACKGROUND. The product in the image is a ${productDesc}.

NEW BACKGROUND: ${scene}

CRITICAL RULES:
1. DO NOT touch, modify, reshape, recolor, or redraw the product itself. Pixel-perfect identical.
2. ONLY replace the background/surroundings.
3. Match lighting on the new background to the product naturally.
4. Add small contextual props around (not on top of) the product.
5. Square 1:1 output. No text, watermarks, labels, or logos.`;
  }

  // rotate-angles (default) — full re-render with new camera angle + new scene each time
  return `Generate a brand new photograph (mockup ${idx} of ${total}) of the product described below.

CAMERA ANGLE (most important): ${angle}
The composition MUST match this camera angle. If the angle says "top-down flat lay", the output is a flat lay -- the product is photographed straight from above. If the angle says "low angle dramatic", the camera is below the product looking up. Each mockup uses a DIFFERENT angle from this set. Do NOT default to an eye-level front shot.

SCENE / BACKGROUND: ${scene}
Style the surroundings to match the scene above. Lifestyle Etsy listing aesthetic with warm natural lighting and complementary props.

PRODUCT: ${productDesc}
The product must be recognizable as this exact item: same colors, materials, design, proportions, finish. It is the hero of the image.

OUTPUT:
- Square 1:1, photo-realistic, professional Etsy listing quality.
- No text, no watermarks, no labels, no logos, no writing of any kind.
- This image must be visually distinct from any other mockup in the set (different angle AND different background AND different framing).`;
}

async function generateLifestyleMockups({ productImagePath, productImagePaths, productDescription, sku, count = 10, mode = 'rotate-angles', themes, onProgress }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set in .env');

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const imagePaths = Array.isArray(productImagePaths) && productImagePaths.length
    ? productImagePaths
    : (productImagePath ? [productImagePath] : []);
  if (imagePaths.length === 0) throw new Error('No product image provided');

  // Build per-mockup spec list: [{scene, themeLabel}, ...]
  // Priority: explicit themes[] > niche.scenePool > pickScenePool fallback
  const niche = require('./niche');
  const nicheData = niche.get();

  const specs = []; // each entry: { scene, themeLabel }

  if (Array.isArray(themes) && themes.length) {
    for (const t of themes) {
      const themeKey = (t.theme || '').trim();
      const cnt = Math.max(0, Math.min(50, parseInt(t.count, 10) || 0));
      if (!cnt) continue;
      const preset = THEME_PRESETS[themeKey];
      let themeScenes;
      let themeLabel;
      if (preset) {
        themeLabel = preset.label;
        if (Array.isArray(preset.scenes)) themeScenes = preset.scenes;
        else if (preset.pool && SCENE_POOLS[preset.pool]) themeScenes = SCENE_POOLS[preset.pool];
        else themeScenes = SCENE_POOLS.decor_general;
      } else {
        themeLabel = themeKey || 'Custom';
        themeScenes = SCENE_POOLS.decor_general;
      }
      for (let k = 0; k < cnt; k++) {
        specs.push({ scene: themeScenes[k % themeScenes.length], themeLabel });
      }
    }
  }

  if (specs.length === 0) {
    let poolKey;
    let scenes;
    if (Array.isArray(nicheData.scenePool) && nicheData.scenePool.length) {
      poolKey = `niche:${nicheData.productType || 'custom'}`;
      scenes = nicheData.scenePool;
    } else {
      poolKey = pickScenePool(productDescription);
      scenes = SCENE_POOLS[poolKey];
    }
    for (let i = 0; i < count; i++) {
      specs.push({ scene: scenes[i % scenes.length], themeLabel: poolKey });
    }
    onProgress?.({ type: 'step-done', step: 'scene', message: `Kategori: ${poolKey} (${count} mockup)`, pool: poolKey });
  } else {
    onProgress?.({ type: 'step-done', step: 'scene', message: `Tema spec: ${specs.length} mockup, ${themes.length} tema`, themes: themes });
  }

  const total = specs.length;

  const imgParts = imagePaths.map(readAsBase64);
  const outputs = [];
  const concepts = [];

  // Vision-describe product ONCE for rotate-angles mode (decouples generation from input pixels)
  let visualDescription = null;
  if (mode === 'rotate-angles') {
    onProgress?.({ type: 'step-start', step: 'describe', message: 'Urun gorseli analiz ediliyor (acilara karsi pixel-locking onleme)...' });
    try {
      const providers = require('./providers');
      const visionPrompt = `Describe this product in extreme visual detail for a downstream image generator. Include: type of product, exact colors, materials, textures, patterns, dimensions/proportions, finish (glossy/matte/etc), distinguishing features. Be precise so a different artist could recreate the SAME product from any camera angle. Do not describe the background. Output ONE detailed paragraph.`;
      const { text: desc } = await providers.vision({
        imagePath: imagePaths[0],
        prompt: visionPrompt,
        maxTokens: 600,
      });
      visualDescription = (desc || '').trim().slice(0, 1500);
      onProgress?.({ type: 'step-done', step: 'describe', message: `Urun analizi tamam (${visualDescription.length} chars)` });
    } catch (e) {
      console.warn('[lifestyle-mockup] vision describe failed, falling back to image input:', e.message);
    }
  }

  for (let i = 0; i < total; i++) {
    const { scene, themeLabel } = specs[i];
    const angleObj = ANGLE_POOL[i % ANGLE_POOL.length];
    const angleLabel = angleObj.name;
    const angleDesc = angleObj.desc;
    concepts.push({ angle: angleLabel, scene, theme: themeLabel });
    onProgress?.({ type: 'mockup-start', idx: i + 1, total, angle: angleLabel, scene, theme: themeLabel });

    // For rotate-angles: text-only generation if vision describe succeeded -> truly varied angles
    // For bg-replace: image-input edit (preserves angle)
    const useTextOnly = mode === 'rotate-angles' && visualDescription;
    let refs;
    if (useTextOnly) {
      refs = []; // skip image input -> AI generates fresh from text
    } else {
      const primary = imgParts[i % imgParts.length];
      refs = imgParts.length > 1
        ? [primary, ...imgParts.filter(p => p !== primary).slice(0, 2)]
        : [primary];
    }

    const productDescForPrompt = useTextOnly
      ? `${productDescription}. Visual details: ${visualDescription}`
      : productDescription;
    const prompt = buildPrompt({ productDesc: productDescForPrompt, scene, angle: angleDesc, mode, idx: i + 1, total });

    try {
      const imgBuffer = await geminiGenerateImage({ imageParts: refs, prompt, apiKey });
      if (!imgBuffer) throw new Error('Model did not return an image');
      const squared = await toSquareBuffer(imgBuffer);
      const outName = `${sku}_mockup${String(i + 1).padStart(2, '0')}.png`;
      const outPath = path.join(OUTPUT_DIR, outName);
      fs.writeFileSync(outPath, squared);
      const relPath = '/output/' + outName;
      outputs.push(relPath);
      onProgress?.({ type: 'mockup-done', idx: i + 1, total, path: relPath, angle: angleLabel, scene, theme: themeLabel });
    } catch (err) {
      console.warn(`[lifestyle-mockup] idx=${i + 1} failed: ${err.message}`);
      onProgress?.({ type: 'mockup-error', idx: i + 1, total, error: err.message, angle: angleLabel });
    }
  }

  return { outputs, concepts };
}

module.exports = { generateLifestyleMockups, pickScenePool, SCENE_POOLS, THEME_PRESETS };
