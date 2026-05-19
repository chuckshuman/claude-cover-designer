# claude-cover-designer

A local dashboard for batch-designing branded cover images. Point it at a folder of photos, type your text per image, click Export — out comes a folder of 1080×1920 JPEGs.

No accounts, no APIs, no cloud, no API keys. Just a tiny Next.js app that reads from your filesystem and writes back to it.

## Quick start

```bash
git clone https://github.com/chuckshuman/claude-cover-designer.git
cd claude-cover-designer
npm install
npm run build
npm run cover -- ~/path/to/your/photos
```

Then open http://localhost:3000.

For development with hot reload, use `npm run cover:dev -- ~/path/to/your/photos`.

## What it does

1. Scans your folder for `.jpg`, `.jpeg`, `.png`, `.webp`, `.heic` files.
2. Boots a local dashboard with one card per image. Each card has a live preview, editable header + subtitle, font-size sliders, color pickers, and pan/zoom controls for the background image.
3. Saves your edits as you type to `<your-folder>/.cover-designer/state.json` — fully resumable.
4. When you click **Export**, renders all covers as 1080×1920 JPEGs into `<your-folder>/_covers/`.

## Using with Claude Code

This repo ships a Claude Code skill at `.claude/skills/cover-designer.md`. With Claude Code installed, you can say things like:

> "Design covers for the photos in ~/my-shoot"

and Claude will inspect the images, generate suggested header + subtitle copy for each one, seed the state file, and launch the dashboard. You just refine the suggestions and export — no API key needed because Claude is already running.

## How state is persisted

State lives entirely in your image folder:

```
your-folder/
├── photo1.jpg
├── photo2.jpg
├── .cover-designer/
│   └── state.json          ← all your edits, per-image overrides, global style
└── _covers/                ← rendered output (created on export)
    ├── photo1.jpg
    └── photo2.jpg
```

Delete `.cover-designer/` to start over. Delete `_covers/` to re-render.

## Configuration

There is no `.env` file. The CLI passes one variable to Next.js:

- `COVER_INPUT_DIR` — absolute path to your image folder (set automatically by the CLI)
- `PORT` — port to bind, defaults to `3000`

## Stack

- Next.js (App Router)
- React 19
- Tailwind v4
- `satori` + `sharp` for server-side rendering

## License

MIT — see [LICENSE](./LICENSE).
