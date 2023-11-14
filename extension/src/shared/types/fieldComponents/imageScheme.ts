export const CONDITIONAL_IMAGE_SCHEME = "CONDITIONAL_IMAGE_SCHEME";
export type ConditionalImageSchemeValue = {
  type: typeof CONDITIONAL_IMAGE_SCHEME;
  currentRuleId: string | undefined;
  overrideRules: {
    ruleId: string;
    conditionId: string;
    imageURL: string;
    imageColor: string;
  }[];
};
