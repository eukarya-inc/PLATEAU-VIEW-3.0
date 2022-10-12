export type Dataset = {
  id: string;
  name: string;
  hidden: boolean;
  idealZoom: Location;
  dataUrl: string;
  fields: Field[];
};

export type Field = {
  id: string;
  title?: string;
  icon?: string;
  value?: any;
};

export type Location = {
  lat: number;
  lon: number;
  height: number;
  // check reearth for full params
};
