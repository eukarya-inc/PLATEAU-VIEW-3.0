import { FieldComponent } from "./components/content/common/DatasetCard/Field/Fields/types";

export type Root = {
  data: Data[];
  templates: Template[];
};

export type Data = {
  id: string;
  dataId: string;
  type: string;
  name?: string;
  // public: boolean;
  visible?: boolean;
  url?: string;
  // either template or components
  template?: string; // user-defined template ID or builtin template ID
  components?: FieldComponent[];
  fieldGroups: Group[];
};

export type Group = {
  id: number;
  name: string;
};

// ****** Template ******

export type Template = {
  id: string;
  modelId: string;
  name?: string;
  components?: FieldComponent[];
};
