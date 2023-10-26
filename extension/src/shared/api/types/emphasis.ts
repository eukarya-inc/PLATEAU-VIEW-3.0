export type EmphasisProperty = {
  id: string;
  propertyName: string;
  displayName?: string;
  condition?: string;
  visible?: boolean;
};

export type EmphasisPropertyTemplate = {
  id: string;
  type: "emphasis";
  name: string;
  properties: EmphasisProperty[];
};
