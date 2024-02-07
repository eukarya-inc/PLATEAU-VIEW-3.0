export const roundFloat = (n: number, float = 100) => {
  return Math.floor(n * float) / float;
};
