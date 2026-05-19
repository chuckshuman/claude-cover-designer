import { readdir } from "node:fs/promises";
import path from "node:path";
import { IMAGE_EXTENSIONS } from "./types";

export async function scanImages(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return (IMAGE_EXTENSIONS as readonly string[]).includes(ext);
    })
    .filter((name) => !name.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
