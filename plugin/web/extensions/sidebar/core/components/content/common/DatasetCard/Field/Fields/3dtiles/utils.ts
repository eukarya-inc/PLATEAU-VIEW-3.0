export const defaultConditionalNumber = (prop: string, defaultValue?: number) =>
  `((${variable(prop)} === "" || ${variable(prop)} === null || isNaN(Number(${variable(
    prop,
  )}))) ? ${defaultValue || 1} : Number(${variable(prop)}))`;
export const compareRange = (conditionalValue: string, range: [from: number, to: number]) =>
  `(${conditionalValue} >= ${range?.[0]} && ${conditionalValue} <= ${range?.[1]})`;

export const compareGreaterThan = (conditionalValue: string, num: number) =>
  `(${conditionalValue} >= ${num})`;

export const equalString = (prop: string, value: string) => `(${variable(prop)} === "${value}")`;
export const equalNumber = (prop: string, value: number) => `(${variable(prop)} === ${value})`;

export const stringOrNumber = (v: string | number) =>
  typeof v === "number" ? v.toString() : `"${v}"`;

export const variable = (prop: string) => `\${${prop}}`;
