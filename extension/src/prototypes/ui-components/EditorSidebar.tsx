import { styled } from "@mui/material";
import { forwardRef } from "react";

export type EditorSidebarProps = {};

export const EditorSidebar = forwardRef<HTMLDivElement, EditorSidebarProps>(({ ...props }, ref) => (
  <Root ref={ref} {...props} />
));

const Root = styled("div")({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  height: "100%",
  width: "200px",
});
