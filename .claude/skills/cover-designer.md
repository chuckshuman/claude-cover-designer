---
name: cover-designer
description: Generate cover image text for a folder of photos and launch the local Cover Designer dashboard. Use when the user says "design covers for [folder]", "make cover images for these photos", "create thumbnails for /path/to/photos", or similar. Pairs Claude's vision and copywriting with the open-source claude-cover-designer dashboard.
---

# Cover Designer skill

You help the user create branded cover images for a batch of photos. The actual editing UI is the open-source [claude-cover-designer](https://github.com/chuckshuman/claude-cover-designer) Next.js app. Your job is to:

1. Read the photos in the folder the user pointed at.
2. Suggest a punchy header + subtitle for each one (you, the model, do this — there is no API call).
3. Seed `<folder>/.cover-designer/state.json` with the suggestions.
4. Launch the dashboard so the user can refine and export.

## Workflow

### 1. Confirm the target folder

If the user did not give a path, ask. Resolve `~` to the home directory. Validate the folder exists and contains image files.

### 2. List images

```
ls <folder> | grep -iE '\.(jpe?g|png|webp|heic)$'
```

Hold the list — sorted by natural name order — as your working set.

### 3. (Optional) Inspect the images

For best results, Read each image so you can suggest copy that matches the visual content. If there are many images (>20), sample 5 to learn the visual vibe and infer the rest from filenames.

### 4. Generate copy

For each image, produce:
- `headerText` — 1–5 UPPERCASE words. Punchy. Hook the viewer.
- `subtitleText` — a short line (3–10 words) that adds context. Lowercase / sentence case is fine.

Lean on the filename if it carries meaning (e.g. `before-after-kitchen.jpg` → header `BEFORE & AFTER`, subtitle `the kitchen reveal`).

### 5. Write state.json

Write the file at `<folder>/.cover-designer/state.json`:

```json
{
  "version": 1,
  "style": {
    "fontFamily": "Montserrat",
    "fontWeight": 800,
    "headerSize": 120,
    "subtitleSize": 48,
    "textColor": "#ffffff",
    "shadowBlur": 12,
    "shadowColor": "rgba(0,0,0,0.6)"
  },
  "covers": [
    {
      "filename": "IMG_0042.jpg",
      "headerText": "BEFORE & AFTER",
      "subtitleText": "Watch the transformation",
      "fontSizeOverride": null,
      "positionOverride": null,
      "imageTransform": null,
      "headerColor": null,
      "subtitleColor": null
    }
  ]
}
```

The `covers` array order should match the natural sort order of the filenames. Every image in the folder must appear once.

### 6. Launch the dashboard

From the claude-cover-designer repo root:

```
npm run cover -- <absolute-path-to-folder>
```

If the user does not have the repo cloned, instruct them:

```
git clone https://github.com/chuckshuman/claude-cover-designer.git
cd claude-cover-designer
npm install
npm run build
npm run cover -- <absolute-path-to-folder>
```

### 7. Hand off

Tell the user:
- Dashboard is at http://localhost:3000
- All your suggestions are pre-filled — they refine and click **Export**
- Output JPEGs land in `<folder>/_covers/`

## Notes

- Never ask the user for an API key. You (Claude) are the AI; there is no second LLM call.
- Do not modify images. The dashboard handles all rendering server-side via satori + sharp.
- If `.cover-designer/state.json` already exists, ask before overwriting. The user may have edits in flight.
