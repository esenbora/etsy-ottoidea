// Etsy listing optimizer — metal wall art edition

const niche = require('./niche');

function nicheData() {
  try { return niche.get() || {}; } catch { return {}; }
}

function listFinishes() {
  const n = nicheData();
  const arr = Array.isArray(n.finishes) && n.finishes.length
    ? n.finishes
    : ['matte black', 'satin white', 'antique copper', 'brushed silver', 'rustic bronze', 'raw steel'];
  return arr;
}

function listSizes() {
  const n = nicheData();
  const arr = Array.isArray(n.sizes) && n.sizes.length
    ? n.sizes
    : ['12 inch', '18 inch', '24 inch', '36 inch', '48 inch'];
  return arr;
}

function listMaterials() {
  const n = nicheData();
  const arr = Array.isArray(n.materials) && n.materials.length
    ? n.materials
    : ['16-gauge cold rolled steel', 'powder-coated finish', 'rust-resistant clear coat'];
  return arr;
}

const AVAILABLE_STYLES = (() => {
  const finishes = listFinishes();
  const sizes = listSizes();
  const materials = listMaterials();
  return `

AVAILABLE OPTIONS

MATERIAL
${materials.map(m => `• ${m}`).join('\n')}
• Pre-drilled mounting holes for easy hanging
• Hardware not included unless noted in listing

SIZES
${sizes.map(s => `• ${s} (longest dimension)`).join('\n')}
• Custom sizes available on request — message us before ordering

FINISHES
${finishes.map(f => `• ${f}`).join('\n')}
• All finishes are weather-resistant; suitable for covered outdoor use
• Indoor / outdoor use both supported`;
})();

const SIZING = `

CHOOSING A SIZE
The size you pick is the longest edge of the panel.
• 12-18 in — accent piece, gallery wall, kitchen, entryway, bathroom
• 24 in — above a nightstand, console, or small sofa
• 36 in — above a bed, fireplace, or standard sofa
• 48 in — statement wall, large open spaces, restaurants, offices
Not sure which size fits? Message us your wall dimensions and we'll help.`;

const COLORS = `

FINISH NOTES
Listing photos show the design in our most popular finish. Each finish is powder-coated by hand, so slight variation in texture and sheen is normal and part of the character of a hand-finished piece. Screen colors may differ slightly from the real finish.`;

const HOW_TO_ORDER = `

HOW TO ORDER
Select your size → Pick your finish → (Optional) add personalization in the note to seller → Add to cart → Done.
Want a custom design, name, established date, or logo? Message us before purchasing so we can confirm fit and pricing.`;

const SHIPPING = `

SHIPPING & HANDLING
Production: 3-5 business days (each piece is cut and finished to order).
Shipping: 2-5 business days within the US after production.
Larger sizes (36 in+) ship in a reinforced box; please inspect on arrival and report any shipping damage within 48 hours with photos. Address changes must be requested before the item ships.`;

const CARE = `

CARE
Wipe with a soft dry cloth. For outdoor pieces, an occasional gentle wipe with a damp cloth is enough. Avoid abrasive cleaners or pressure washing — the powder coat is durable but not indestructible.`;

const MOUNTING = `

MOUNTING
Pre-drilled holes are spaced for standard wall anchors or screws. For drywall, use anchors rated for the panel weight. For exterior walls (brick, stucco), use the appropriate masonry hardware. Mounts flush to the wall and casts a soft shadow that gives the piece dimension.`;

// ─────────────────────────────────────────────
// CATEGORY-SPECIFIC INTRO
// ─────────────────────────────────────────────

function generateDescription(title, tags) {
  const t = (title || '').toLowerCase();
  const specific = (title || '').split(',')[0].trim() || 'metal wall art';
  const category = getCategory(title);

  let intro = '';

  switch (category) {
    case 'family':
      intro = `Custom family name metal sign that anchors the room — ${specific}.

Hand-cut from heavy-gauge steel and powder-coated for a finish that lasts, this family name piece turns the entry, living room, or above-the-mantel spot into something that feels personal. The negative-space lettering throws a soft shadow against the wall, so the sign reads beautifully in any light. Pair the family name with the established year for a heirloom feel.`;
      break;

    case 'religious':
      intro = `Faith-forward metal wall art that brings quiet beauty to the room — ${specific}.

A clean, hand-finished steel piece designed to be the focal point of a prayer corner, hallway, or above-the-bed wall. The cut-out silhouette and matte powder coat keep the design timeless — the kind of piece you choose once and live with for decades. Thoughtful housewarming, baptism, wedding, or anniversary gift.`;
      break;

    case 'nature':
      intro = `Outdoor-inspired metal wall art for cabin, lake house, or mountain home — ${specific}.

Laser-cut from cold rolled steel and powder-coated for indoor or covered outdoor use, this nature-inspired piece brings the landscape inside. The detailed silhouette catches light at every angle, and the finish is built to weather seasons without rust or fading.`;
      break;

    case 'western':
      intro = `Farmhouse and western metal decor with real craftsmanship behind it — ${specific}.

Cut from heavy steel and finished by hand, this piece has the rustic character that printed signs can never fake. Mounts flush to the wall, casts a clean shadow, and pairs with reclaimed wood, leather, and warm lighting. Built for the ranch house, the Texas patio, or the modern barn.`;
      break;

    case 'coastal':
      intro = `Coastal metal wall art that holds up to salt air and humidity — ${specific}.

Powder-coated and clear-sealed for coastal climates, this piece is designed for beach houses, lake homes, and covered outdoor spaces. The cutout silhouette throws a soft shadow that mimics sun on water — exactly the vibe you want above the bed, the bar, or the entryway.`;
      break;

    case 'floral':
      intro = `Botanical metal wall art with the detail of fine line work — ${specific}.

Laser-cut so the negative space does the work, this floral piece brings organic shapes to the wall without the bulk of framed art. The matte powder coat keeps the focus on the silhouette, and the soft shadow it casts makes the piece feel alive on any wall color.`;
      break;

    case 'music':
      intro = `Music-lover metal wall art for the studio, listening room, or living space — ${specific}.

Cut from heavy steel and powder-coated for a finish that won't flake, this piece is sized to anchor a record wall or hang above an amp setup. The detail is sharp, the lines are clean, and the shadow it casts gives the design real depth.`;
      break;

    case 'sports':
      intro = `Sports-themed metal wall art that doesn't look like cheap fan merch — ${specific}.

Hand-cut and powder-coated, this piece is built for the man cave, garage gym, or game room — and it's heavy enough to feel like a real fixture, not a poster. The cutout silhouette lets the wall color show through, so it works with any paint or paneling behind it.`;
      break;

    case 'quote':
      intro = `Inspirational metal wall quote with the kind of presence vinyl decals can't match — ${specific}.

Each letter is laser-cut from steel and powder-coated for a clean, lasting finish. Mounts flush to the wall and casts a shadow that makes the words sit forward. A meaningful housewarming, wedding, anniversary, or new-business gift.`;
      break;

    case 'map':
      intro = `Custom location metal wall art — your state, your city, your coordinates — ${specific}.

Hand-cut from heavy-gauge steel and powder-coated, this map piece turns any wall into a marker for the place that matters. Add coordinates, established dates, or a custom label in the note to seller. Lasting gift for a move, a wedding, or a milestone.`;
      break;

    case 'holiday':
      intro = `Seasonal metal wall art that earns its spot on the wall every year — ${specific}.

Cut from steel and powder-coated for a finish that won't dent, chip, or fade in storage. Hangs flush, packs flat, and feels heirloom — the kind of holiday decor you pull out once a year for decades. Indoor and covered outdoor friendly.`;
      break;

    case 'pet':
      intro = `Personalized pet metal wall art for the dog mom, cat dad, or animal lover — ${specific}.

Laser-cut silhouette of your favorite breed (or your own pet's profile on request), powder-coated for a clean, lasting finish. Mounts flush, casts a soft shadow, and pairs with a name plate for a custom memorial or birthday piece.`;
      break;

    case 'wedding':
      intro = `Wedding and anniversary metal wall art that becomes part of the home — ${specific}.

Hand-cut steel with the couple's names, established date, or monogram. Powder-coated for a finish that lasts as long as the marriage is supposed to. Standout gift for engagements, weddings, anniversaries, or housewarmings.`;
      break;

    case 'geometric':
      intro = `Modern geometric metal wall art with clean lines and real weight — ${specific}.

Laser-cut from steel for sharp edges no printed art can match. The matte powder coat keeps the focus on the form, and the panel casts a thin shadow that gives the piece real architectural presence. Designed for modern interiors, lofts, and offices.`;
      break;

    case 'business':
      intro = `Custom business metal sign for storefronts, offices, and studios — ${specific}.

Cut from heavy-gauge steel, powder-coated, and ready to mount. We can produce your logo, wordmark, or established date at the size you need — message before ordering with your artwork and we'll confirm the cut and price.`;
      break;

    default:
      intro = `Hand-finished metal wall art that looks like a fixture, not a print — ${specific}.

Each piece is laser-cut from heavy-gauge steel and powder-coated by hand, so the finish has real depth and the silhouette throws a soft shadow on the wall behind it. Mounts flush with pre-drilled holes, ships in a reinforced box, and is built to live on the wall for years — indoor or covered outdoor.`;
  }

  const closingOptions = [
    `Save it to your favorites and message us with any sizing or finish questions before ordering.`,
    `Heart it now so you don't lose it — and check the rest of the shop for matching pieces.`,
    `Add it to your cart or save for later. Custom sizes and personalization available — just ask.`,
    `Pin it, save it, share it — and reach out if you want a custom finish or size.`,
  ];
  const closing = closingOptions[Math.abs(hashCode(title)) % closingOptions.length];

  return intro + AVAILABLE_STYLES + SIZING + COLORS + MOUNTING + CARE + HOW_TO_ORDER + SHIPPING + '\n\n' + closing;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ─────────────────────────────────────────────
// CATEGORY DETECTION
// ─────────────────────────────────────────────

function getCategory(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('family') || t.includes('last name') || t.includes('established') || t.includes('monogram') || t.includes('home sweet home')) return 'family';
  if (t.includes('cross') || t.includes('faith') || t.includes('jesus') || t.includes('bible') || t.includes('scripture') || t.includes('prayer') || t.includes('christian') || t.includes('psalm') || t.includes('blessed')) return 'religious';
  if (t.includes('mountain') || t.includes('forest') || t.includes('tree') || t.includes('deer') || t.includes('elk') || t.includes('bear') || t.includes('eagle') || t.includes('wolf') || t.includes('cabin') || t.includes('lake') || t.includes('lodge') || t.includes('wildlife')) return 'nature';
  if (t.includes('western') || t.includes('cowboy') || t.includes('cowgirl') || t.includes('ranch') || t.includes('texas') || t.includes('horseshoe') || t.includes('farmhouse') || t.includes('barn') || t.includes('rooster') || t.includes('cattle') || t.includes('longhorn')) return 'western';
  if (t.includes('beach') || t.includes('ocean') || t.includes('coastal') || t.includes('nautical') || t.includes('anchor') || t.includes('lighthouse') || t.includes('sail') || t.includes('whale') || t.includes('seashell') || t.includes('palm')) return 'coastal';
  if (t.includes('floral') || t.includes('flower') || t.includes('botanical') || t.includes('leaf') || t.includes('vine') || t.includes('rose') || t.includes('sunflower') || t.includes('mandala')) return 'floral';
  if (t.includes('music') || t.includes('guitar') || t.includes('piano') || t.includes('violin') || t.includes('treble') || t.includes('record') || t.includes('vinyl') || t.includes('musician')) return 'music';
  if (t.includes('football') || t.includes('basketball') || t.includes('baseball') || t.includes('hockey') || t.includes('golf') || t.includes('soccer') || t.includes('fishing') || t.includes('hunting') || t.includes('gym') || t.includes('motorcycle') || t.includes('truck') || t.includes('jeep')) return 'sports';
  if (t.includes('quote') || t.includes('saying') || t.includes('word art') || t.includes('inspirational') || t.includes('motivational') || t.includes('phrase')) return 'quote';
  if (t.includes('map') || t.includes('state') || t.includes('city') || t.includes('coordinates') || t.includes('latitude') || t.includes('country') || t.includes('hometown')) return 'map';
  if (t.includes('christmas') || t.includes('halloween') || t.includes('thanksgiving') || t.includes('easter') || t.includes('valentine') || t.includes('santa') || t.includes('pumpkin') || t.includes('snowflake') || t.includes('holiday')) return 'holiday';
  if (t.includes('dog') || t.includes('cat') || t.includes('puppy') || t.includes('kitten') || t.includes('paw') || t.includes('pet') || t.includes('horse') || t.includes('breed')) return 'pet';
  if (t.includes('wedding') || t.includes('bride') || t.includes('groom') || t.includes('anniversary') || t.includes('mr and mrs') || t.includes('mr & mrs') || t.includes('couple')) return 'wedding';
  if (t.includes('geometric') || t.includes('abstract') || t.includes('modern') || t.includes('minimalist') || t.includes('hexagon') || t.includes('triangle') || t.includes('line art')) return 'geometric';
  if (t.includes('business') || t.includes('logo') || t.includes('storefront') || t.includes('office') || t.includes('shop sign') || t.includes('company')) return 'business';
  return 'general';
}

// ─────────────────────────────────────────────
// ALT TEXT
// ─────────────────────────────────────────────

function generateAltTexts(title, tags) {
  const full = (title || '').trim();
  const mainProduct = full.split(',')[0].trim();
  const tagList = (tags || []).filter(t => t && t.length > 0);

  const usedTags = new Set();
  function pickTag() {
    for (const t of tagList) {
      if (!usedTags.has(t)) { usedTags.add(t); return t; }
    }
    return '';
  }

  const alts = [
    full,
    [mainProduct, pickTag()].filter(Boolean).join(' - '),
    [pickTag(), mainProduct].filter(Boolean).join(', '),
    [mainProduct, pickTag(), pickTag()].filter(Boolean).join(', '),
    [pickTag(), pickTag()].filter(Boolean).join(', '),
    [mainProduct, pickTag()].filter(Boolean).join(', '),
    [pickTag(), mainProduct].filter(Boolean).join(' - '),
    [pickTag(), pickTag(), pickTag()].filter(Boolean).join(', '),
    [mainProduct, pickTag()].filter(Boolean).join(' - '),
    [pickTag(), pickTag()].filter(Boolean).join(', '),
  ];

  return alts.slice(0, 10).map(alt => alt.trim().substring(0, 250));
}

// ─────────────────────────────────────────────
// TAG OPTIMIZATION
// ─────────────────────────────────────────────

const TAG_POOLS = {
  family: [
    'family name sign', 'last name sign', 'family monogram art', 'established sign',
    'personalized wall', 'custom name decor', 'entryway metal art', 'living room sign',
    'family gift idea', 'housewarming gift', 'wedding name gift', 'above mantle art'
  ],
  religious: [
    'cross wall art', 'christian metal art', 'bible verse sign', 'faith wall decor',
    'prayer wall art', 'church metal sign', 'religious gift', 'baptism gift',
    'scripture metal sign', 'jesus wall art', 'spiritual decor', 'inspirational faith'
  ],
  nature: [
    'mountain wall art', 'forest metal sign', 'cabin wall decor', 'lodge metal art',
    'deer silhouette art', 'wildlife wall decor', 'lake house decor', 'rustic wall art',
    'outdoor metal sign', 'nature lover gift', 'national park art', 'tree of life decor'
  ],
  western: [
    'western metal art', 'cowboy wall sign', 'ranch metal decor', 'farmhouse wall art',
    'rustic metal sign', 'barn metal decor', 'texas wall art', 'longhorn wall art',
    'horseshoe decor', 'country home decor', 'rodeo gift idea', 'western style decor'
  ],
  coastal: [
    'coastal metal art', 'beach house decor', 'nautical wall art', 'lake house sign',
    'anchor metal art', 'lighthouse decor', 'ocean wall sign', 'seaside metal art',
    'palm tree wall art', 'whale silhouette', 'fishing wall decor', 'coastal living gift'
  ],
  floral: [
    'floral metal art', 'botanical wall decor', 'flower wall sign', 'leaf wall art',
    'sunflower metal art', 'mandala wall decor', 'garden metal sign', 'rose wall art',
    'modern floral decor', 'kitchen wall art', 'spring wall decor', 'feminine wall art'
  ],
  music: [
    'music wall art', 'guitar metal sign', 'musician gift', 'studio wall decor',
    'piano wall art', 'vinyl record decor', 'music lover gift', 'band wall art',
    'treble clef sign', 'concert wall decor', 'music room art', 'instrument silhouette'
  ],
  sports: [
    'sports wall art', 'man cave sign', 'garage wall decor', 'game room art',
    'gym wall art', 'fan gift idea', 'team metal sign', 'athletic wall decor',
    'hunting wall art', 'fishing metal sign', 'truck wall art', 'jeep wall decor'
  ],
  quote: [
    'word wall art', 'quote metal sign', 'inspirational decor', 'motivational art',
    'word metal sign', 'phrase wall decor', 'sayings wall art', 'kitchen quote sign',
    'office wall art', 'home quote decor', 'family quote sign', 'love wall art'
  ],
  map: [
    'state metal art', 'city wall sign', 'coordinates wall art', 'map metal decor',
    'hometown wall art', 'country metal art', 'travel wall decor', 'location gift',
    'state outline sign', 'city skyline art', 'where it began', 'place wall art'
  ],
  holiday: [
    'christmas metal art', 'halloween wall sign', 'thanksgiving decor', 'easter wall art',
    'holiday metal sign', 'seasonal wall art', 'pumpkin wall decor', 'snowflake metal art',
    'holiday gift idea', 'festive wall decor', 'mantel holiday art', 'porch decor sign'
  ],
  pet: [
    'pet wall art', 'dog metal sign', 'cat silhouette art', 'paw print decor',
    'pet memorial art', 'dog mom gift', 'cat lover wall art', 'breed metal sign',
    'pet portrait silhouette', 'horse wall art', 'animal lover gift', 'pet name sign'
  ],
  wedding: [
    'wedding metal art', 'anniversary gift', 'mr and mrs sign', 'couple wall decor',
    'bridal shower gift', 'engagement wall art', 'newlywed gift', 'wedding name sign',
    'established date sign', 'wedding gift idea', 'first home gift', 'love metal art'
  ],
  geometric: [
    'geometric wall art', 'modern metal decor', 'abstract wall art', 'minimalist decor',
    'hexagon wall art', 'line art metal sign', 'modern home decor', 'loft wall art',
    'office metal art', 'studio wall decor', 'contemporary wall', 'designer wall art'
  ],
  business: [
    'business metal sign', 'logo wall sign', 'office wall decor', 'storefront sign',
    'company wall art', 'shop metal sign', 'salon wall decor', 'restaurant sign',
    'studio metal art', 'commercial wall art', 'brand wall sign', 'workplace decor'
  ],
  general: [
    'metal wall art', 'metal wall decor', 'laser cut metal sign', 'powder coated art',
    'steel wall sculpture', 'modern metal hanging', 'housewarming gift', 'home decor sign',
    'above bed wall art', 'living room decor', 'wall hanging metal', 'unique wall art'
  ]
};

function getTitleWords(title) {
  return (title || '')
    .toLowerCase()
    .split(/[\s,\-|\/]+/)
    .filter(w => w.length > 3);
}

function tagOverlapsTitle(tag, titleWords) {
  const tagWords = tag.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const matches = tagWords.filter(w => titleWords.includes(w));
  return matches.length >= 2;
}

function optimizeTags(listing) {
  const title = listing.title || '';
  const titleWords = getTitleWords(title);
  const category = getCategory(title);

  const seed = Array.isArray(nicheData().keywordSeed) ? nicheData().keywordSeed : [];
  const pool = [...seed, ...(TAG_POOLS[category] || []), ...TAG_POOLS.general];

  const banned = (() => {
    try { return new Set((niche.bannedWords() || []).map(w => w.toLowerCase())); }
    catch { return new Set(); }
  })();

  const JUNK = ['query', 'search', 'undefined', 'null', 'none', 'n/a'];
  let cleanTags = (listing.tags || []).filter(tag => {
    if (!tag || tag.length < 3) return false;
    if (/^\d+$/.test(tag.trim())) return false;
    if (JUNK.includes(tag.toLowerCase().trim())) return false;
    const lower = tag.toLowerCase();
    for (const b of banned) if (lower.includes(b)) return false;
    return true;
  });

  const used = new Set();
  const result = cleanTags.map(tag => {
    used.add(tag);
    if (!tagOverlapsTitle(tag, titleWords)) return tag;

    for (const candidate of pool) {
      const c = candidate.substring(0, 20).trim();
      if (!tagOverlapsTitle(c, titleWords) && !used.has(c)) {
        used.add(c);
        return c;
      }
    }
    return tag;
  });

  for (const candidate of pool) {
    if (result.length >= 13) break;
    const c = candidate.substring(0, 20).trim();
    if (!c || c.length < 3) continue;
    let isBanned = false;
    for (const b of banned) if (c.toLowerCase().includes(b)) { isBanned = true; break; }
    if (isBanned) continue;
    if (!used.has(c) && !tagOverlapsTitle(c, titleWords)) {
      used.add(c);
      result.push(c);
    }
  }

  return result.slice(0, 13);
}

module.exports = { generateDescription, optimizeTags, generateAltTexts, getCategory };
