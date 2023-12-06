import { styled } from "@mui/material";
import { type ComponentPropsWithoutRef, type FC } from "react";

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "disablePadding",
})<{
  disablePadding?: boolean;
  level?: number;
}>(({ theme, disablePadding = false, level = 1 }) => ({
  ...(!disablePadding && {
    padding: theme.spacing(1),
  }),
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - 12px - ${theme.spacing(2 * level)})`,
  },
}));

export type InspectorItemProps = ComponentPropsWithoutRef<typeof Root> & {
  level?: number;
};

export const InspectorItem: FC<InspectorItemProps> = props => <Root {...props} />;
