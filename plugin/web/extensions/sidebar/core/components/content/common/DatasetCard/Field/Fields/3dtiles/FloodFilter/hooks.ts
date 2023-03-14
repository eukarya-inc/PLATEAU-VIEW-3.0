import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

import { BaseFieldProps } from "../../types";

import { FEATURE_PROPERTY_NAME, FilteringField } from "./constants";
import { useFloodFilter } from "./useFloodFilter";

const useHooks = ({
  value,
  dataID,
  onUpdate,
}: Pick<BaseFieldProps<"floodFilter">, "value" | "dataID" | "onUpdate">) => {
  const [options, setOptions] = useState<FilteringField>({
    value: value.userSettings.rank,
  });

  const handleUpdate = useCallback(
    (property: any) => {
      onUpdate({ ...value, override: { ["3dtiles"]: property } });
    },
    [onUpdate, value],
  );

  const handleUpdateRange = useCallback(
    (v: number | number[]) => {
      if (v && Array.isArray(v)) {
        const range = v as [from: number, to: number];
        setOptions(o => {
          return {
            ...o,
            value: range,
          };
        });
        onUpdate({ ...value, userSettings: { rank: range } });
      }
    },
    [value, onUpdate],
  );

  useEffect(() => {
    const handleFilteringFields = (data: any) => {
      let tempOptions: typeof options = {};
      Object.entries(data?.properties || {}).forEach(([propertyKey, propertyValue]) => {
        if (
          propertyKey === FEATURE_PROPERTY_NAME &&
          propertyValue &&
          typeof propertyValue === "object" &&
          Object.keys(propertyValue).length
        ) {
          const obj = propertyValue as any;
          tempOptions = {
            min: obj.minimum,
            max: obj.maximum,
            value: [obj.minimum, obj.maximum],
          };
        }
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

  useFloodFilter({ options, dataID, onUpdate: handleUpdate });

  return {
    options,
    handleUpdateRange,
  };
};

export default useHooks;
