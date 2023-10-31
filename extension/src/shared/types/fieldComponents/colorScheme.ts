export const CONDITIONAL_COLOR_SCHEME = "CONDITIONAL_COLOR_SCHEME";
export const GRADIENT_COLOR_SCHEME = "GRADIENT_COLOR_SCHEME";

export type ConditionalColorSchemeValue = {
  type: typeof CONDITIONAL_COLOR_SCHEME;
  currentRuleId: string | undefined;
  overrideRules: {
    ruleId: string;
    conditionId: string;
    color: string;
  }[];
};

// TODO: Define type
export type GradientColorSchemeValue = {
  type: typeof GRADIENT_COLOR_SCHEME;
  currentRuleId: string | undefined;
  currentColorMapName: string | undefined;
  currentMin: number | undefined;
  currentMax: number | undefined;
};
