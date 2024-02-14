export type WidgetProps<DefaultProperty, MunicipalityProperty, AppearanceProperty> = {
  inEditor: boolean;
  widget: {
    property: {
      default: DefaultProperty;
      municipality?: MunicipalityProperty;
      appearance?: AppearanceProperty;
    };
  };
};
