import { Field } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/common";
import { TextInput } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../types";

const PolylineStrokeWeight: React.FC<BaseFieldProps<"polylineStrokeWeight">> = ({
  dataID,
  value,
  editMode,
  isActive,
  onUpdate,
}) => {
  const [strokeWidth, setStrokeWidth] = useState(value.strokeWidth);

  const handleWidthUpdate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const width = !isNaN(parseFloat(e.currentTarget.value))
        ? parseFloat(e.currentTarget.value)
        : 1;
      setStrokeWidth(width);
      onUpdate({
        ...value,
        strokeWidth: width,
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
          update: { polyline: { strokeWidth } },
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
            polyline: undefined,
          },
        },
      });
    };
  }, [dataID, isActive, strokeWidth]);

  return editMode ? (
    <Field
      title="Stroke Width"
      titleWidth={82}
      value={<TextInput defaultValue={strokeWidth} onChange={handleWidthUpdate} />}
    />
  ) : null;
};

export default PolylineStrokeWeight;
