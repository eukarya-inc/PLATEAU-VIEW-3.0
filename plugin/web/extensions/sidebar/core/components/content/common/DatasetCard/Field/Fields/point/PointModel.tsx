import { Field } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/common";
import {
  TextInput,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../types";

const PointModel: React.FC<BaseFieldProps<"pointModel">> = ({
  dataID,
  value,
  editMode,
  isActive,
  onUpdate,
}) => {
  const [modelURL, setModelURL] = useState(value.modelURL ?? "");
  const [scale, setImageSize] = useState(value.scale);

  const handleURLUpdate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setModelURL(e.currentTarget.value);
      onUpdate({
        ...value,
        modelURL: e.currentTarget.value,
      });
    },
    [value, onUpdate],
  );

  const handleScaleUpdate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const size = !isNaN(parseFloat(e.currentTarget.value))
        ? parseFloat(e.currentTarget.value)
        : 1;
      setImageSize(size);
      onUpdate({
        ...value,
        scale,
      });
    },
    [onUpdate, value, scale],
  );

  useEffect(() => {
    if (!isActive || !dataID) return;
    const timer = setTimeout(() => {
      postMsg({
        action: "updateDatasetInScene",
        payload: {
          dataID,
          update: { model: { url: modelURL, scale } },
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
            model: undefined,
          },
        },
      });
    };
  }, [dataID, isActive, modelURL, scale]);

  return editMode ? (
    <Wrapper>
      <Field
        title="モデルURL"
        titleWidth={82}
        value={<TextInput defaultValue={modelURL} onChange={handleURLUpdate} />}
      />
      <Field
        title="目盛"
        titleWidth={82}
        value={<TextInput defaultValue={scale} onChange={handleScaleUpdate} />}
      />
    </Wrapper>
  ) : null;
};

export default PointModel;
