import { parseAttributes } from "./parseAttributes";

export type AttributeValue = { featureType?: string; description?: string; dataType?: string };

export const attributesMap = new Map<number, Map<string, AttributeValue | undefined>>();

export const loadAttributes = async (
  attrUrl: string,
  versions: number[],
  // For testing
  overrides?: string[],
) => {
  const result: Map<number, string> = new Map();

  await Promise.all(
    versions.map(async (v, i) => {
      const txt =
        overrides?.[i] ??
        (await fetch(`${attrUrl}/${v}`)
          .then(r => r.text())
          .catch(() => undefined));
      if (!txt) return;
      result.set(v, await parseAttributes(txt));
    }),
  );

  result.forEach((v, k) => {
    v.split("\n")
      .map(l => l.split(",{"))
      .forEach(l => {
        if (!attributesMap.has(k)) {
          attributesMap.set(k, new Map());
        }
        attributesMap.get(k)?.set(l[0], JSON.parse("{" + l[1]));
      });
  });
};
