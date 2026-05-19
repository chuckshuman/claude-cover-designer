"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_W = 1080;
const CANVAS_H = 1920;

type CoverPreviewProps = {
  rawImageUrl: string;
  headerText: string;
  subtitleText: string;
  fontFamily: string;
  fontWeight: number;
  headerSize: number;
  subtitleSize: number;
  headerColor: string;
  subtitleColor: string;
  shadowBlur: number;
  shadowColor: string;
  yOffset?: number;
  scale?: number;
  bgX?: number;
  bgY?: number;
};

export function CoverPreview({
  rawImageUrl,
  headerText,
  subtitleText,
  fontFamily,
  fontWeight,
  headerSize,
  subtitleSize,
  headerColor,
  subtitleColor,
  shadowBlur,
  shadowColor,
  yOffset = 0,
  scale = 1,
  bgX = 50,
  bgY = 50,
}: CoverPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setFit(el.clientWidth);
    });
    ro.observe(el);
    setFit(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const shadow = `0 0 ${shadowBlur}px ${shadowColor}, 0 0 ${shadowBlur * 2}px ${shadowColor}`;
  const fitScale = fit > 0 ? fit / CANVAS_W : 0;

  const layerW = CANVAS_W * scale;
  const layerH = CANVAS_H * scale;
  const bgLeft = ((CANVAS_W - layerW) * bgX) / 100;
  const bgTop = ((CANVAS_H - layerH) * bgY) / 100;

  return (
    <div
      ref={containerRef}
      className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-zinc-950"
    >
      {fit > 0 && (
        <div
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${fitScale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {rawImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rawImageUrl}
              alt=""
              style={{
                position: "absolute",
                left: bgLeft,
                top: bgTop,
                width: layerW,
                height: layerH,
                objectFit: "cover",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 80,
              marginTop: yOffset,
            }}
          >
            <div
              style={{
                fontFamily: `"${fontFamily}", sans-serif`,
                fontWeight,
                fontSize: headerSize,
                color: headerColor,
                textAlign: "center",
                lineHeight: 1.1,
                textTransform: "uppercase",
                textShadow: shadow,
              }}
            >
              {headerText}
            </div>
            <div
              style={{
                fontFamily: `"${fontFamily}", sans-serif`,
                fontWeight: 500,
                fontSize: subtitleSize,
                color: subtitleColor,
                textAlign: "center",
                marginTop: 24,
                textShadow: shadow,
              }}
            >
              {subtitleText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
