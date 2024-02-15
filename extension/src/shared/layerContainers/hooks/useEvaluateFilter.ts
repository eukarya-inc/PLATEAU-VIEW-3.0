import { isEqual } from "lodash-es";

import { isNumber, variable } from "../../helpers";
import { ConditionsExpression } from "../../reearth/types";
import {
  TilesetBuildingModelFilterField,
  TilesetFloodModelFilterField,
} from "../../types/fieldComponents/3dtiles";

export const useEvaluateFilter = (
  component: TilesetBuildingModelFilterField | TilesetFloodModelFilterField | undefined,
): ConditionsExpression => {
  const { filters } = component?.value || {};

  if (!filters) return { conditions: [["true", "true"]] };

  const filterEntries = Object.entries(filters);
  if (filterEntries.every(([, { value, range }]) => isEqual(value, range)))
    return { conditions: [["true", "true"]] };

  return {
    conditions: [
      [
        Object.entries(filters).reduce((res, [propertyName, { value, range, accessor }]) => {
          if (res) {
            res += " &&";
          }

          const isSameRange = value[0] === range[0] && value[1] === range[1];
          if (isSameRange) {
            return `${res} true`;
          }

          return `${res} ${isNumber(accessor || propertyName)} && ${variable(
            accessor || propertyName,
          )} >= ${value[0]} && ${variable(accessor || propertyName)} <= ${value[1]}`;
        }, ""),
        "true",
      ],
      ["true", "false"],
    ],
  };
};
