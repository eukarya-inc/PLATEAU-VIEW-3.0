import { RawDataCatalogItem } from "../modals/datacatalog/api/api";

import { FieldComponent } from "./components/content/common/DatasetCard/Field/Fields/types";

export type Root = {
  data: Data[];
  templates: Template[];
};

export type DataCatalogGroup = {
  id: string;
  name: string;
  children: DataCatalogTreeItem[];
};

export type DataCatalogItem = RawDataCatalogItem & Data;

export type DataCatalogTreeItem = DataCatalogGroup | DataCatalogItem;

export type Data = {
  dataID: string;
  public?: boolean;
  components?: FieldComponent[];
  visible?: boolean;
  selectedGroup?: string;
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
  dataType?: string; // 'bldg' 'urf' etc.
  fields?: InfoboxField[];
  components?: FieldComponent[];
};

export type InfoboxField = {
  title: string;
  path: string;
  visible: boolean;
};

// ****** Building Search ******
export type BuildingSearch = {
  dataID?: string;
  active?: boolean;
  field?: {
    id: string;
    type: string;
    override?: any;
    updatedAt?: Date;
  };
  cleanseField?: {
    id: string;
    type: string;
    updatedAt?: Date;
  };
}[];
