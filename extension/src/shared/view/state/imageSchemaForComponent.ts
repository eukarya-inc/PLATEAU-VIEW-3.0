import { ComponentBase } from "../../types/fieldComponents";
import {
  CONDITIONAL_IMAGE_SCHEME,
  ConditionalImageSchemeValue,
} from "../../types/fieldComponents/imageScheme";

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
