export const CONDITIONAL_COLOR_SCHEME = "CONDITIONAL_COLOR_SCHEME";
export const CONDITIONAL_GRADIENT_COLOR_SCHEME = "CONDITIONAL_GRDIENT_COLOR_SCHEME";

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
export type ConditionalGradientColorSchemeValue = {
  type: typeof CONDITIONAL_GRADIENT_COLOR_SCHEME;
};
