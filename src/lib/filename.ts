export function filenameToHeader(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, "");
  const cleaned = stem
    .replace(/^[\d.\s_-]+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.toUpperCase() || stem.toUpperCase();
}
