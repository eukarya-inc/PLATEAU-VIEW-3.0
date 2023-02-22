import { RawDataCatalogItem } from "../modals/datacatalog/api/api";

import { FieldComponent } from "./components/content/common/DatasetCard/Field/Fields/types";

export type Root = {
  data: Data[];
  templates: Template[];
};

export type DataCatalogGroup = {
  name: string;
  children: DataCatalogTreeItem[];
};

export type DataCatalogItem = RawDataCatalogItem & Data;

export type DataCatalogTreeItem = DataCatalogGroup | DataCatalogItem;

export type Data = {
  dataID: string;
  public?: boolean;
  visible?: boolean;
  // either template or components
  template?: string;
  components?: FieldComponent[];
  fieldGroups: Group[];
};

export type Group = {
  id: string;
  name: string;
};

// ****** Template ******

export type Template = {
  id: string;
  type: "field" | "infobox";
  name: string;
  fields?: Field[];
  components?: FieldComponent[];
};

export type Field = {
  title: string;
  path: string;
  visible: boolean;
};
