import { useEffect, useRef } from "react";

import { BasicFieldProps } from "..";

export const EditorPointSizeField: React.FC<BasicFieldProps<"POINT_SIZE_FIELD">> = ({
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
        defaultValue: 100,
      },
    });
  }, []);
  return <div>EditorPointSizeField: {component.preset?.defaultValue}</div>;
};
