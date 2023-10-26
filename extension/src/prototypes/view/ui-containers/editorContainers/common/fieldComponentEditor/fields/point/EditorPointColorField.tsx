import { useEffect, useRef } from "react";

import { BasicFieldProps } from "..";

export const EditorPointColorField: React.FC<BasicFieldProps<"POINT_COLOR_FIELD">> = ({
  component,
  onUpdate,
}) => {
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
  return <div>EditorPointColorField: {component.preset?.defaultValue}</div>;
};
