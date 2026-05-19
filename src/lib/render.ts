import { readFile } from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";
import type { ReactNode } from "react";
import type { Cover, Style } from "./types";
import { resolveSafeFile } from "./server-config";

const WIDTH = 1080;
const HEIGHT = 1920;

export type CoverFontData = {
  header: ArrayBuffer;
  subtitle: ArrayBuffer;
};

export async function renderCover(
  cover: Cover,
  style: Style,
  fontData: CoverFontData
): Promise<Buffer> {
  const headerSize = cover.fontSizeOverride?.header ?? style.headerSize;
  const subtitleSize = cover.fontSizeOverride?.subtitle ?? style.subtitleSize;
  const yOffset = cover.positionOverride?.yOffset ?? 0;

  const headerColor = cover.headerColor ?? style.textColor;
  const subtitleColor = cover.subtitleColor ?? style.textColor;

  const transform = cover.imageTransform ?? { scale: 1, x: 50, y: 50 };

  const layerW = Math.round(WIDTH * transform.scale);
  const layerH = Math.round(HEIGHT * transform.scale);
  const bgLeft = ((WIDTH - layerW) * transform.x) / 100;
  const bgTop = ((HEIGHT - layerH) * transform.y) / 100;

  let bgDataUri = "";
  try {
    const srcBuf = await readFile(resolveSafeFile(cover.filename));
    const compressed = await sharp(srcBuf)
      .rotate()
      .resize(layerW, layerH, { fit: "cover", position: "centre" })
      .jpeg({ quality: 85 })
      .toBuffer();
    bgDataUri = `data:image/jpeg;base64,${compressed.toString("base64")}`;
  } catch {
    bgDataUri = "";
  }

  const shadow = `0 0 ${style.shadowBlur}px ${style.shadowColor}, 0 0 ${style.shadowBlur * 2}px ${style.shadowColor}`;

  const children: unknown[] = [];
  if (bgDataUri) {
    children.push({
      type: "img",
      props: {
        src: bgDataUri,
        width: layerW,
        height: layerH,
        style: {
          position: "absolute",
          left: bgLeft,
          top: bgTop,
        },
      },
    });
  }

  const textGroup = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        marginTop: yOffset,
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", width: WIDTH - 160, justifyContent: "center" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    maxWidth: WIDTH - 160,
                    fontSize: headerSize,
                    fontWeight: style.fontWeight,
                    color: headerColor,
                    textAlign: "center",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                    textShadow: shadow,
                  },
                  children: cover.headerText,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", width: WIDTH - 200, justifyContent: "center", marginTop: 24 },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    maxWidth: WIDTH - 200,
                    fontSize: subtitleSize,
                    fontWeight: 500,
                    color: subtitleColor,
                    textAlign: "center",
                    textShadow: shadow,
                  },
                  children: cover.subtitleText,
                },
              },
            ],
          },
        },
      ],
    },
  };
  children.push(textGroup);

  const tree = {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        backgroundColor: "#000",
      },
      children,
    },
  };

  const svg = await satori(tree as unknown as ReactNode, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: style.fontFamily,
        data: fontData.header,
        weight: style.fontWeight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
        style: "normal",
      },
      {
        name: style.fontFamily,
        data: fontData.subtitle,
        weight: 500,
        style: "normal",
      },
    ],
  });

  return sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer();
}

export async function loadGoogleFont(
  fontFamily: string,
  weight: number
): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@${weight}&display=swap`;
  const cssRes = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36",
    },
  });
  const css = await cssRes.text();

  const truetypeMatch = css.match(/url\(([^)]+)\)\s*format\(['"]truetype['"]\)/);
  const anyMatch = css.match(/url\((https?:\/\/[^)]+\.ttf)\)/) ?? css.match(/url\(([^)]+)\)/);
  const urlMatch = truetypeMatch ?? anyMatch;
  if (!urlMatch) {
    throw new Error(`Could not load font: ${fontFamily} (weight ${weight})`);
  }

  const fontRes = await fetch(urlMatch[1]);
  return fontRes.arrayBuffer();
}
