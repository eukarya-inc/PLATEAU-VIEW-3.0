import { useEffect, useRef } from "react";

import { BasicFieldProps } from "..";

export const EditorPointFillColorValueField: React.FC<
  BasicFieldProps<"POINT_FILL_COLOR_VALUE_FIELD">
> = ({ component, onUpdate }) => {
  const componentRef = useRef(component);
  componentRef.current = component;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    onUpdateRef.current({
      ...componentRef.current,
      preset: {
        defaultValue: "#f00000",
      },
    });
  }, []);

  return <div>EditorPointFillColorValueField: {component.preset?.defaultValue}</div>;
};
