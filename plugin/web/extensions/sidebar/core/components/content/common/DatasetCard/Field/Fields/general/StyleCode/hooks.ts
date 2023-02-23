import { postMsg } from "@web/extensions/sidebar/utils";
import JSON5 from "json5";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

export default ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"styleCode">, "value" | "dataID" | "onUpdate">) => {
  const [code, editCode] = useState(value.src);

  const updateStyle = useCallback(
    (styleStr: string) => {
      if (styleStr) {
        try {
          const styleObject = JSON5.parse(styleStr);
          postMsg({ action: "updateDatasetInScene", payload: { dataID, update: styleObject } });
          // eslint-disable-next-line no-empty
        } catch (error) {}
      }
    },
    [dataID],
  );

  const onApply = useCallback(() => {
    updateStyle(code);
  }, [updateStyle, code]);

  const onEdit = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      editCode(e.target.value);
      onUpdate({
        ...value,
        src: e.target.value,
      });
    },
    [onUpdate, value],
  );

  useEffect(() => {
    updateStyle(value.src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStyle]);

  return {
    code,
    editCode,
    onApply,
    onEdit,
  };
};
