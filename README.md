# Blueprint Archive

The public-facing portfolio and template vault for **Blueprint Studio**, an independent web design and development project.

**[Explore the repository](https://github.com/Link9060/Blueprint-Archive)**

## What's built

- **Floor 00: Entrance** — an interactive archive directory and landing section.
- **Floor 01: Team Systems** — Blueprint Teams showcase with a representative dashboard mockup and project details. The underlying team app is a separate project.
- **Floor 02: Commerce** — Cat's Corner early design concept. This is **not** a finished or approved client site.
- **Floor 03: Blueprints** — template previews: [MONO](templates/mono/index.html) and [SIGNAL](templates/signal/index.html), plus a clearly labeled FORGE placeholder.
- **Floor 04: Studio** — project brief builder with a copy-to-clipboard action.

Includes responsive layout, scroll-aware floor indicators, reduced-motion support, semantic HTML, dialogs and keyboard-accessible controls. Built without a framework, package manager or backend.

## Repository layout

```text
.
├── index.html                # Archive landing site
├── styles.css                # Archive design system / responsive styles
├── script.js                 # Scroll, dialogs, brief copy
├── templates/
│   ├── mono/index.html      # Portfolio layout demo
│   └── signal/index.html    # Studio / business layout demo
├── .nojekyll                 # GitHub Pages: serve static assets directly
└── README.md
```

## Publish with GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose branch **main**, folder **/(root)**, then **Save**.
4. After GitHub Pages publishes, the expected URL is `https://link9060.github.io/Blueprint-Archive/`.

All internal assets and demo links use relative paths, so the site works at the repository subpath. You can also open `index.html` directly from your computer for an initial preview.

## Important status notes

- **Project cards**: Blueprint Teams is in development and Cat's Corner is a proposed concept. Visuals are illustrative, not actual production screenshots.
- **Template previews**: MONO and SIGNAL have functioning demo pages, but they are not yet packaged as publicly downloadable commercial products. All content on those demo pages is placeholder copy.
- **FORGE**: planned advanced template. There is no payment or purchase flow.
- **Project brief**: the form validates fields and **copies the brief locally**. It does not send an email, save data, or collect leads. Add a verified contact endpoint before calling it a working inquiry form.

## Edit guide

- **Project names and copy**: `index.html`, in the `#projects` and `#commerce` sections.
- **Add more floors**: duplicate a `section.floor` with a unique ID and update the floor rail and JS selectors.
- **Templates**: each demo is a self-contained HTML file under `templates/`.
- **Styling**: main-site colors and layout live in `styles.css`. Each template has its own in-page CSS.
- **Studio contact workflow**: `#brief-form` in `index.html`, copy behavior in `script.js`.

## Recommended next steps

1. Add real project screenshots and a project detail page after Blueprint Teams has a stable build.
2. Confirm a final Cat's Corner brief before representing any design as client-approved.
3. Connect an actual studio contact channel and server-side spam-protected inquiry flow.
4. Add downloadable template packages, clear license terms, and a payment platform only when ready to distribute.
5. Add design case studies and keyboard-friendly project filters as the archive grows.

The site deliberately avoids fabricated testimonials, fake completed projects, simulated pricing or unconfigured submissions.
