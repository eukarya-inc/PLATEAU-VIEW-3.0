import { Stack, styled, Tooltip } from "@mui/material";
import { type ComponentPropsWithoutRef, type FC } from "react";

import { type QualitativeColor } from "../datasets";

import { ColorIcon } from "./ColorIcon";

const Root = styled("div")({
  overflow: "hidden",
});

const Cell = styled("div")(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

export interface QualitativeColorLegendProps extends ComponentPropsWithoutRef<typeof Root> {
  colors: readonly QualitativeColor[];
}

export const QualitativeColorLegend: FC<QualitativeColorLegendProps> = ({ colors, ...props }) => {
  return (
    <Root {...props}>
      <Stack direction="row" margin={-0.5} useFlexGap flexWrap="wrap">
        {colors.map(color => (
          <Tooltip key={color.id} title={color.name} enterDelay={0} leaveDelay={0}>
            <Cell>
              <ColorIcon color={color.color} strokeColor={color.strokeColor} />
            </Cell>
          </Tooltip>
        ))}
      </Stack>
    </Root>
  );
};
