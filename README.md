# Maknun Ahmed Sifat — static portfolio

## Files

```text
index.html
css/style.css
js/script.js
resources/profile.jpg
cv.pdf                 # add your current CV here
```

The site is static HTML, CSS, and vanilla JavaScript. Three.js is loaded from a pinned jsDelivr URL in `index.html`; Google Fonts are the only other external requests. The classic script build is intentional so the page also works when opening `index.html` directly from your file system.

## Run locally

From this folder, run `python -m http.server 8000`, then open `http://localhost:8000`. You can also double-click `index.html`; a local server is recommended for the most reliable browser behavior.

Replace `resources/profile.jpg` with the photo you want to use. Add the downloadable CV as `cv.pdf` at the repository root. The existing project images are used only as visual assets; all project names, awards, descriptions, dates, and links come from the latest CV.

## Deploy on GitHub Pages

1. Create a GitHub repository and upload this folder, including `index.html`, `css`, `js`, `resources`, and `cv.pdf`.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Open the published URL shown by GitHub Pages. No build command or environment variables are required.

To deploy on Netlify or Vercel, import the repository and leave the build command empty; set the publish/output directory to the repository root.

## Underwater descent feature

The depth experience is isolated in `css/descent.css` and `js/descent.js`. Edit `DESCENT_CONFIG` at the top of `js/descent.js` to change the 0–11,000 m pacing, section-to-zone targets, zone colors, easing, and particle counts. The current mapping is: hero/about = Surface, awards = Sunlight Zone, experience = Twilight Zone, projects = Midnight Zone, research/education = Abyssal Zone, skills/contact = Hadal Trench.

## Zone video backgrounds

The video layer is isolated in `css/video-bg.css` and `js/video-bg.js`. Videos are rendered behind the procedural canvas and consume the existing `descent:update` depth event. Current files:

```text
resources/
  Surface.mp4
  Sunlight.mp4
  Twilight Zone.mp4
  Midnight Zone.mp4
  Abyssal Zone.mp4
  Hadal Trench.mp4
```

All six zones are enabled and mapped to the matching files in `resources/`. Optional `.webm`, `-720.mp4`, and poster files can be added later; the loader falls back to the listed MP4 when they are not present. Missing enabled clips log a warning and leave the procedural background active.

The shared depth source is `DESCENT_CONFIG` in `js/descent.js`. Its `sectionSelector`, `startDepth`, and `endDepth` values drive the gauge, readouts, procedural background, and video fades together. Add `?debug=1` to the URL to show the synchronized depth and video opacity values.

## Hero profile image

The hero visual uses `resources/profile.jpg` instead of the heavy BlueROV2 3D asset, keeping the page and video background responsive. The BlueROV2 CAD files remain in `resources/bluerov2-1.snapshot.1/` for future use but are not loaded by the browser.
