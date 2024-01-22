export type WidgetProps<Property> = {
  inEditor: boolean;
  widget: {
    property: {
      default: Property;
    };
  };
};
