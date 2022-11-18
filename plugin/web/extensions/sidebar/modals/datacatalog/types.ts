type XYZ = {
  x: number;
  y: number;
  z: number;
};

type Camera = {
  east: number;
  north: number;
  south: number;
  west: number;
  direction: XYZ;
  position: XYZ;
  up: XYZ;
};

export type Group = {
  type: "group";
  isOpen?: boolean; // default false. Maybe not needed for v2?
  members?: Data[]; // if type is "group"
};

export type Item = {
  type: "3d-tiles" | "wms-no-description"; // Many types... like "wms-no-description". So might need to make multiple possible individual Item types
  url?: string;
  description?: string;
  tags?: Tag[];
  customProperties?: {
    initialCamera?: Camera;
  };
};

export type Data = {
  id: string; // ex. "//PLATEAU データセット/東京都"
  name: string; // "東京都"
} & (Group | Item);

export type Catalog = Data[];

export type FilterType = "prefecture" | "fileType" | "tag";

export type Tag = {
  type: "location" | "data-type";
  name: string;
};
