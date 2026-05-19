export type Style = {
  fontFamily: string;
  fontWeight: number;
  headerSize: number;
  subtitleSize: number;
  textColor: string;
  shadowBlur: number;
  shadowColor: string;
};

export type FontSizeOverride = {
  header: number;
  subtitle: number;
};

export type PositionOverride = {
  yOffset: number;
};

export type ImageTransform = {
  scale: number;
  x: number;
  y: number;
};

export type Cover = {
  filename: string;
  headerText: string;
  subtitleText: string;
  fontSizeOverride: FontSizeOverride | null;
  positionOverride: PositionOverride | null;
  imageTransform: ImageTransform | null;
  headerColor: string | null;
  subtitleColor: string | null;
};

export type CoverState = {
  version: 1;
  style: Style;
  covers: Cover[];
};

export const DEFAULT_STYLE: Style = {
  fontFamily: "Montserrat",
  fontWeight: 800,
  headerSize: 120,
  subtitleSize: 48,
  textColor: "#ffffff",
  shadowBlur: 12,
  shadowColor: "rgba(0,0,0,0.6)",
};

export const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
] as const;
