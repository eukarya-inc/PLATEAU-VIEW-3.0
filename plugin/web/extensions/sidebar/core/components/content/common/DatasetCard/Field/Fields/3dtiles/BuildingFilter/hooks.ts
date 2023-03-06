import { postMsg } from "@web/extensions/sidebar/utils";
import isEqual from "lodash/isEqual";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

import { FILTERING_FIELD_DEFINITION, OptionsState } from "./constants";
import { useBuildingFilter } from "./useBuildingFilter";

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingFilter">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({});

  const handleUpdate = useCallback(
    (property: any) => {
      onUpdate({ ...value, override: { ["3dtiles"]: property } });
    },
    [onUpdate, value],
  );

  const handleUpdateOptions = useCallback(
    <P extends keyof OptionsState>(prop: P, v?: Exclude<OptionsState[P], undefined>["value"]) => {
      setOptions(o => {
        return {
          ...o,
          [prop]: {
            ...o[prop],
            value: v,
          },
        };
      });
      onUpdate({ ...value, [prop]: v });
    },
    [onUpdate, value],
  );

  const handleUpdateRange = useCallback(
    (prop: keyof OptionsState) => (value: number | number[]) => {
      if (value && Array.isArray(value)) {
        handleUpdateOptions(prop, value as [from: number, to: number]);
      }
    },
    [handleUpdateOptions],
  );

  useEffect(() => {
    const entries = Object.entries(options);
    if (
      !entries.every(
        ([k, v]) =>
          !value[k as keyof OptionsState] || isEqual(value[k as keyof OptionsState], v.value),
      )
    ) {
      setOptions(o => {
        entries.forEach(([k_, v]) => {
          const k = k_ as keyof OptionsState;
          if (o[k]) {
            o[k] = {
              ...v,
              value: value[k],
            } as OptionsState[typeof k];
          }
        });
        return { ...o };
      });
    }
  }, [options, value]);

  useEffect(() => {
    const handleFilteringFields = (data: any) => {
      const tempOptions: typeof options = {};
      Object.entries(data?.properties || {}).forEach(([propertyKey, propertyValue]) => {
        Object.entries(FILTERING_FIELD_DEFINITION).forEach(([k_, type]) => {
          const k = k_ as keyof OptionsState;
          if (
            propertyKey === type.featurePropertyName &&
            propertyValue &&
            typeof propertyValue === "object" &&
            Object.keys(propertyValue).length
          ) {
            tempOptions[k] = type;
          }
        });
      });
      setOptions(tempOptions);
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
        handleFilteringFields(data);

        removeEventListener("message", waitReturnedPostMsg);
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

  useBuildingFilter({ options, dataID, onUpdate: handleUpdate });

  return {
    options,
    handleUpdateRange,
  };
};

export default useHooks;
