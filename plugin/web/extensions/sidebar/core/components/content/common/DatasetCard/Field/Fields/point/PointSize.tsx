import { Field } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/common";
import { TextInput } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../types";

const PointSize: React.FC<BaseFieldProps<"pointSize">> = ({
  dataID,
  value,
  editMode,
  isActive,
  onUpdate,
}) => {
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

  useEffect(() => {
    if (!isActive || !dataID) return;
    const timer = setTimeout(() => {
      postMsg({
        action: "updateDatasetInScene",
        payload: {
          dataID,
          update: { marker: { style: "point", pointSize: size } },
        },
      });
    }, 500);
    return () => {
      clearTimeout(timer);
      postMsg({
        action: "updateDatasetInScene",
        payload: {
          dataID,
          update: {
            marker: undefined,
          },
        },
      });
    };
  }, [dataID, isActive, size]);

  return editMode ? (
    <Field
      title="サイズ"
      titleWidth={82}
      value={<TextInput defaultValue={size} onChange={handleSizeUpdate} />}
    />
  ) : null;
};

export default PointSize;
