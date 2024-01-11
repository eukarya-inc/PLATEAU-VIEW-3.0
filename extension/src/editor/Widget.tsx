import { memo } from "react";

import { WidgetContext } from "../shared/context/WidgetContext";
import { inEditor } from "../shared/reearth/utils";

import { Editor } from "./containers";

export const Widget = memo(function WidgetPresenter() {
  const enabled = inEditor();
  return enabled ? (
    <WidgetContext>
      <Editor />
    </WidgetContext>
  ) : null;
});
