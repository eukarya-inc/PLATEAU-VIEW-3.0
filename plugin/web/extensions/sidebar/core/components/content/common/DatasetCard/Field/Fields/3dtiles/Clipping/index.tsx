import { Checkbox } from "@web/sharedComponents";
import { styled } from "@web/theme";

import { BaseFieldProps } from "../../types";

import { Text } from "./commonStyles";
import useHooks from "./hooks";
import SelectField from "./SelectField";
import SwitchField from "./SwitchField";

const Clipping: React.FC<BaseFieldProps<"clipping">> = ({ value, dataID, editMode, onUpdate }) => {
  const { options, handleUpdateBool, handleUpdateSelect } = useHooks({
    value,
    dataID,
    onUpdate,
  });

  return editMode ? null : (
    <div>
      <FieldWrapper>
        <SwitchField
          style={{ margin: 0 }}
          title="有効にする"
          titleWidth={87}
          checked={options.enabled}
          onChange={handleUpdateBool("enabled")}
        />
      </FieldWrapper>
      <FieldWrapper>
        <Checkbox style={{ margin: 0 }} checked={options.show} onChange={handleUpdateBool("show")}>
          <Text>クリップボックスを表示する</Text>
        </Checkbox>
      </FieldWrapper>
      <FieldWrapper>
        <Checkbox
          style={{ margin: 0 }}
          checked={options.aboveGroundOnly}
          onChange={handleUpdateBool("aboveGroundOnly")}>
          <Text>クリップボックスを地面にスナップする</Text>
        </Checkbox>
      </FieldWrapper>
      <SelectField
        title="クリップ方法の選択"
        defaultValue="inside"
        style={{ width: "100%" }}
        value={options.direction}
        onChange={handleUpdateSelect("direction")}
        getPopupContainer={trigger => trigger.parentElement ?? document.body}
        options={[
          {
            value: "inside",
            label: "ボックス内をクリップ",
          },
          {
            value: "outside",
            label: "ボックス外をクリップ",
          },
        ]}
      />
    </div>
  );
};

export default Clipping;

const FieldWrapper = styled.div`
  margin-bottom: 8px;
`;
