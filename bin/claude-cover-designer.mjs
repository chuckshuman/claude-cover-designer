#!/usr/bin/env node
import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function printHelp() {
  console.log(`
claude-cover-designer — local dashboard for batch cover image design

Usage:
  claude-cover-designer <image-dir> [--dev] [--port <port>]

Arguments:
  <image-dir>   Folder containing your source images (.jpg, .png, .webp, .heic)

Options:
  --dev         Run Next.js in dev mode (slower, hot reload)
  --port N      Port to bind (default 3000)
  -h, --help    Show this help
`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
  printHelp();
  process.exit(args.length === 0 ? 1 : 0);
}

let dev = false;
let port = "3000";
const positional = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--dev") dev = true;
  else if (a === "--port") port = args[++i];
  else positional.push(a);
}

if (positional.length !== 1) {
  console.error("Error: expected exactly one positional argument (the image directory)");
  printHelp();
  process.exit(1);
}

const inputDir = path.resolve(positional[0]);
try {
  const s = await stat(inputDir);
  if (!s.isDirectory()) throw new Error(`${inputDir} is not a directory`);
} catch (err) {
  console.error(`Error: cannot read ${inputDir}: ${err.message}`);
  process.exit(1);
}

const env = {
  ...process.env,
  COVER_INPUT_DIR: inputDir,
  PORT: port,
};

const cmd = dev ? "dev" : "start";
console.log(`\n→ Cover Designer`);
console.log(`  Input:  ${inputDir}`);
console.log(`  Mode:   ${dev ? "development" : "production"}`);
console.log(`  URL:    http://localhost:${port}\n`);

const nextBin = path.join(repoRoot, "node_modules", ".bin", "next");
const child = spawn(nextBin, [cmd, "--port", port], {
  cwd: repoRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
