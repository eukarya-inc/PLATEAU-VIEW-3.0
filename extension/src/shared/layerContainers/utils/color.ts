export const colorWithAlpha = (
  color: string | undefined,
  alpha: number | undefined,
): string | undefined => {
  if (!color || alpha === undefined) return color;
  if (color.length === 7) {
    return (
      color +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")
    );
  } else if (color.length === 9) {
    return (
      color.slice(0, 7) +
      Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0")
    );
  }
  return color;
};
