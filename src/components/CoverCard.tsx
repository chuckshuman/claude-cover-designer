"use client";

import { useState } from "react";
import { CoverPreview } from "./CoverPreview";
import type { Cover, Style, ImageTransform } from "@/lib/types";

type CoverCardProps = {
  cover: Cover;
  style: Style;
  onUpdate: (filename: string, updates: Partial<Cover>) => void;
};

const DEFAULT_TRANSFORM: ImageTransform = { scale: 1, x: 50, y: 50 };

export function CoverCard({ cover, style, onUpdate }: CoverCardProps) {
  const [headerText, setHeaderText] = useState(cover.headerText);
  const [subtitleText, setSubtitleText] = useState(cover.subtitleText);
  const [headerSize, setHeaderSize] = useState(
    cover.fontSizeOverride?.header ?? style.headerSize
  );
  const [subtitleSize, setSubtitleSize] = useState(
    cover.fontSizeOverride?.subtitle ?? style.subtitleSize
  );
  const [headerColor, setHeaderColor] = useState(
    cover.headerColor ?? style.textColor
  );
  const [subtitleColor, setSubtitleColor] = useState(
    cover.subtitleColor ?? style.textColor
  );
  const [transform, setTransform] = useState<ImageTransform>(
    cover.imageTransform ?? DEFAULT_TRANSFORM
  );
  const [yOffset, setYOffset] = useState(
    cover.positionOverride?.yOffset ?? 0
  );
  const [showImageControls, setShowImageControls] = useState(false);

  const persist = (overrides: Partial<Cover> = {}) => {
    onUpdate(cover.filename, {
      headerText,
      subtitleText,
      fontSizeOverride: { header: headerSize, subtitle: subtitleSize },
      headerColor,
      subtitleColor,
      imageTransform: transform,
      positionOverride: { yOffset },
      ...overrides,
    });
  };

  const updateTransform = (patch: Partial<ImageTransform>) => {
    setTransform({ ...transform, ...patch });
  };

  const rawImageUrl = `/api/raw/${encodeURIComponent(cover.filename)}`;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <CoverPreview
        rawImageUrl={rawImageUrl}
        headerText={headerText}
        subtitleText={subtitleText}
        fontFamily={style.fontFamily}
        fontWeight={style.fontWeight}
        headerSize={headerSize}
        subtitleSize={subtitleSize}
        headerColor={headerColor}
        subtitleColor={subtitleColor}
        shadowBlur={style.shadowBlur}
        shadowColor={style.shadowColor}
        yOffset={yOffset}
        scale={transform.scale}
        bgX={transform.x}
        bgY={transform.y}
      />

      <p className="text-sm text-zinc-400 truncate">{cover.filename}</p>

      <div className="space-y-2">
        <TextRow
          value={headerText}
          onChange={setHeaderText}
          onCommit={() => persist()}
          onUppercase={() => {
            const next = headerText.toUpperCase();
            setHeaderText(next);
            persist({ headerText: next });
          }}
          placeholder="Header text"
        />
        <TextRow
          value={subtitleText}
          onChange={setSubtitleText}
          onCommit={() => persist()}
          onUppercase={() => {
            const next = subtitleText.toUpperCase();
            setSubtitleText(next);
            persist({ subtitleText: next });
          }}
          placeholder="Subtitle text"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-zinc-500">
          Header: {headerSize}px
          <input
            type="range"
            min={36}
            max={180}
            value={headerSize}
            onChange={(e) => setHeaderSize(Number(e.target.value))}
            onMouseUp={() => persist()}
            onTouchEnd={() => persist()}
            className="w-full"
          />
        </label>
        <label className="text-xs text-zinc-500">
          Subtitle: {subtitleSize}px
          <input
            type="range"
            min={16}
            max={80}
            value={subtitleSize}
            onChange={(e) => setSubtitleSize(Number(e.target.value))}
            onMouseUp={() => persist()}
            onTouchEnd={() => persist()}
            className="w-full"
          />
        </label>
      </div>

      <label className="text-xs text-zinc-500 block">
        Text position: {yOffset > 0 ? `+${yOffset}` : yOffset}px
        <input
          type="range"
          min={-600}
          max={600}
          step={10}
          value={yOffset}
          onChange={(e) => setYOffset(Number(e.target.value))}
          onMouseUp={() => persist()}
          onTouchEnd={() => persist()}
          className="w-full"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <ColorField
          label="Header color"
          value={headerColor}
          onChange={setHeaderColor}
          onCommit={() => persist()}
        />
        <ColorField
          label="Subtitle color"
          value={subtitleColor}
          onChange={setSubtitleColor}
          onCommit={() => persist()}
        />
      </div>

      <button
        onClick={() => setShowImageControls((s) => !s)}
        className="w-full text-xs py-1.5 rounded border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
      >
        {showImageControls ? "Hide image controls" : "Adjust background image"}
      </button>

      {showImageControls && (
        <div className="space-y-2 pt-1">
          <label className="text-xs text-zinc-500 block">
            Zoom: {transform.scale.toFixed(2)}x
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={transform.scale}
              onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
              onMouseUp={() => persist()}
              onTouchEnd={() => persist()}
              className="w-full"
            />
          </label>
          <label className="text-xs text-zinc-500 block">
            X: {Math.round(transform.x)}%
            <input
              type="range"
              min={0}
              max={100}
              value={transform.x}
              onChange={(e) => updateTransform({ x: Number(e.target.value) })}
              onMouseUp={() => persist()}
              onTouchEnd={() => persist()}
              className="w-full"
            />
          </label>
          <label className="text-xs text-zinc-500 block">
            Y: {Math.round(transform.y)}%
            <input
              type="range"
              min={0}
              max={100}
              value={transform.y}
              onChange={(e) => updateTransform({ y: Number(e.target.value) })}
              onMouseUp={() => persist()}
              onTouchEnd={() => persist()}
              className="w-full"
            />
          </label>
          <button
            onClick={() => {
              setTransform(DEFAULT_TRANSFORM);
              persist({ imageTransform: DEFAULT_TRANSFORM });
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline"
          >
            Reset image
          </button>
        </div>
      )}
    </div>
  );
}

function TextRow({
  value,
  onChange,
  onCommit,
  onUppercase,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onUppercase: () => void;
  placeholder: string;
}) {
  return (
    <div className="flex gap-1.5">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        placeholder={placeholder}
        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
      />
      <button
        type="button"
        onClick={onUppercase}
        title="UPPERCASE"
        className="px-2 rounded border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  onCommit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
}) {
  return (
    <label className="text-xs text-zinc-500 block">
      {label}
      <div className="flex gap-1.5 mt-1">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          className="h-8 w-10 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onCommit}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[var(--color-accent)]"
        />
      </div>
    </label>
  );
}

function normalizeHex(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [r, g, b] = v.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#ffffff";
}
