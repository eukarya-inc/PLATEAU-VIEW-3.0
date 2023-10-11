import { memo } from "react";

import { Editor } from "../prototypes/view/ui-containers/Editor";
import { WidgetContext } from "../shared/context/WidgetContext";

export const Widget = memo(function WidgetPresenter() {
  const enabled = !!window.reearth?.scene?.inEditor;
  return enabled ? (
    <WidgetContext>
      <Editor />
    </WidgetContext>
  ) : null;
});
