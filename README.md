# PWA Manifest Generator

A static, client-side tool for generating all the assets needed to make a Progressive Web App (PWA) installable — no server, no build step, just open `index.html`.

## Features

- **manifest.json** — fully-spec compliant, with all common fields
- **Icon set** — resizes your image to all standard PWA sizes: 72, 96, 128, 144, 152, 192, 384, 512 px (both `any` and `maskable` purposes where appropriate)
- **favicon.ico** — proper multi-resolution ICO file (16×16, 32×32, 48×48)
- **HTML snippet** — ready-to-paste `<head>` tags for manifest link, theme color, Apple touch icon, MS tile metadata
- **Download everything** — individual files or a single ZIP with all assets organised in the right folder structure
- **Light / dark mode** — respects system preference, toggle in the header

## Usage

1. Open `index.html` in any modern browser (Chrome, Firefox, Safari, Edge)
2. Upload your app icon (PNG/JPG/SVG, ideally 512×512 px or larger)
3. Fill in the fields:
   - **App Name** *(required)* — shown in the OS install dialog
   - **Short Name** — shown on the home screen under the icon (≤12 chars)
   - **Description** — used in app stores and browser install prompts
   - **Start URL / Scope** — URL the app opens to and the navigation scope
   - **Display** — `standalone` is the typical PWA mode
   - **Theme / Background Color** — splash screen and browser UI tint
   - **Categories, Screenshots** — optional, improve app store listings
4. Click **Generate Files**
5. Review the output tabs, then download individual files or click **Download Everything (ZIP)**

## Output structure (ZIP)

```
your-app-pwa-assets.zip
├── manifest.json
├── favicon.ico
├── pwa-head-snippet.html
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## Deployment

Copy the ZIP contents into the root of your web project, then paste the HTML snippet into your `<head>`. The `manifest.json` and `favicon.ico` must be served from the same origin as your app (or within the declared scope).

## Dependencies (loaded from CDN)

- [Tailwind CSS](https://tailwindcss.com/) — styling
- [JSZip](https://stuk.github.io/jszip/) — ZIP generation

No installation or build step required.

## Browser support

Requires a browser with Canvas API, `Blob`, `URL.createObjectURL`, and `Clipboard API` support — all modern browsers since 2020 qualify.
