export type IndexData = {
  field: string;
  values: string[];
};

export type DatasetIndexes = {
  title: string;
  indexes: IndexData[];
};

export type Condition = {
  field: string;
  values: string[];
};

export type Result = {
  id: string;
};

export type Viewport = {
  width: number;
  height: number;
  isMobile: boolean;
};
