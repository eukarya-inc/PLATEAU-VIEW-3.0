import { Atom, PrimitiveAtom, SetStateAction, atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { uniqWith } from "lodash-es";

import {
  QualitativeColor,
  QualitativeColorSet,
  QuantitativeColorMap,
} from "../../../prototypes/datasets";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { LayerColorScheme } from "../../../prototypes/view-layers";
import { ComponentBase } from "../../types/fieldComponents";
import {
  CONDITIONAL_COLOR_SCHEME,
  CONDITIONAL_GRADIENT_COLOR_SCHEME,
  ConditionalColorSchemeValue,
  ConditionalGradientColorSchemeValue,
} from "../../types/fieldComponents/colorScheme";
import { LayerModel } from "../../view-layers";

export const isColorSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<
  ComponentBase,
  { value?: ConditionalColorSchemeValue | ConditionalGradientColorSchemeValue }
> =>
  !!(
    comp.value &&
    typeof comp.value === "object" &&
    "type" in comp.value &&
    [CONDITIONAL_COLOR_SCHEME, CONDITIONAL_GRADIENT_COLOR_SCHEME].includes(comp.value.type)
  );

// TODO: Support multiple color schcme if necessary
export const makeColorSchemeForComponent = (colorSchemeAtom: Atom<LayerColorScheme | undefined>) =>
  atom(get => {
    const colorScheme = get(colorSchemeAtom);
    switch (colorScheme?.type) {
      case "quantitative":
        return {
          type: "quantitative" as const,
          name: "",
          // colorMap: get(colorScheme.colorMapAtom),
          // colorRange: get(colorScheme.colorRangeAtom),
        };
      case "qualitative": {
        return {
          type: "qualitative" as const,
          name: colorScheme.name,
          colors: get(colorScheme.colorsAtom),
        };
      }
    }
  });

// TODO: Support multiple color schcme if necessary
export const makeColorSchemeAtomForComponent = (layers: readonly LayerModel[]) =>
  atom<LayerColorScheme | undefined>(get => {
    const componentAtom = layers[0].componentAtoms?.find(comp => {
      const value = get(comp.atom);
      return isColorSchemeComponent(value);
    });
    if (!componentAtom) {
      return;
    }
    const component = get(componentAtom.atom);
    const colorScheme = component.value as
      | ConditionalColorSchemeValue
      | ConditionalGradientColorSchemeValue;
    switch (colorScheme.type) {
      case CONDITIONAL_GRADIENT_COLOR_SCHEME:
        return {
          type: "quantitative" as const,
          name: "",
          // colorMap: get(colorScheme.colorMapAtom),
          // colorRange: get(colorScheme.colorRangeAtom),
        } as QuantitativeColorMap;
      case CONDITIONAL_COLOR_SCHEME: {
        if (!isColorSchemeComponent(component)) return;
        const rule = component.preset?.rules?.find(rule => rule.id === colorScheme.currentRuleId);
        if (!rule?.propertyName || !rule.conditions) return;
        const colors = rule?.conditions
          ?.map((c): QualitativeColor | undefined => {
            const overriddenCondition = component.value?.overrideRules.find(
              o => o.ruleId === rule.id && o.conditionId === c.id,
            );
            const color = overriddenCondition?.color ?? c.color;
            return c.value && color
              ? {
                  id: c.id,
                  value: c.value,
                  color: color,
                  name: c.legendName ?? c.value,
                }
              : undefined;
          })
          .filter(isNotNullish);
        const colorsAtom = atom(
          () => colors,
          (_get, set, action: SetStateAction<QualitativeColor[]>) => {
            const update = typeof action === "function" ? action(colors) : action;
            const currentRuleId = component.value?.currentRuleId;
            set(componentAtom.atom, {
              ...component,
              value: {
                ...(component.value ?? {}),
                overrideRules: uniqWith(
                  [
                    ...(update
                      ?.map(color => ({
                        ruleId: currentRuleId,
                        conditionId: color.id,
                        color: color.color,
                      }))
                      .filter(isNotNullish) ?? []),
                    ...(component.value?.overrideRules ?? []),
                  ],
                  (a, b) => a.ruleId === b.ruleId && a.conditionId === b.conditionId,
                ),
              } as typeof component.value,
            });
          },
        ) as unknown as PrimitiveAtom<QualitativeColor[]>; // For compat
        return {
          type: "qualitative" as const,
          name: rule.propertyName,
          colorsAtom: colorsAtom,
          colorAtomsAtom: splitAtom(colorsAtom),
        } as QualitativeColorSet;
      }
    }
  });
