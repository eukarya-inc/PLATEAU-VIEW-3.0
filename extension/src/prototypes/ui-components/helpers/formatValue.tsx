import { format } from "d3";
import { round } from "lodash";
import { type ReactElement } from "react";

const exponentFormatter = format("~e");

export type ValueFormatter = (value: number, allowFloat?: boolean) => ReactElement | string;

export const formatValue: ValueFormatter = (value, allowFloat) => {
  if (value < 100000) {
    return allowFloat ? `${round(value, 1)}` : `${Math.trunc(value)}`;
  }
  const [base, exponent] = exponentFormatter(value).split("e");
  return (
    <>
      {base !== "1" ? <>{base}×</> : null}10<sup>{+exponent}</sup>
    </>
  );
};

export const formatPercent: ValueFormatter = value => <>{Math.round(value * 100)}%</>;
