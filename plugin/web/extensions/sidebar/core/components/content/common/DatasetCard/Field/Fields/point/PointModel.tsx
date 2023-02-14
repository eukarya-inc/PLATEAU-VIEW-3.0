import { useCallback, useState } from "react";

import { BaseFieldProps } from "../types";

import Field from "./common/Field";
import { TextInput, Wrapper } from "./common/styled";

const PointModel: React.FC<BaseFieldProps<"pointModel">> = ({ value, editMode, onUpdate }) => {
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
