import { useCallback, useState } from "react";

import { BaseFieldProps } from "../types";

import { Field } from "./common";
import { TextInput } from "./commonComponents";

const PointSize: React.FC<BaseFieldProps<"pointSize">> = ({ value, editMode, onUpdate }) => {
  const [size, setSize] = useState(value.pointSize);

  const handleSizeUpdate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const size = !isNaN(parseFloat(e.currentTarget.value))
        ? parseFloat(e.currentTarget.value)
        : 1;
      setSize(size);
      onUpdate({
        ...value,
        pointSize: size,
      });
    },
    [value, onUpdate],
  );

  return editMode ? (
    <Field
      title="サイズ"
      titleWidth={82}
      value={<TextInput defaultValue={size} onChange={handleSizeUpdate} />}
    />
  ) : null;
};

export default PointSize;
