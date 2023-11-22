import { styled } from "@mui/material";
import { atom, useAtomValue } from "jotai";
import { FC, useMemo } from "react";
import Markdown from "react-markdown";

import { ComponentAtom } from "../../../shared/view-layers/component";

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: theme.typography.body2.fontSize,
}));

export interface LegendDescriptionSectionProps {
  componentAtom: ComponentAtom<"LEGEND_DESCRIPTION_FIELD">;
}

export const LegendDescriptionSection: FC<LegendDescriptionSectionProps> = ({ componentAtom }) => {
  const description = useAtomValue(
    useMemo(
      () =>
        atom(get => {
          return get(componentAtom.atom).preset?.description;
        }),
      [componentAtom],
    ),
  );

  return (
    <Wrapper>
      <Markdown skipHtml>{description}</Markdown>
    </Wrapper>
  );
};
