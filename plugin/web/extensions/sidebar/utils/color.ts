export type RGBA = [r: number, g: number, b: number, a: number];

export const getRGBAFromString = (rgbaStr: string | undefined): RGBA | undefined => {
  const matches = rgbaStr?.match(/rgba\((\d*), *(\d*), *(\d*), *((\d|\.)*)\)/)?.slice(0, -1);
  return matches ? (matches.slice(1).map(m => Number(m)) as RGBA) : undefined;
};

export const rgbaToString = (rgba: RGBA) => `rgba(${rgba.join(",")})`;
