import { styled } from "@mui/material";
import { useAtom } from "jotai";
import { FC } from "react";
import Markdown from "react-markdown";

import { ParameterList } from "../../../../prototypes/ui-components";
import { LayerDescriptionField } from "../../../types/fieldComponents/general";
import { WritableAtomForComponent } from "../../../view-layers/component";

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  fontSize: theme.typography.body2.fontSize,
  [`img`]: {
    maxWidth: "100%",
  },
}));

export interface LayerLayerDescriptionFieldProps {
  atoms: WritableAtomForComponent<LayerDescriptionField>[];
}

export const LayerLayerDescriptionField: FC<LayerLayerDescriptionFieldProps> = ({ atoms }) => {
  const [component] = useAtom(atoms[0]);
  return component.preset?.description ? (
    <ParameterList>
      <Wrapper>
        <Markdown skipHtml>{component.preset?.description}</Markdown>
      </Wrapper>
    </ParameterList>
  ) : null;
};
