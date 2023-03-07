export const defaultConditionalNumber = (prop: string, defaultValue?: number) =>
  `((\${${prop}} === "" || \${${prop}} === null || isNaN(Number(\${${prop}}))) ? ${
    defaultValue || 1
  } : Number(\${${prop}}))`;
export const compareRange = (conditionalValue: string, range: [from: number, to: number]) =>
  `(${conditionalValue} >= ${range?.[0]} && ${conditionalValue} <= ${range?.[1]})`;

export const compareGreaterThan = (conditionalValue: string, num: number) =>
  `(${conditionalValue} >= ${num})`;

export const equalString = (prop: string, value: string) => `(\${${prop}} === "${value}")`;
export const equalNumber = (prop: string, value: number) => `(\${${prop}} === ${value})`;
