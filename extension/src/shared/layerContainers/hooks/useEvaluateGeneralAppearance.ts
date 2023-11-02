import { useMemo } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import { COLOR_MAPS } from "../../constants";
import { color, defaultConditionalNumber, number, rgba, string, variable } from "../../helpers";
import { useOptionalAtomValue } from "../../hooks";
import { GeneralAppearances } from "../../reearth/layers";
import { ExpressionContainer } from "../../reearth/types/expression";
import { Component } from "../../types/fieldComponents";
import {
  POINT_FILL_COLOR_VALUE_FIELD,
  POINT_FILL_COLOR_CONDITION_FIELD,
  POINT_FILL_COLOR_GRADIENT_FIELD,
  POINT_SIZE_FIELD,
} from "../../types/fieldComponents/point";
import { ComponentAtom } from "../../view-layers/component";
import { useFindComponent } from "../../view-layers/hooks";

const DEFAULT_COLOR = "#ffffff";

export const makeSimpleValue = (
  comp: Component<typeof POINT_FILL_COLOR_VALUE_FIELD> | undefined,
): string | undefined => {
  if (!comp) return;
  return comp.preset?.defaultValue;
};

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

export const makeGradientExpression = (
  comp: Component<typeof POINT_FILL_COLOR_GRADIENT_FIELD> | undefined,
): ExpressionContainer | undefined => {
  if (!comp) return;

  const preset = comp.preset;
  const value = comp.value;
  const rule = preset?.rules?.find(r => r.id === value?.currentRuleId);

  const conditions: [string, string][] = [["true", color(DEFAULT_COLOR, 1)]];

  const [minValue, maxValue] = [
    value?.currentMin ?? rule?.min ?? 0,
    value?.currentMax ?? rule?.max ?? 0,
  ];
  if (minValue === maxValue) {
    return {
      expression: { conditions },
    };
  }

  const colorMap = COLOR_MAPS.find(
    c => c.name === (value?.currentColorMapName ?? rule?.colorMapName),
  );
  const colorProperty = rule?.propertyName;

  if (!colorMap || !colorProperty) return { expression: { conditions } };

  const distance = 5;
  for (let i = minValue; i <= maxValue; i += distance) {
    const color = colorMap.linear((i - minValue) / (maxValue - minValue));
    conditions.unshift([
      `${defaultConditionalNumber(colorProperty, minValue - 1)} >= ${number(i)}`,
      rgba({ r: color[0] * 255, g: color[1] * 255, b: color[2] * 255, a: 1 }),
    ]);
  }

  return {
    expression: {
      conditions,
    },
  };
};

export const useEvaluateGeneralAppearance = ({
  componentAtoms,
}: {
  componentAtoms: ComponentAtom[] | undefined;
}) => {
  const pointColor = useOptionalAtomValue(
    useFindComponent<typeof POINT_FILL_COLOR_VALUE_FIELD>(
      componentAtoms ?? [],
      POINT_FILL_COLOR_VALUE_FIELD,
    ),
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
  const pointFillGradientColor = useOptionalAtomValue(
    useFindComponent<typeof POINT_FILL_COLOR_GRADIENT_FIELD>(
      componentAtoms ?? [],
      POINT_FILL_COLOR_GRADIENT_FIELD,
    ),
  );

  const generalAppearances: GeneralAppearances = useMemo(
    () => ({
      marker: {
        // TODO: Use component for style
        style: pointColor || pointSize ? "point" : undefined,
        pointColor:
          pointColor?.value ??
          makeConditionalExpression(pointFillColorCondition) ??
          makeGradientExpression(pointFillGradientColor),
        pointSize: pointSize?.value,
      },
    }),
    [pointColor, pointSize, pointFillColorCondition, pointFillGradientColor],
  );

  return generalAppearances;
};
