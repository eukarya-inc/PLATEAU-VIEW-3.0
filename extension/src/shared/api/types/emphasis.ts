export type EmphasisProperty = {
  id: string;
  propertyName: string;
  displayName?: string;
  condition?: string;
  visible?: boolean;
};

export type EmphasisPropertyTemplate = {
  id: string;
  name: string;
  properties: EmphasisProperty[];
};
