import { useMemo } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import { color, defaultConditionalNumber, number, string, variable } from "../../helpers";
import { useOptionalAtomValue } from "../../hooks";
import { GeneralAppearances } from "../../reearth/layers";
import { ExpressionContainer } from "../../reearth/types/expression";
import { Component } from "../../types/fieldComponents";
import {
  POINT_COLOR_FIELD,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_SIZE_FIELD,
} from "../../types/fieldComponents/point";
import { ComponentAtom } from "../../view-layers/component";
import { useFindComponent } from "../../view-layers/hooks";

const DEFAULT_COLOR = "#ffffff";

export const makeConditionalExpression = (
  comp: Component<typeof POINT_FILL_COLOR_CONDITION_FIELD> | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;

  return {
    expression: {
      conditions: [
        ...(
          comp.preset?.rules?.flatMap(rule => {
            if (rule.id !== comp.value?.currentRuleId) return;
            const overriddenRules = comp.value?.overrideRules.filter(r => r.ruleId === rule.id);
            return rule.conditions?.map(cond => {
              const overriddenCondition = overriddenRules?.find(r => r.conditionId === cond.id);
              const colorValue = overriddenCondition?.color ?? cond.color;
              if (!rule.propertyName || !cond.value || !colorValue) return;
              const stringCondition = `${variable(rule.propertyName)} ${cond.operation} ${string(
                cond.value,
              )}`;
              const numberCondition = !isNaN(Number(cond.value))
                ? `${defaultConditionalNumber(rule.propertyName)} ${cond.operation} ${number(
                    Number(cond.value),
                  )}`
                : undefined;
              return rule.propertyName && cond.value && colorValue
                ? ([
                    numberCondition ? `${numberCondition} || ${stringCondition}` : stringCondition,
                    color(colorValue, 1),
                  ] as [string, string])
                : undefined;
            });
          }) ?? []
        ).filter(isNotNullish),
        ["true", color(DEFAULT_COLOR, 1)],
      ],
    },
  };
};

export const useEvaluateGeneralAppearance = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  const pointColor = useOptionalAtomValue(
    useFindComponent<typeof POINT_COLOR_FIELD>(componentAtoms ?? [], POINT_COLOR_FIELD),
  );
  const pointSize = useOptionalAtomValue(
    useFindComponent<typeof POINT_SIZE_FIELD>(componentAtoms ?? [], POINT_SIZE_FIELD),
  );
  const pointFillColorCondition = useOptionalAtomValue(
    useFindComponent<typeof POINT_FILL_COLOR_CONDITION_FIELD>(
      componentAtoms ?? [],
      POINT_FILL_COLOR_CONDITION_FIELD,
    ),
  );

  const generalAppearances: GeneralAppearances = useMemo(
    () => ({
      marker: {
        // TODO: Use component for style
        style: pointColor || pointSize ? "point" : undefined,
        pointColor: pointColor?.value ?? makeConditionalExpression(pointFillColorCondition),
        pointSize: pointSize?.value,
      },
    }),
    [pointColor, pointSize, pointFillColorCondition],
  );

  return generalAppearances;
};
