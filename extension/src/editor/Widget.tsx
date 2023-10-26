import { memo } from "react";

import { WidgetContext } from "../shared/context/WidgetContext";

import { Editor } from "./containers";

export const Widget = memo(function WidgetPresenter() {
  const enabled = !!window.reearth?.scene?.inEditor;
  return enabled ? (
    <WidgetContext>
      <Editor />
    </WidgetContext>
  ) : null;
});
