import { FieldComponent } from "./components/content/common/DatasetCard/Field/Fields/types";

export type Root = {
  data: Data[];
  templates: Template[];
};

export type Data = {
  id: string;
  dataId: string;
  type: string;
  name?: string; // Might want to make raw type without this
  // public: boolean; // Might want to make raw type without this
  visible?: boolean; // Might want to make raw type without this
  modelType: "usecase" | "plateau" | "dataset";
  // either template or components
  template?: string; // user-defined template ID or builtin template ID
  components?: FieldComponent[];
};

// ****** Template ******

export type Template = {
  id: string;
  modelId: string;
  name?: string;
  components?: FieldComponent[];
};
