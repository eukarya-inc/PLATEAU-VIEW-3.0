import { postMsg } from "@web/extensions/sidebar/utils";
import { Radio } from "@web/sharedComponents";
import { ComponentProps, useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

import { INDEPENDENT_COLOR_TYPE } from "./constants";
import { useBuildingColor } from "./useBuildingColor";

type OptionsState = BaseFieldProps<"buildingColor">["value"]["userSettings"];

type RadioItem = { id: string; label: string; featurePropertyName: string; useOwnData?: boolean };

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingColor">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({
    colorType: value.userSettings?.colorType ?? "none",
  });
  const [independentColorTypes, setIndependentColorTypes] = useState<RadioItem[]>([]);
  const [floods, setFloods] = useState<RadioItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  const handleUpdate = useCallback(
    (property: any) => {
      onUpdate({
        ...value,
        userSettings: { ...options, updatedAt: new Date(), override: { "3dtiles": property } },
      });
    },
    [onUpdate, options, value],
  );

  const handleUpdateOptions = useCallback(
    <P extends keyof OptionsState>(prop: P, v?: OptionsState[P]) => {
      setOptions(o => {
        const next = { ...o, [prop]: v };
        return next;
      });
    },
    [],
  );

  const handleUpdateColorType: Exclude<ComponentProps<typeof Radio>["onChange"], undefined> =
    useCallback(
      e => {
        handleUpdateOptions("colorType", e.target.value);
      },
      [handleUpdateOptions],
    );

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
        if (k.endsWith("_浸水ランク") && v && typeof v === "object") {
          const useOwnData = !Object.keys(v).length;
          const featurePropertyName = (() => {
            if (!useOwnData) return k;
            return k.split(/[(_（＿]/)[0];
          })();
          tempFloods.push({
            id: `floods-${tempFloods.length}`,
            label: k.replaceAll("_", " "),
            featurePropertyName,
            useOwnData,
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

  useBuildingColor({ options, dataID, floods, initialized, onUpdate: handleUpdate });

  return {
    initialized,
    options,
    independentColorTypes,
    floods,
    handleUpdateColorType,
  };
};

export default useHooks;
