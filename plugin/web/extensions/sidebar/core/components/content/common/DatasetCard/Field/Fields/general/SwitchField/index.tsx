import { postMsg } from "@web/extensions/sidebar/utils";
import { Icon, Dropdown, Menu, Radio } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BaseFieldProps } from "../../types";

type UIStyles = "dropdown" | "radio";

const uiStyles: { [key: string]: string } = {
  dropdown: "ドロップダウン",
  radio: "ラジオ",
};

const SwitchField: React.FC<BaseFieldProps<"switchField">> = ({
  dataID,
  value,
  editMode,
  onUpdate,
}) => {
  const [selectedStyle, selectStyle] = useState(value.uiStyle ?? "dropdown");
  const [targetProperty, setTargetProperty] = useState(value.field); // ie 種類
  const [selectedProperty, selectProperty] = useState(value.userSettings.selected); // ie 病院
  const [properties, setProperties] = useState<{ [key: string]: any }>();

  useEffect(() => {
    (async () => {
      if (!dataID) return;
      const layer = await new Promise<any>(resolve => {
        const handleMessage = (e: any) => {
          if (e.source !== parent) return;
          if (e.data.action !== "findLayerByDataID") {
            resolve(undefined);
            return;
          }
          removeEventListener("message", handleMessage);
          resolve(e.data.payload.layer);
        };
        addEventListener("message", handleMessage);
        postMsg({
          action: "findLayerByDataID",
          payload: {
            dataID,
          },
        });
      });
      console.log("Layer:", layer);
      setProperties(layer?.features?.[0]?.properties);
    })();
  }, [dataID]);

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

  const propertyKeys = useMemo(
    () => (properties ? Object.keys(properties) : undefined),
    [properties],
  );

  const propertyOptions = (
    <Menu
      items={propertyKeys?.map((key: string) => {
        return {
          key,
          label: (
            <p style={{ margin: 0 }} onClick={() => handlePropertySelect(key)}>
              {properties?.[key]}
            </p>
          ),
        };
      })}
    />
  );

  const handleTargetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTargetProperty(e.currentTarget.value);
      onUpdate({ ...value, field: e.currentTarget.value });
    },
    [value, onUpdate],
  );

  const handleStyleChange = useCallback(
    (style: UIStyles) => {
      selectStyle(style);
      onUpdate({ ...value, uiStyle: style });
    },
    [value, onUpdate],
  );

  const handlePropertySelect = useCallback(
    (propertyKey: string) => {
      const propertyValue = properties?.[propertyKey];
      if (!propertyValue) return;
      selectProperty(propertyKey);
      onUpdate({
        ...value,
        userSettings: {
          selected: propertyKey,
        },
        override: {
          ["3dtiles"]: {
            show: {
              expression: [`${targetProperty} == ${propertyValue}`, "true"],
            },
          },
        },
      });
    },
    [targetProperty, value, properties, onUpdate],
  );

  return editMode ? (
    <Wrapper>
      <Field>
        <FieldTitle>プロパティ</FieldTitle>
        <FieldValue>
          <TextInput defaultValue={targetProperty} onChange={handleTargetChange} />
        </FieldValue>
      </Field>
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
        {selectedProperty ? (
          value.uiStyle === "radio" && properties ? (
            <Radio.Group
              onChange={e =>
                handlePropertySelect(
                  Object.keys(properties).find(key => key === e.target.value) ?? selectedProperty,
                )
              }
              value={properties[selectedProperty]}>
              {Object.keys(properties).map(key => (
                <StyledRadio key={key} value={key}>
                  <Label>{properties[key]}</Label>
                </StyledRadio>
              ))}
            </Radio.Group>
          ) : (
            <FieldValue>
              <Dropdown
                overlay={propertyOptions}
                placement="bottom"
                trigger={["click"]}
                getPopupContainer={trigger => trigger.parentElement ?? document.body}>
                <StyledDropdownButton>
                  <p style={{ margin: 0 }}>{properties?.[selectedProperty]}</p>
                  <Icon icon="arrowDownSimple" size={12} />
                </StyledDropdownButton>
              </Dropdown>
            </FieldValue>
          )
        ) : (
          <Text>狙ってるデータがない</Text>
        )}
      </Field>
    </Wrapper>
  );
};

export default SwitchField;

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
  height: 32px;
  width: 100%;
`;

const StyledRadio = styled(Radio)`
  width: 100%;
  margin-top: 8px;
`;

const Label = styled.span`
  font-size: 14px;
`;

const TextInput = styled.input.attrs({ type: "text" })`
  height: 100%;
  width: 100%;
  flex: 1;
  padding: 0 12px;
  border: none;
  outline: none;

  :focus {
    border: none;
  }
`;
