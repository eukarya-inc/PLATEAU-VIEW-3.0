import { Atom, PrimitiveAtom, SetStateAction, atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { uniqWith } from "lodash-es";

import { ImageIcon, ImageIconSet } from "../../../prototypes/datasets";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { LayerImageScheme } from "../../../prototypes/view-layers";
import { ComponentBase } from "../../types/fieldComponents";
import {
  CONDITIONAL_IMAGE_SCHEME,
  ConditionalImageSchemeValue,
} from "../../types/fieldComponents/imageScheme";
import { LayerModel } from "../../view-layers";

export const isImageSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<ComponentBase, { value?: ConditionalImageSchemeValue }> =>
  !!(
    comp.value &&
    typeof comp.value === "object" &&
    "type" in comp.value &&
    [CONDITIONAL_IMAGE_SCHEME].includes(comp.value.type)
  );

export const isConditionalImageSchemeComponent = (
  comp: ComponentBase,
): comp is Extract<ComponentBase, { value?: ConditionalImageSchemeValue }> =>
  !!(isImageSchemeComponent(comp) && CONDITIONAL_IMAGE_SCHEME === comp.value?.type);

export const makeImageSchemeForComponent = (imageSchemeAtom: Atom<LayerImageScheme | undefined>) =>
  atom(get => {
    const imageScheme = get(imageSchemeAtom);
    switch (imageScheme?.type) {
      case "imageIcon": {
        return {
          type: "imageIcon" as const,
          name: imageScheme.name,
          imageIcons: get(imageScheme.imageIconsAtom),
        };
      }
    }
  });

export const makeImageSchemeAtomForComponent = (layers: readonly LayerModel[]) =>
  atom<LayerImageScheme | undefined>(get => {
    const layer = layers[0];
    if (!layer) return;

    const componentAtom = layer.componentAtoms?.find(comp => {
      const value = get(comp.atom);
      return isImageSchemeComponent(value);
    });
    if (!componentAtom) {
      return;
    }
    const component = get(componentAtom.atom);
    const imageScheme = component.value as ConditionalImageSchemeValue;

    switch (imageScheme.type) {
      case CONDITIONAL_IMAGE_SCHEME: {
        if (!isConditionalImageSchemeComponent(component)) return;
        const rule = component.preset?.rules?.find(rule => rule.id === imageScheme.currentRuleId);
        if (!rule?.propertyName || !rule.conditions) return;
        const imageIcons = rule?.conditions
          ?.map((c): ImageIcon | undefined => {
            const overriddenCondition = component.value?.overrideRules.find(
              o => o.ruleId === rule.id && o.conditionId === c.id,
            );
            const imageUrl = overriddenCondition?.imageURL || c.imageURL;
            const imageColor = overriddenCondition?.imageColor || c.imageColor;
            return c.imageURL && imageUrl
              ? {
                  id: c.id,
                  value: c.value ?? "",
                  imageUrl,
                  imageColor,
                  name: (c.legendName || c.value) ?? "",
                }
              : undefined;
          })
          .filter(isNotNullish);
        const imageIconsAtom = atom(
          () => imageIcons,
          (_get, set, action: SetStateAction<ImageIcon[]>) => {
            const update = typeof action === "function" ? action(imageIcons) : action;
            const currentRuleId = component.value?.currentRuleId;
            set(componentAtom.atom, {
              ...component,
              value: {
                ...(component.value ?? {}),
                overrideRules: uniqWith(
                  [
                    ...(update
                      ?.map(imageIcon => ({
                        ruleId: currentRuleId,
                        conditionId: imageIcon.id,
                        imageUrl: imageIcon.imageUrl,
                        imageColor: imageIcon.imageColor,
                      }))
                      .filter(isNotNullish) ?? []),
                    ...(component.value?.overrideRules ?? []),
                  ],
                  (a, b) => a.ruleId === b.ruleId && a.conditionId === b.conditionId,
                ),
              } as typeof component.value,
            });
          },
        ) as unknown as PrimitiveAtom<ImageIcon[]>;
        return {
          type: "imageIcon" as const,
          name: rule.legendName ?? rule.propertyName,
          imageIconsAtom: imageIconsAtom,
          imageIconAtomsAtom: splitAtom(imageIconsAtom),
        } as ImageIconSet;
      }
    }
  });
