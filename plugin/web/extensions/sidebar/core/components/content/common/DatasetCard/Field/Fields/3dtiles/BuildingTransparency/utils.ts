export const getRGBAFromString = (rgbaStr: string | undefined) => {
  const matches = rgbaStr?.match(/rgba\((\d*), (\d*), (\d*), (\d*)\)/);
  return matches ? matches.slice(1).map(m => Number(m)) : undefined;
};
