import { Cond } from "./Fields/types";

export function stringifyCondition(condition: Cond<any>): string {
  return String(condition.operand) + String(condition.operator) + String(condition.value);
}
