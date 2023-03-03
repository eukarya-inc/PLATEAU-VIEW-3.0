import { Field } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/common";
import { TextInput } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../types";

const PointSize: React.FC<BaseFieldProps<"pointSize">> = ({
  value,
  editMode,
  isActive,
  onUpdate,
}) => {
  const [size, setSize] = useState(value.pointSize);

  const handleSizeUpdate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const size = !isNaN(parseFloat(e.currentTarget.value)) ? parseFloat(e.currentTarget.value) : 1;
    setSize(size);
  }, []);

  useEffect(() => {
    if (!isActive || size === value.pointSize) return;
    const timer = setTimeout(() => {
      onUpdate({
        ...value,
        pointSize: size,
        override: { marker: { style: "point", pointSize: size } },
      });
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [isActive, size, value, onUpdate]);

  return editMode ? (
    <Field
      title="サイズ"
      titleWidth={82}
      value={<TextInput defaultValue={size} onChange={handleSizeUpdate} />}
    />
  ) : null;
};

export default PointSize;
