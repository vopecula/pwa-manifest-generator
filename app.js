// ─── Theme ────────────────────────────────────────────────────────────────────
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const iconSun = document.getElementById('iconSun');
const iconMoon = document.getElementById('iconMoon');

function applyTheme(dark) {
  if (dark) {
    html.classList.add('dark');
    iconSun.classList.remove('hidden');
    iconMoon.classList.add('hidden');
  } else {
    html.classList.remove('dark');
    iconSun.classList.add('hidden');
    iconMoon.classList.remove('hidden');
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => applyTheme(!html.classList.contains('dark')));
applyTheme(localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches));

// ─── Tabs ─────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('tab-active');
      b.classList.add('text-gray-500', 'dark:text-gray-400');
    });
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    btn.classList.add('tab-active');
    btn.classList.remove('text-gray-500', 'dark:text-gray-400');
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});

// ─── Color pickers sync ───────────────────────────────────────────────────────
function syncColor(pickerId, hexId) {
  const picker = document.getElementById(pickerId);
  const hex = document.getElementById(hexId);
  picker.addEventListener('input', () => { hex.value = picker.value; });
  hex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) picker.value = hex.value;
  });
}
syncColor('themeColor', 'themeColorHex');
syncColor('bgColor', 'bgColorHex');

// ─── Categories ───────────────────────────────────────────────────────────────
const selectedCategories = new Set();

function addCategory() {
  const sel = document.getElementById('categorySelect');
  const val = sel.value;
  if (!val || selectedCategories.has(val)) return;
  selectedCategories.add(val);
  renderCategories();
  sel.value = '';
}

function removeCategory(cat) {
  selectedCategories.delete(cat);
  renderCategories();
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  list.innerHTML = '';
  selectedCategories.forEach(cat => {
    const chip = document.createElement('span');
    chip.className = 'inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium';
    chip.innerHTML = `${cat} <button onclick="removeCategory('${cat}')" class="hover:text-red-500 ml-0.5">×</button>`;
    list.appendChild(chip);
  });
}

// ─── Screenshots ──────────────────────────────────────────────────────────────
let screenshotCount = 0;

function addScreenshot() {
  const list = document.getElementById('screenshotList');
  const id = ++screenshotCount;
  const row = document.createElement('div');
  row.id = `screenshot-${id}`;
  row.className = 'grid grid-cols-12 gap-2 items-start';
  row.innerHTML = `
    <input type="text" placeholder="URL" class="col-span-6 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" data-ss-url />
    <select class="col-span-3 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" data-ss-form>
      <option value="narrow">narrow</option>
      <option value="wide">wide</option>
    </select>
    <input type="text" placeholder="label" class="col-span-2 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" data-ss-label />
    <button onclick="document.getElementById('screenshot-${id}').remove()" class="col-span-1 text-gray-400 hover:text-red-500 text-lg leading-none pt-1">×</button>
  `;
  list.appendChild(row);
}

function getScreenshots() {
  return Array.from(document.querySelectorAll('[id^="screenshot-"]')).map(row => {
    const url = row.querySelector('[data-ss-url]').value.trim();
    const form_factor = row.querySelector('[data-ss-form]').value;
    const label = row.querySelector('[data-ss-label]').value.trim();
    if (!url) return null;
    const entry = { src: url, form_factor };
    if (label) entry.label = label;
    return entry;
  }).filter(Boolean);
}

// ─── Icon upload ──────────────────────────────────────────────────────────────
let sourceImage = null;

document.getElementById('iconInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleImageFile(file);
});

const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('border-indigo-400'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-indigo-400'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('border-indigo-400');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleImageFile(file);
});

function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      sourceImage = img;
      document.getElementById('dropPlaceholder').classList.add('hidden');
      const preview = document.getElementById('iconPreview');
      preview.classList.remove('hidden');
      preview.classList.add('flex');
      document.getElementById('iconPreviewImg').src = e.target.result;
      document.getElementById('iconPreviewName').textContent = `${file.name} (${img.width}×${img.height})`;
      showSizePreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function resetIcon() {
  sourceImage = null;
  document.getElementById('iconInput').value = '';
  document.getElementById('dropPlaceholder').classList.remove('hidden');
  const preview = document.getElementById('iconPreview');
  preview.classList.add('hidden');
  preview.classList.remove('flex');
  document.getElementById('iconSizes').classList.add('hidden');
}

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_ICON_SIZES = [192, 512];
const APPLE_TOUCH_SIZES = [120, 152, 167, 180];

function showSizePreview() {
  const container = document.getElementById('sizePreviewList');
  container.innerHTML = '';
  ICON_SIZES.forEach(size => {
    const tag = document.createElement('span');
    tag.className = 'px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-mono';
    tag.textContent = `${size}×${size}`;
    container.appendChild(tag);
  });
  document.getElementById('iconSizes').classList.remove('hidden');
}

// ─── Canvas resize helper ─────────────────────────────────────────────────────
function resizeImage(img, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, size, size);
  return canvas;
}

function canvasToBlob(canvas, type = 'image/png') {
  return new Promise(resolve => canvas.toBlob(resolve, type));
}

// Renders icon with 10% safe-zone padding on a solid background — for maskable icons.
function resizeImageMaskable(img, size, bgColor) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = bgColor || '#ffffff';
  ctx.fillRect(0, 0, size, size);
  const safeSize = size * 0.8;
  const offset = size * 0.1;
  ctx.drawImage(img, offset, offset, safeSize, safeSize);
  return canvas;
}

// ─── ICO writer ───────────────────────────────────────────────────────────────
// Builds a proper multi-resolution ICO file from PNG data URLs.
async function buildIco(img, sizes = [16, 32, 48]) {
  const pngBuffers = await Promise.all(sizes.map(async size => {
    const canvas = resizeImage(img, size);
    const blob = await canvasToBlob(canvas);
    return new Uint8Array(await blob.arrayBuffer());
  }));

  // ICO header: 6 bytes
  // Each directory entry: 16 bytes
  // Then PNG data concatenated
  const headerSize = 6;
  const dirEntrySize = 16;
  const totalDirSize = headerSize + dirEntrySize * sizes.length;

  let dataOffset = totalDirSize;
  const offsets = [];
  for (const buf of pngBuffers) {
    offsets.push(dataOffset);
    dataOffset += buf.length;
  }

  const totalSize = dataOffset;
  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);
  const bytes = new Uint8Array(icoBuffer);

  // Header
  view.setUint16(0, 0, true);     // reserved
  view.setUint16(2, 1, true);     // type: 1 = ICO
  view.setUint16(4, sizes.length, true);

  // Directory entries
  sizes.forEach((size, i) => {
    const base = 6 + i * 16;
    view.setUint8(base + 0, size >= 256 ? 0 : size);   // width (0 = 256)
    view.setUint8(base + 1, size >= 256 ? 0 : size);   // height
    view.setUint8(base + 2, 0);  // color count
    view.setUint8(base + 3, 0);  // reserved
    view.setUint16(base + 4, 1, true);  // color planes
    view.setUint16(base + 6, 32, true); // bit count
    view.setUint32(base + 8, pngBuffers[i].length, true);
    view.setUint32(base + 12, offsets[i], true);
  });

  // PNG data
  let pos = totalDirSize;
  for (const buf of pngBuffers) {
    bytes.set(buf, pos);
    pos += buf.length;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}

// ─── State ────────────────────────────────────────────────────────────────────
let generatedManifest = null;
let generatedIcoBlob = null;
let generatedIconCanvases = {};
let generatedMaskableCanvases = {};
let generatedAppleCanvases = {};

// ─── Generate ─────────────────────────────────────────────────────────────────
async function generate() {
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.classList.add('hidden');

  const appName = document.getElementById('appName').value.trim();
  if (!appName) {
    showError('App Name is required.');
    return;
  }
  if (!sourceImage) {
    showError('Please upload an app icon image.');
    return;
  }

  const btn = document.getElementById('generateBtn');
  btn.textContent = 'Generating…';
  btn.disabled = true;

  try {
    // Resize standard icons
    generatedIconCanvases = {};
    for (const size of ICON_SIZES) {
      generatedIconCanvases[size] = resizeImage(sourceImage, size);
    }

    // Resize maskable icons (with safe-zone padding on background color)
    const bgColor = document.getElementById('bgColorHex').value || '#ffffff';
    generatedMaskableCanvases = {};
    for (const size of MASKABLE_ICON_SIZES) {
      generatedMaskableCanvases[size] = resizeImageMaskable(sourceImage, size, bgColor);
    }

    // Resize Apple touch icons
    generatedAppleCanvases = {};
    for (const size of APPLE_TOUCH_SIZES) {
      generatedAppleCanvases[size] = resizeImage(sourceImage, size);
    }

    // Build icon list for manifest — separate entries for "any" and "maskable"
    const icons = [];
    for (const size of ICON_SIZES) {
      icons.push({
        src: `icons/icon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'any'
      });
    }
    for (const size of MASKABLE_ICON_SIZES) {
      icons.push({
        src: `icons/maskable/icon-maskable-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: 'image/png',
        purpose: 'maskable'
      });
    }

    // Build manifest
    const manifest = {
      name: appName,
    };

    const shortName = document.getElementById('shortName').value.trim();
    if (shortName) manifest.short_name = shortName;

    const id = document.getElementById('id').value.trim();
    if (id) manifest.id = id;

    const description = document.getElementById('description').value.trim();
    if (description) manifest.description = description;

    manifest.start_url = document.getElementById('startUrl').value.trim() || '/';
    manifest.scope = document.getElementById('scope').value.trim() || '/';
    manifest.display = document.getElementById('display').value;
    manifest.orientation = document.getElementById('orientation').value;
    manifest.theme_color = document.getElementById('themeColorHex').value || '#6366f1';
    manifest.background_color = document.getElementById('bgColorHex').value || '#ffffff';
    manifest.lang = document.getElementById('lang').value.trim() || 'en';
    manifest.dir = document.getElementById('dir').value;
    manifest.icons = icons;

    if (selectedCategories.size > 0) {
      manifest.categories = Array.from(selectedCategories);
    }

    const screenshots = getScreenshots();
    if (screenshots.length > 0) manifest.screenshots = screenshots;

    generatedManifest = manifest;

    // Render manifest JSON
    document.getElementById('manifestOutput').textContent = JSON.stringify(manifest, null, 2);

    // HTML snippet
    document.getElementById('htmlOutput').textContent = buildHtmlSnippet(manifest);

    // Render icons grids
    renderIconsGrid();
    renderMaskableIconsGrid();
    renderAppleIconsGrid();

    // Favicon canvases
    const faviconSizes = [16, 32, 48, 192];
    for (const size of faviconSizes) {
      const canvas = document.getElementById(`favicon${size}`);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(sourceImage, 0, 0, size, size);
      }
    }

    // Build ICO blob
    generatedIcoBlob = await buildIco(sourceImage, [16, 32, 48]);

    // Show output
    document.getElementById('outputPlaceholder').classList.add('hidden');
    document.getElementById('outputPanel').classList.remove('hidden');
    document.getElementById('summaryIconCount').textContent =
      ICON_SIZES.length + MASKABLE_ICON_SIZES.length + APPLE_TOUCH_SIZES.length;

  } catch (err) {
    showError('Generation failed: ' + err.message);
    console.error(err);
  } finally {
    btn.textContent = 'Generate Files';
    btn.disabled = false;
  }
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ─── HTML Snippet builder ─────────────────────────────────────────────────────
function buildHtmlSnippet(manifest) {
  const lines = [
    `<!-- PWA Manifest -->`,
    `<link rel="manifest" href="/manifest.json" />`,
    ``,
    `<!-- Theme color -->`,
    `<meta name="theme-color" content="${manifest.theme_color}" />`,
    ``,
    `<!-- Favicon -->`,
    `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />`,
    ``,
    `<!-- Apple / iOS -->`,
    `<meta name="apple-mobile-web-app-capable" content="yes" />`,
    `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`,
    `<meta name="apple-mobile-web-app-title" content="${manifest.short_name || manifest.name}" />`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple/apple-touch-icon-180x180.png" />`,
    `<link rel="apple-touch-icon" sizes="167x167" href="/icons/apple/apple-touch-icon-167x167.png" />`,
    `<link rel="apple-touch-icon" sizes="152x152" href="/icons/apple/apple-touch-icon-152x152.png" />`,
    `<link rel="apple-touch-icon" sizes="120x120" href="/icons/apple/apple-touch-icon-120x120.png" />`,
    ``,
    `<!-- Description & name -->`,
    `<meta name="application-name" content="${manifest.name}" />`,
  ];
  if (manifest.description) {
    lines.push(`<meta name="description" content="${manifest.description}" />`);
  }
  lines.push(
    ``,
    `<!-- Microsoft Tiles -->`,
    `<meta name="msapplication-TileColor" content="${manifest.background_color}" />`,
    `<meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />`
  );
  return lines.join('\n');
}

// ─── Icons grid ───────────────────────────────────────────────────────────────
function renderIconsGrid() {
  const grid = document.getElementById('iconsGrid');
  grid.innerHTML = '';
  ICON_SIZES.forEach(size => {
    const canvas = generatedIconCanvases[size];
    const displaySize = Math.min(size, 96);
    const card = document.createElement('div');
    card.className = 'bg-gray-50 dark:bg-gray-950 rounded-lg p-3 flex flex-col items-center gap-2';
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = displaySize;
    displayCanvas.height = displaySize;
    displayCanvas.className = 'rounded';
    const ctx = displayCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, displaySize, displaySize);
    card.appendChild(displayCanvas);
    const label = document.createElement('span');
    label.className = 'text-xs text-gray-500 dark:text-gray-400 font-mono';
    label.textContent = `${size}×${size}`;
    card.appendChild(label);
    const dlBtn = document.createElement('button');
    dlBtn.className = 'text-xs text-indigo-500 hover:underline';
    dlBtn.textContent = 'Download';
    dlBtn.onclick = () => downloadIcon(size);
    card.appendChild(dlBtn);
    grid.appendChild(card);
  });
}

function renderMaskableIconsGrid() {
  const grid = document.getElementById('maskableIconsGrid');
  grid.innerHTML = '';
  MASKABLE_ICON_SIZES.forEach(size => {
    const canvas = generatedMaskableCanvases[size];
    const displaySize = Math.min(size, 96);
    const card = document.createElement('div');
    card.className = 'bg-gray-50 dark:bg-gray-950 rounded-lg p-3 flex flex-col items-center gap-2';
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = displaySize;
    displayCanvas.height = displaySize;
    displayCanvas.className = 'rounded-full'; // show circle to simulate adaptive icon mask
    const ctx = displayCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, displaySize, displaySize);
    card.appendChild(displayCanvas);
    const label = document.createElement('span');
    label.className = 'text-xs text-gray-500 dark:text-gray-400 font-mono';
    label.textContent = `${size}×${size}`;
    card.appendChild(label);
    const dlBtn = document.createElement('button');
    dlBtn.className = 'text-xs text-indigo-500 hover:underline';
    dlBtn.textContent = 'Download';
    dlBtn.onclick = () => {
      canvasToBlob(canvas).then(blob => triggerDownload(blob, `icon-maskable-${size}x${size}.png`));
    };
    card.appendChild(dlBtn);
    grid.appendChild(card);
  });
}

function renderAppleIconsGrid() {
  const grid = document.getElementById('appleIconsGrid');
  grid.innerHTML = '';
  APPLE_TOUCH_SIZES.forEach(size => {
    const canvas = generatedAppleCanvases[size];
    const displaySize = Math.min(size, 96);
    const card = document.createElement('div');
    card.className = 'bg-gray-50 dark:bg-gray-950 rounded-lg p-3 flex flex-col items-center gap-2';
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = displaySize;
    displayCanvas.height = displaySize;
    displayCanvas.className = 'rounded-2xl'; // approximate iOS icon shape
    const ctx = displayCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, displaySize, displaySize);
    card.appendChild(displayCanvas);
    const label = document.createElement('span');
    label.className = 'text-xs text-gray-500 dark:text-gray-400 font-mono';
    label.textContent = `${size}×${size}`;
    card.appendChild(label);
    const dlBtn = document.createElement('button');
    dlBtn.className = 'text-xs text-indigo-500 hover:underline';
    dlBtn.textContent = 'Download';
    dlBtn.onclick = () => {
      canvasToBlob(canvas).then(blob => triggerDownload(blob, `apple-touch-icon-${size}x${size}.png`));
    };
    card.appendChild(dlBtn);
    grid.appendChild(card);
  });
}

// ─── Downloads ────────────────────────────────────────────────────────────────
function downloadManifest() {
  if (!generatedManifest) return;
  const blob = new Blob([JSON.stringify(generatedManifest, null, 2)], { type: 'application/json' });
  triggerDownload(blob, 'manifest.json');
}

function downloadFavicon() {
  if (!generatedIcoBlob) return;
  triggerDownload(generatedIcoBlob, 'favicon.ico');
}

function downloadIcon(size) {
  const canvas = generatedIconCanvases[size];
  if (!canvas) return;
  canvas.toBlob(blob => triggerDownload(blob, `icon-${size}x${size}.png`), 'image/png');
}

async function downloadAllIcons() {
  if (!Object.keys(generatedIconCanvases).length) return;
  const zip = new JSZip();
  const folder = zip.folder('icons');
  const maskableFolder = folder.folder('maskable');
  const appleFolder = folder.folder('apple');

  const promises = [
    ...ICON_SIZES.map(size =>
      canvasToBlob(generatedIconCanvases[size]).then(b => b.arrayBuffer()).then(buf =>
        folder.file(`icon-${size}x${size}.png`, buf)
      )
    ),
    ...MASKABLE_ICON_SIZES.map(size =>
      canvasToBlob(generatedMaskableCanvases[size]).then(b => b.arrayBuffer()).then(buf =>
        maskableFolder.file(`icon-maskable-${size}x${size}.png`, buf)
      )
    ),
    ...APPLE_TOUCH_SIZES.map(size =>
      canvasToBlob(generatedAppleCanvases[size]).then(b => b.arrayBuffer()).then(buf =>
        appleFolder.file(`apple-touch-icon-${size}x${size}.png`, buf)
      )
    ),
  ];
  await Promise.all(promises);
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, 'icons.zip');
}

async function downloadAll() {
  if (!generatedManifest) return;
  const zip = new JSZip();

  // manifest.json
  zip.file('manifest.json', JSON.stringify(generatedManifest, null, 2));

  // HTML snippet
  zip.file('pwa-head-snippet.html', buildHtmlSnippet(generatedManifest));

  // Icons
  const iconFolder = zip.folder('icons');
  const maskableFolder = iconFolder.folder('maskable');
  const appleFolder = iconFolder.folder('apple');
  await Promise.all([
    ...ICON_SIZES.map(size =>
      canvasToBlob(generatedIconCanvases[size]).then(b => b.arrayBuffer()).then(buf =>
        iconFolder.file(`icon-${size}x${size}.png`, buf)
      )
    ),
    ...MASKABLE_ICON_SIZES.map(size =>
      canvasToBlob(generatedMaskableCanvases[size]).then(b => b.arrayBuffer()).then(buf =>
        maskableFolder.file(`icon-maskable-${size}x${size}.png`, buf)
      )
    ),
    ...APPLE_TOUCH_SIZES.map(size =>
      canvasToBlob(generatedAppleCanvases[size]).then(b => b.arrayBuffer()).then(buf =>
        appleFolder.file(`apple-touch-icon-${size}x${size}.png`, buf)
      )
    ),
  ]);

  // favicon.ico
  if (generatedIcoBlob) {
    zip.file('favicon.ico', await generatedIcoBlob.arrayBuffer());
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const appName = (generatedManifest.name || 'pwa').toLowerCase().replace(/\s+/g, '-');
  triggerDownload(blob, `${appName}-pwa-assets.zip`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ─── Clipboard ────────────────────────────────────────────────────────────────
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => showToast());
}

function showToast() {
  const toast = document.getElementById('copyToast');
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2000);
}
