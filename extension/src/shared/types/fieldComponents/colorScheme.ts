export const VALUE_COLOR_SCHEME = "VALUE_COLOR_SCHEME";
export const CONDITIONAL_COLOR_SCHEME = "CONDITIONAL_COLOR_SCHEME";
export const GRADIENT_COLOR_SCHEME = "GRADIENT_COLOR_SCHEME";

export type ValueColorSchemeValue = {
  type: typeof VALUE_COLOR_SCHEME;
  color: string | undefined;
};

export type ConditionalColorSchemeValue = {
  type: typeof CONDITIONAL_COLOR_SCHEME;
  currentRuleId: string | undefined;
  overrideRules: {
    ruleId: string;
    conditionId: string;
    color: string;
  }[];
};
export type GradientColorSchemeValue = {
  type: typeof GRADIENT_COLOR_SCHEME;
  currentRuleId: string | undefined;
  currentColorMapName: string | undefined;
  currentMin: number | undefined;
  currentMax: number | undefined;
};
