"use client";

const FONT_OPTIONS = [
  "Montserrat",
  "Inter",
  "Poppins",
  "Oswald",
  "Bebas Neue",
  "Anton",
  "Archivo Black",
  "Barlow Condensed",
  "Roboto",
  "Roboto Condensed",
  "Open Sans",
  "Raleway",
  "Work Sans",
  "Playfair Display",
  "Lora",
  "DM Sans",
  "Space Grotesk",
  "Manrope",
  "Figtree",
  "Outfit",
];

type TopBarProps = {
  inputDir: string;
  coverCount: number;
  fontFamily: string;
  onFontChange: (font: string) => void;
  onExport: () => void;
  isExporting: boolean;
};

export function TopBar({
  inputDir,
  coverCount,
  fontFamily,
  onFontChange,
  onExport,
  isExporting,
}: TopBarProps) {
  const options = Array.from(new Set([fontFamily, ...FONT_OPTIONS]));

  return (
    <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
      <div>
        <h1 className="text-lg font-bold">Cover Designer</h1>
        <p className="text-xs text-zinc-500 truncate max-w-[60ch]">
          {inputDir} · {coverCount} {coverCount === 1 ? "image" : "images"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs text-zinc-500 flex items-center gap-2">
          Font
          <select
            value={fontFamily}
            onChange={(e) => onFontChange(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
          >
            {options.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={onExport}
          disabled={coverCount === 0 || isExporting}
          className="px-4 py-2 text-sm rounded bg-[var(--color-accent)] text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-40"
        >
          {isExporting ? "Exporting..." : "Export JPEGs"}
        </button>
      </div>
    </div>
  );
}
