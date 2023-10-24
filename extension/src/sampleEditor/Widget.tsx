import { Button } from "@mui/material";
import { PrimitiveAtom, useAtomValue, useSetAtom } from "jotai";
import { ChangeEvent, FC, memo, useCallback, useDeferredValue, useRef, useState } from "react";

import { Component, Setting } from "../shared/api/types";
import { POINT_COLOR_FIELD, POINT_SIZE_FIELD } from "../shared/api/types/fields/point";
import { WidgetContext } from "../shared/context/WidgetContext";
import {
  addSettingAtom,
  removeSettingAtom,
  settingsAtomsAtom,
  updateSettingAtom,
} from "../shared/states/setting";

// Setting for 避難施設情報（千代田区）
const mockSetting: Setting = {
  id: "3",
  datasetId: "d_13101_shelter",
  dataId: "di_13101_shelter",
  groups: [
    {
      id: "1",
      default: true,
      components: [
        {
          type: POINT_COLOR_FIELD,
          value: `"#f0ff00"`,
          storeable: false,
        },
        {
          type: POINT_SIZE_FIELD,
          value: 100,
          storeable: false,
        },
      ],
    },
  ],
  template: undefined,
  infobox: undefined,
  camera: undefined,
};

const ComponentItem: FC<{
  component: Component;
  setting: Setting;
  settingIndex: number;
  componentIndex: number;
  groupIndex: number;
}> = ({ component, setting, settingIndex, componentIndex, groupIndex }) => {
  const [value, setValue] = useState({
    type: typeof component.value,
    groupIndex,
    componentIndex,
    value: component.value,
  });
  const deferredValue = useDeferredValue(value);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(v => ({ ...v, value: e.target.value }));
  }, []);

  const updateSetting = useSetAtom(updateSettingAtom);

  const settingRef = useRef(setting);
  settingRef.current = setting;

  const apply = useCallback(() => {
    const s = settingRef.current;

    updateSetting(
      {
        ...s,
        groups: s.groups?.map((g, gi) => ({
          ...g,
          components: g.components.map((c, ci) =>
            deferredValue.groupIndex === gi && deferredValue.componentIndex === ci
              ? {
                  ...c,
                  value:
                    deferredValue.type === "string"
                      ? (deferredValue.value as any)
                      : Number(deferredValue.value) ?? 0,
                }
              : c,
          ),
        })),
      },
      settingIndex,
    );
  }, [deferredValue, settingIndex, updateSetting]);

  return (
    <li>
      <label>{component.type}: </label>
      <input onChange={handleChange} value={value.value} />
      <Button onClick={apply} color="warning">
        Apply
      </Button>
    </li>
  );
};

const SettingItem: FC<{ settingAtom: PrimitiveAtom<Setting>; index: number }> = ({
  settingAtom,
  index,
}) => {
  const setting = useAtomValue(settingAtom);

  const removeSetting = useSetAtom(removeSettingAtom);
  const handleRemoveSetting = useCallback(() => {
    removeSetting(settingAtom);
  }, [removeSetting, settingAtom]);

  return (
    <li>
      <h3>{setting.datasetId}</h3>
      <Button color="error" onClick={handleRemoveSetting}>
        Remove
      </Button>
      <ul>
        {setting.groups?.map((group, gi) => {
          return (
            <li key={group.id}>
              {group.id}
              <ul>
                {group.components.map((c, ci) => {
                  return (
                    <ComponentItem
                      key={ci.toString()}
                      component={c}
                      setting={setting}
                      settingIndex={index}
                      groupIndex={gi}
                      componentIndex={ci}
                    />
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </li>
  );
};

const App: FC = () => {
  const settingAtoms = useAtomValue(settingsAtomsAtom);

  const addSetting = useSetAtom(addSettingAtom);
  const handleAddSetting = useCallback(() => {
    addSetting(mockSetting);
  }, [addSetting]);

  return (
    <div style={{ background: "#999999" }}>
      <h2>Settings</h2>
      <ul>
        {settingAtoms.map((settingAtom, i) => (
          <SettingItem key={i.toString()} settingAtom={settingAtom} index={i} />
        ))}
      </ul>
      <Button color="primary" onClick={handleAddSetting}>
        add setting for shelter
      </Button>
    </div>
  );
};

export const Widget: FC = memo(function WidgetPresenter() {
  return (
    <WidgetContext>
      <App />
    </WidgetContext>
  );
});
