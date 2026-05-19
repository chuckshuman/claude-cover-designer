import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_STYLE, type Cover, type CoverState, type Style } from "./types";
import { filenameToHeader } from "./filename";
import { scanImages } from "./scan";
import { getInputDir } from "./server-config";

const STATE_DIR = ".cover-designer";
const STATE_FILE = "state.json";

function statePath(inputDir: string): string {
  return path.join(inputDir, STATE_DIR, STATE_FILE);
}

function emptyCover(filename: string): Cover {
  return {
    filename,
    headerText: filenameToHeader(filename),
    subtitleText: "",
    fontSizeOverride: null,
    positionOverride: null,
    imageTransform: null,
    headerColor: null,
    subtitleColor: null,
  };
}

async function readRaw(inputDir: string): Promise<CoverState | null> {
  try {
    const raw = await readFile(statePath(inputDir), "utf8");
    const parsed = JSON.parse(raw) as CoverState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

let writeQueue: Promise<void> = Promise.resolve();

async function writeState(inputDir: string, state: CoverState): Promise<void> {
  const next = writeQueue.then(async () => {
    await mkdir(path.join(inputDir, STATE_DIR), { recursive: true });
    await writeFile(statePath(inputDir), JSON.stringify(state, null, 2), "utf8");
  });
  writeQueue = next.catch(() => {});
  return next;
}

export async function loadState(): Promise<CoverState> {
  const inputDir = getInputDir();
  const existing = await readRaw(inputDir);
  const files = await scanImages(inputDir);

  const byName = new Map<string, Cover>();
  for (const c of existing?.covers ?? []) {
    byName.set(c.filename, c);
  }

  const covers: Cover[] = files.map((name) => byName.get(name) ?? emptyCover(name));

  const state: CoverState = {
    version: 1,
    style: existing?.style ?? DEFAULT_STYLE,
    covers,
  };

  const changed =
    !existing ||
    existing.covers.length !== covers.length ||
    existing.covers.some((c, i) => c.filename !== covers[i].filename);
  if (changed) await writeState(inputDir, state);

  return state;
}

export async function updateCover(
  filename: string,
  updates: Partial<Cover>
): Promise<Cover | null> {
  const inputDir = getInputDir();
  const state = (await readRaw(inputDir)) ?? (await loadState());
  const idx = state.covers.findIndex((c) => c.filename === filename);
  if (idx === -1) return null;
  state.covers[idx] = { ...state.covers[idx], ...updates, filename };
  await writeState(inputDir, state);
  return state.covers[idx];
}

export async function updateStyle(updates: Partial<Style>): Promise<Style> {
  const inputDir = getInputDir();
  const state = (await readRaw(inputDir)) ?? (await loadState());
  state.style = { ...state.style, ...updates };
  await writeState(inputDir, state);
  return state.style;
}
