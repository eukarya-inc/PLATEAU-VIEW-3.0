import { Icon, Dropdown, Menu, Radio } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { BaseFieldProps, ConfigData } from "../../types";

type UIStyles = "dropdown" | "radio";

const uiStyles: { [key: string]: string } = {
  dropdown: "ドロップダウン",
  radio: "ラジオ",
};

const SwitchDataset: React.FC<BaseFieldProps<"switchDataset">> = ({
  value,
  editMode,
  configData,
  onUpdate,
}) => {
  const [selectedStyle, selectStyle] = useState(value.uiStyle ?? "dropdown");
  const [selectedDataset, selectDataset] = useState(value.selected ?? configData?.[0]);

  const styleOptions = (
    <Menu
      items={Object.keys(uiStyles).map(key => {
        return {
          key: key,
          label: (
            <p style={{ margin: 0 }} onClick={() => handleStyleChange(key as UIStyles)}>
              {uiStyles[key]}
            </p>
          ),
        };
      })}
    />
  );

  const datasetOptions = (
    <Menu
      items={configData?.map(d => {
        return {
          key: d.name,
          label: (
            <p style={{ margin: 0 }} onClick={() => handleDatasetSelect(d)}>
              {d.name}
            </p>
          ),
        };
      })}
    />
  );

  const handleStyleChange = useCallback(
    (style: UIStyles) => {
      selectStyle(style);
      onUpdate({ ...value, uiStyle: style });
    },
    [value, onUpdate],
  );

  const handleDatasetSelect = useCallback(
    (dataset: ConfigData) => {
      selectDataset(dataset);
      onUpdate({ ...value, selected: dataset, override: { data: { url: dataset.url } } });
    },
    [value, onUpdate],
  );

  return editMode ? (
    <Wrapper>
      <Field>
        <FieldTitle>UIスタイル</FieldTitle>
        <FieldValue>
          <Dropdown
            overlay={styleOptions}
            placement="bottom"
            trigger={["click"]}
            getPopupContainer={trigger => trigger.parentElement ?? document.body}>
            <StyledDropdownButton>
              <p style={{ margin: 0 }}>{uiStyles[selectedStyle]}</p>
              <Icon icon="arrowDownSimple" size={12} />
            </StyledDropdownButton>
          </Dropdown>
        </FieldValue>
      </Field>
    </Wrapper>
  ) : (
    <Wrapper>
      <Field>
        {selectedDataset ? (
          value.uiStyle === "radio" && configData ? (
            <Radio.Group
              onChange={e =>
                handleDatasetSelect(
                  configData.find(cd => cd.name === e.target.value) ?? selectedDataset,
                )
              }
              value={selectedDataset.name}>
              {configData?.map(cd => (
                <StyledRadio key={cd.name} value={cd.name}>
                  <Label>{cd.name}</Label>
                </StyledRadio>
              ))}
            </Radio.Group>
          ) : (
            <FieldValue>
              <Dropdown
                overlay={datasetOptions}
                placement="bottom"
                trigger={["click"]}
                getPopupContainer={trigger => trigger.parentElement ?? document.body}>
                <StyledDropdownButton>
                  <p style={{ margin: 0 }}>{selectedDataset.name}</p>
                  <Icon icon="arrowDownSimple" size={12} />
                </StyledDropdownButton>
              </Dropdown>
            </FieldValue>
          )
        ) : (
          <Text>対応されているデータがない</Text>
        )}
      </Field>
    </Wrapper>
  );
};

export default SwitchDataset;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledDropdownButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-content: center;
  width: 100%;
  height: 32px;
  padding: 0 16px;
  cursor: pointer;
`;

const Field = styled.div<{ gap?: number }>`
  display: flex;
  align-items: center;
  ${({ gap }) => gap && `gap: ${gap}px;`}
`;

const Text = styled.p`
  margin: 0;
`;

const FieldTitle = styled(Text)`
  width: 82px;
`;

const FieldValue = styled.div`
  position: relative;
  display: flex;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  flex: 1;
  height: 100%;
  width: 100%;
`;

const StyledRadio = styled(Radio)`
  width: 100%;
  margin-top: 8px;
`;

const Label = styled.span`
  font-size: 14px;
`;
