import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

import { FILTERING_FIELD_DEFINITION, OptionsState, USE_MIN_FIELD_PROPERTIES } from "./constants";
import { useBuildingFilter } from "./useBuildingFilter";

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"buildingFilter">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<OptionsState>({});

  const handleUpdate = useCallback(
    (property: any) => {
      onUpdate({
        ...value,
        userSettings: {
          height: options.height?.value,
          abovegroundFloor: options.abovegroundFloor?.value,
          basementFloor: options.basementFloor?.value,
          buildingAge: options.buildingAge?.value,
          override: { ["3dtiles"]: property },
        },
      });
    },
    [onUpdate, value, options],
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
    },
    [],
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
            const customType = (() => {
              const min =
                USE_MIN_FIELD_PROPERTIES.includes(k) && "minimum" in propertyValue
                  ? Number(propertyValue.minimum) ?? type.min
                  : type.min;
              return {
                ...type,
                value: [min ?? type.value[0], type.value[1]] as typeof type.value,
                min,
              };
            })();
            tempOptions[k] = customType;
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
