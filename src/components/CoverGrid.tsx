"use client";

import { CoverCard } from "./CoverCard";
import type { Cover, Style } from "@/lib/types";

type CoverGridProps = {
  covers: Cover[];
  style: Style;
  onUpdate: (filename: string, updates: Partial<Cover>) => void;
};

export function CoverGrid({ covers, style, onUpdate }: CoverGridProps) {
  if (!covers.length) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        No images found in this folder. Drop some images and refresh.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {covers.map((cover) => (
        <CoverCard
          key={cover.filename}
          cover={cover}
          style={style}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
