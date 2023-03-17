import tinycolor from "tinycolor2";

export type RGBA = [r: number, g: number, b: number, a: number];

export const getRGBAFromString = (rgbaStr: string | undefined): RGBA | undefined => {
  const matches = rgbaStr?.match(/rgba\((\d*), *(\d*), *(\d*), *((\d|\.)*)\)/)?.slice(0, -1);
  return matches ? (matches.slice(1).map(m => Number(m)) as RGBA) : undefined;
};

export const rgbaToString = (rgba: RGBA) => `rgba(${rgba.join(",")})`;

export const generateColorGradient = (
  colorStart: string,
  colorEnd: string,
  colorCount: number,
): string[] => {
  const { r: r1, g: g1, b: b1 } = tinycolor(colorStart).toRgb();
  const startRGB = [r1, g1, b1];
  const { r: r2, g: g2, b: b2 } = tinycolor(colorEnd).toRgb();
  const endRGB = [r2, g2, b2];

  const stepR = (endRGB[0] - startRGB[0]) / (colorCount - 1);
  const stepG = (endRGB[1] - startRGB[1]) / (colorCount - 1);
  const stepB = (endRGB[2] - startRGB[2]) / (colorCount - 1);

  const gradientColors = [];
  for (let i = 0; i < colorCount; i++) {
    const r = Math.round(startRGB[0] + stepR * i);
    const g = Math.round(startRGB[1] + stepG * i);
    const b = Math.round(startRGB[2] + stepB * i);
    const color = tinycolor({ r, g, b }).toHexString();
    gradientColors.push(color);
  }

  return gradientColors;
};
