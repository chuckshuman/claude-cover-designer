import path from "node:path";

export function getInputDir(): string {
  const dir = process.env.COVER_INPUT_DIR;
  if (!dir) {
    throw new Error(
      "COVER_INPUT_DIR is not set. Launch via `claude-cover-designer <path>` or set the env var manually."
    );
  }
  return path.resolve(dir);
}

export function resolveSafeFile(filename: string): string {
  const inputDir = getInputDir();
  const resolved = path.resolve(inputDir, filename);
  if (!resolved.startsWith(inputDir + path.sep) && resolved !== inputDir) {
    throw new Error(`Path escape blocked: ${filename}`);
  }
  return resolved;
}
