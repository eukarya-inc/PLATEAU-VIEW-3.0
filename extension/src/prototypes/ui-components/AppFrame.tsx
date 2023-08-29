import { styled } from "@mui/material";
import { type FC, type ReactNode } from "react";

const Root = styled("div")({
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

const Header = styled("div")({
  flexGrow: 0,
  flexShrink: 0,
});

export interface AppFrameProps {
  header?: ReactNode;
  children?: ReactNode;
}

export const AppFrame: FC<AppFrameProps> = ({ header }) => (
  <Root>{header != null && <Header>{header}</Header>}</Root>
);
