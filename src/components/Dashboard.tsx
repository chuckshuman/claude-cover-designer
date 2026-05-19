"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { CoverGrid } from "./CoverGrid";
import type { Cover, CoverState } from "@/lib/types";

type DashboardProps = {
  initialState: CoverState;
  inputDir: string;
};

export function Dashboard({ initialState, inputDir }: DashboardProps) {
  const [covers, setCovers] = useState<Cover[]>(initialState.covers);
  const [style, setStyle] = useState(initialState.style);
  const [isExporting, setIsExporting] = useState(false);

  const handleUpdate = async (filename: string, updates: Partial<Cover>) => {
    setCovers((prev) =>
      prev.map((c) => (c.filename === filename ? { ...c, ...updates } : c))
    );
    await fetch(`/api/covers/${encodeURIComponent(filename)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const handleFontChange = async (font: string) => {
    setStyle((prev) => ({ ...prev, fontFamily: font }));
    await fetch("/api/style", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fontFamily: font }),
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(`Export failed: ${data.error ?? "unknown error"}`);
        return;
      }
      alert(
        `Exported ${data.count}/${data.total} JPEGs to:\n\n${data.folder}` +
          (data.errors?.length ? `\n\nErrors: ${data.errors.length}` : "")
      );
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const fontHref = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    style.fontFamily
  )}:wght@400;500;700;800;900&display=swap`;

  return (
    <div className="min-h-screen">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href={fontHref} />
      <TopBar
        inputDir={inputDir}
        coverCount={covers.length}
        fontFamily={style.fontFamily}
        onFontChange={handleFontChange}
        onExport={handleExport}
        isExporting={isExporting}
      />
      <div className="p-6">
        <CoverGrid covers={covers} style={style} onUpdate={handleUpdate} />
      </div>
    </div>
  );
}
