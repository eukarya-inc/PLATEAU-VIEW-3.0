import type {
  DataCatalogGroup,
  DataCatalogItem,
  DataCatalogTreeItem,
} from "@web/extensions/sidebar/core/types";

import { omit, makeTree, mapTree } from "./utils";

// TODO: REACTOR: VERY CONFUSING REEXPORT
export type { DataCatalogItem, DataCatalogGroup, DataCatalogTreeItem };

export type RawDataCatalogTreeItem = RawDataCatalogGroup | RawDataCatalogItem;

export type RawDataCatalogGroup = {
  name: string;
  children: RawDataCatalogTreeItem[];
};

export type RawDataCatalogItem = {
  id: string;
  name: string;
  pref: string;
  pref_code?: string;
  city?: string;
  city_en?: string;
  city_code?: string;
  ward?: string;
  ward_en?: string;
  ward_code?: string;
  type: string;
  type_en: string;
  type2?: string;
  type2_en?: string;
  format: string;
  layers?: string[];
  url: string;
  desc: string;
  year: number;
  tags?: { type: "type" | "location"; value: string }[];
  openDataUrl?: string;
  config?: { data?: { name: string; type: string; url: string; layers?: string[] }[] };
  // bldg only fields
  bldg_low_texture_url?: string;
  bldg_no_texture_url?: string;
  search_index?: string;
};

export type GroupBy = "city" | "type" | "tag"; // Tag not implemented yet

export async function getDataCatalog(base: string): Promise<RawDataCatalogItem[]> {
  const res = await fetch(base + "/datacatalog");
  if (!res.ok) {
    throw new Error("failed to fetch data catalog");
  }

  const data: RawDataCatalogItem[] = await res.json();
  return data.map(modifyDataCatalog);
}

export function modifyDataCatalog(d: RawDataCatalogItem): RawDataCatalogItem {
  return {
    ...d,
    pref: d.pref === "全国" || d.pref === "全球" ? zenkyu : d.pref,
    pref_code: d.pref === "全国" || d.pref === "全球" || d.pref === zenkyu ? "0" : d.pref_code,
    tags: [
      { type: "type", value: d.type },
      ...(d.type2 ? [{ type: "type", value: d.type2 } as const] : []),
      ...(d.city ? [{ type: "location", value: d.city } as const] : []),
      ...(d.ward ? [{ type: "location", value: d.ward } as const] : []),
    ],
  };
}

// TODO: REFACTOR: very confusing typing
export function getDataCatalogTree(
  items: DataCatalogItem[],
  groupBy: GroupBy,
  q?: string | undefined,
): DataCatalogTreeItem[] {
  return getRawDataCatalogTree(items, groupBy, q) as DataCatalogTreeItem[];
}

export function getRawDataCatalogTree(
  items: RawDataCatalogItem[],
  groupBy: GroupBy,
  q?: string | undefined,
): (RawDataCatalogGroup | RawDataCatalogItem)[] {
  const allItems = filter(q, items)
    .map(i => ({
      ...i,
      path: path(i, groupBy),
      code: i.ward_code
        ? parseInt(i.ward_code)
        : i.city_code
        ? parseInt(i.city_code)
        : i.pref_code
        ? parseInt(i.pref_code)
        : i.pref === zenkyu
        ? 0
        : 99999,
    }))
    .sort((a, b) => sortBy(a, b, groupBy));

  return mapTree(makeTree(allItems), (item): RawDataCatalogGroup | RawDataCatalogItem =>
    item.item
      ? omit(item.item, "path", "code")
      : {
          name: item.name,
          children: [],
        },
  );
}

function path(i: RawDataCatalogItem, groupBy: GroupBy): string[] {
  return groupBy === "type"
    ? [i.type, i.pref, ...((i.ward || i.type2) && i.city ? [i.city] : []), ...i.name.split("/")]
    : [
        i.pref,
        ...(i.city ? [i.city] : []),
        ...(i.ward ? [i.ward] : []),
        ...(i.type2 || (i.type === "ユースケース" && i.pref !== zenkyu) ? [i.type] : []),
        ...i.name.split("/"),
      ];
}

function sortBy(
  a: RawDataCatalogItem & { code: number },
  b: RawDataCatalogItem & { code: number },
  sort: GroupBy,
): number {
  return sort === "type"
    ? sortByType(a, b) || sortByCity(a, b)
    : sortByCity(a, b) || sortByType(a, b);
}

function sortByCity(
  a: RawDataCatalogItem & { code: number },
  b: RawDataCatalogItem & { code: number },
): number {
  return (
    (b.pref === zenkyu ? 1 : 0) - (a.pref === zenkyu ? 1 : 0) ||
    (b.pref === tokyo ? 1 : 0) - (a.pref === tokyo ? 1 : 0) ||
    (!a.city ? 1 : 0) - (!b.city ? 1 : 0) ||
    (!a.ward ? 1 : 0) - (!b.ward ? 1 : 0) ||
    a.code - b.code ||
    types.indexOf(a.type_en) - types.indexOf(b.type_en)
  );
}
function sortByType(a: RawDataCatalogItem, b: RawDataCatalogItem): number {
  return types.indexOf(a.type_en) - types.indexOf(b.type_en);
}

function filter(q: string | undefined, items: RawDataCatalogItem[]): RawDataCatalogItem[] {
  if (!q) return items;
  return items.filter(
    i => i.name.includes(q) || i.pref.includes(q) || i.city?.includes(q) || i.ward?.includes(q),
  );
}

const zenkyu = "全球データ";
const tokyo = "東京都";
const types = [
  "bldg",
  "tran",
  "veg",
  "frn",
  "luse",
  "lsld",
  "urf",
  "fld",
  "tnm",
  "htd",
  "ifld",
  "shelter",
  "landmark",
  "station",
  "emergency_route",
  "railway",
  "park",
  "border",
  "usecase",
];
