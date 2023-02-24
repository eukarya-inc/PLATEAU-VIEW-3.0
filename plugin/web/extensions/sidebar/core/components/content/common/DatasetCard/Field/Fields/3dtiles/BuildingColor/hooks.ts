import { postMsg } from "@web/extensions/sidebar/utils";
import { Radio } from "@web/sharedComponents";
import { ComponentProps, useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

import { INDEPENDENT_COLOR_TYPE } from "./constants";
import { useBuildingColor } from "./useBuildingColor";

type OptionsState = Omit<BaseFieldProps<"buildingColor">["value"], "id" | "group" | "type">;

type RadioItem = { id: string; label: string; featurePropertyName: string };

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingColor">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({
    colorType: value.colorType,
  });
  const [independentColorTypes, setIndependentColorTypes] = useState<RadioItem[]>([]);
  const [floods, setFloods] = useState<RadioItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  const handleUpdate = useCallback(
    <P extends keyof OptionsState>(prop: P, v?: OptionsState[P]) => {
      setOptions(o => {
        const next = { ...o, [prop]: v };
        onUpdate({ id: value.id, type: value.type, group: value.group, ...next });
        return next;
      });
    },
    [onUpdate, value],
  );

  const handleUpdateColorType: Exclude<ComponentProps<typeof Radio>["onChange"], undefined> =
    useCallback(
      e => {
        handleUpdate("colorType", e.target.value);
      },
      [handleUpdate],
    );

  useEffect(() => {
    if (options.colorType !== value.colorType) {
      setOptions({ ...value });
    }
  }, [value, options]);

  useEffect(() => {
    const handleIndependentColorTypes = (data: any) => {
      const tempTypes: typeof independentColorTypes = [];
      Object.entries(data?.properties || {}).forEach(([k]) => {
        Object.entries(INDEPENDENT_COLOR_TYPE).forEach(([, type]) => {
          if (k === type.featurePropertyName) {
            tempTypes.push(type);
          }
        });
      });
      setIndependentColorTypes(tempTypes);
    };
    const handleFloods = (data: any) => {
      const tempFloods: typeof floods = [];
      Object.entries(data?.properties || {}).forEach(([k, v]) => {
        if (k.endsWith("_浸水ランク") && v && typeof v === "object" && Object.keys(v).length > 0) {
          tempFloods.push({
            id: `floods-${tempFloods.length}`,
            label: k,
            featurePropertyName: k,
          });
        }
      });
      setFloods(tempFloods);
    };
    const waitReturnedPostMsg = async (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.action === "findTileset") {
        const layer = e.data.payload.layer;
        const url = layer?.data?.url;
        if (!url) {
          return;
        }
        const data = await (async () => {
          try {
            return await fetch(url).then(r => r.json());
          } catch (e) {
            console.error(e);
          }
        })();
        handleIndependentColorTypes(data);
        handleFloods(data);

        removeEventListener("message", waitReturnedPostMsg);
        setInitialized(true);
      }
    };
    addEventListener("message", waitReturnedPostMsg);
    postMsg({
      action: "findTileset",
      payload: {
        dataID,
      },
    });
  }, [dataID]);

  useBuildingColor({ options, dataID, floods, initialized });

  return {
    options,
    independentColorTypes,
    floods,
    handleUpdateColorType,
  };
};

export default useHooks;
