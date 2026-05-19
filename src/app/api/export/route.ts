import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { loadState } from "@/lib/state";
import { renderCover, loadGoogleFont } from "@/lib/render";
import { getInputDir } from "@/lib/server-config";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function slug(name: string): string {
  const stem = name.replace(/\.[^.]+$/, "");
  return stem
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 120);
}

export async function POST() {
  try {
    const inputDir = getInputDir();
    const state = await loadState();
    if (!state.covers.length) {
      return NextResponse.json({ error: "No covers to export" }, { status: 400 });
    }

    const [headerFont, subtitleFont] = await Promise.all([
      loadGoogleFont(state.style.fontFamily, state.style.fontWeight),
      loadGoogleFont(state.style.fontFamily, 500),
    ]);
    const fontData = { header: headerFont, subtitle: subtitleFont };

    const outDir = path.join(inputDir, "_covers");
    await mkdir(outDir, { recursive: true });

    const written: string[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (const cover of state.covers) {
      try {
        const jpeg = await renderCover(cover, state.style, fontData);
        const outPath = path.join(outDir, `${slug(cover.filename)}.jpg`);
        await writeFile(outPath, jpeg);
        written.push(outPath);
      } catch (err) {
        errors.push({
          filename: cover.filename,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      folder: outDir,
      count: written.length,
      total: state.covers.length,
      files: written,
      errors,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
