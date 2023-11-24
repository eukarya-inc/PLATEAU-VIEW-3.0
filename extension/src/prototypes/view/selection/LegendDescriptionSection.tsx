import { styled } from "@mui/material";
import { FC } from "react";
import Markdown from "react-markdown";

import { useOptionalAtomValue } from "../../../shared/hooks";
import { LEGEND_DESCRIPTION_FIELD } from "../../../shared/types/fieldComponents/general";
import { useFindComponent } from "../../../shared/view-layers/hooks";
import {
  COLOR_SCHEME_SELECTION,
  IMAGE_SCHEME_SELECTION,
  SelectionGroup,
} from "../states/selection";

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: theme.typography.body2.fontSize,
  [`img`]: {
    maxWidth: "100%",
  },
}));

export interface LegendDescriptionSectionProps {
  values: (SelectionGroup & {
    type: typeof COLOR_SCHEME_SELECTION | typeof IMAGE_SCHEME_SELECTION;
  })["values"];
}

export const LegendDescriptionSection: FC<LegendDescriptionSectionProps> = ({ values }) => {
  const legendDescriptionAtom = useFindComponent(
    values[0].componentAtoms ?? [],
    LEGEND_DESCRIPTION_FIELD,
  );

  const legendDescription = useOptionalAtomValue(legendDescriptionAtom);

  return legendDescription?.preset?.description ? (
    <Wrapper>
      <Markdown skipHtml>{legendDescription?.preset?.description}</Markdown>
    </Wrapper>
  ) : null;
};
