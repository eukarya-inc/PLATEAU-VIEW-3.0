import { postMsg } from "@web/extensions/sidebar/utils";
import { Checkbox } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect } from "react";

import { BaseFieldProps } from "../types";

const Timeline: React.FC<BaseFieldProps<"timeline">> = ({ value, editMode, onUpdate, dataID }) => {
  const handleTimeBasedDisplay = useCallback(() => {
    onUpdate({ ...value, timeBasedDisplay: !value.timeBasedDisplay });
  }, [value, onUpdate]);

  useEffect(() => {
    postMsg({
      action: "updateTimeBasedDisplay",
      payload: {
        dataID,
        timeBasedDisplay: value.timeBasedDisplay,
      },
    });
  }, [dataID, value.timeBasedDisplay]);

  return editMode ? null : (
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
