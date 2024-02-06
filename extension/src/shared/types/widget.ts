export type WidgetProps<DefaultProperty, AppearanceProperty> = {
  inEditor: boolean;
  widget: {
    property: {
      default: DefaultProperty;
      appearance?: AppearanceProperty;
    };
  };
};
