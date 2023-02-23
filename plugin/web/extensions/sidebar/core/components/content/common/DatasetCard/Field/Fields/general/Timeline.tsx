import { postMsg } from "@web/extensions/sidebar/utils";
import { Checkbox } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Field } from "../../common";
import { TextInput } from "../../commonComponents";
import { BaseFieldProps } from "../types";

const Timeline: React.FC<BaseFieldProps<"timeline">> = ({ value, editMode, onUpdate, dataID }) => {
  const [timeFieldName, setTimeFieldName] = useState(value.timeFieldName);
  const updaterRef = useRef<() => void>();
  const debouncedUpdater = useMemo(
    () => debounce(() => updaterRef.current?.(), 500, { maxWait: 1000 }),
    [],
  );

  const handleUpdate = useCallback(() => {
    onUpdate({
      ...(value ?? {}),
      timeFieldName,
    });
  }, [timeFieldName, onUpdate, value]);

  const handleTimeFieldName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value;
    setTimeFieldName(text);
  }, []);

  useEffect(() => {
    updaterRef.current = handleUpdate;
    if (timeFieldName !== value.timeFieldName) {
      debouncedUpdater();
    }
  }, [handleUpdate, debouncedUpdater, timeFieldName, value.timeFieldName]);

  const handleTimeBasedDisplay = useCallback(() => {
    onUpdate({ ...value, timeBasedDisplay: !value.timeBasedDisplay });
  }, [value, onUpdate]);

  useEffect(() => {
    postMsg({
      action: "updateTimeBasedDisplay",
      payload: {
        dataID,
        timeBasedDisplay: value.timeBasedDisplay,
        timeFieldName: value.timeFieldName,
      },
    });
  }, [dataID, value.timeBasedDisplay, value.timeFieldName]);

  return editMode ? (
    <Field
      title="時間フィールド名"
      titleWidth={87}
      value={<TextInput value={timeFieldName} onChange={handleTimeFieldName} />}
    />
  ) : (
    <FieldWrapper>
      <Checkbox
        style={{ margin: 0 }}
        checked={value.timeBasedDisplay}
        onChange={handleTimeBasedDisplay}>
        <Text>時刻ベースのデータを表示</Text>
      </Checkbox>
    </FieldWrapper>
  );
};

export default Timeline;

const FieldWrapper = styled.div``;

const Text = styled.p`
  margin: 0;
  size: 14px;
`;
