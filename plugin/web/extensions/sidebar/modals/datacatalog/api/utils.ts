export type Tree<T> = { name: string; children?: Tree<T>[]; item?: T };

export function makeTree<T extends { path: string[] }>(items: T[]): Tree<T>[] {
  type R = { result: Tree<T>[]; map: Record<string, R> };
  const result: Tree<T>[] = [];
  const level: R = { result, map: {} };

  items.forEach(item => {
    item.path.reduce<R>((r, name, i, a) => {
      const last = a.length - 1 === i;
      if (!r.map[name]) {
        const list: R = { result: [], map: {} };
        r.map[name] = list;
        r.result.push({ name, ...(last ? { item } : { children: list.result }) });
      }
      return r.map[name];
    }, level);
  });

  return result;
}

export function mapTree<T, K>(
  tree: Tree<T>[],
  cb: (item: Tree<T>) => K,
): (K & { children?: K[] })[] {
  function m(i: Tree<T>): K & { children?: K[] } {
    return {
      ...cb(i),
      ...(i.children
        ? {
            children: i.children.map(m),
          }
        : {}),
    };
  }
  return tree.map(m);
}

export function omit<T, K extends keyof T>(obj: T, ...fields: K[]): Omit<T, K> {
  const res = { ...obj };
  for (const f of fields) {
    delete res[f];
  }
  return res;
}
