import { memo } from "react";

import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";

export const Widget = memo(function WidgetPresenter() {
  return (
    <WidgetContext>
      <AppOverlay type="main" width={360} height={81} />
    </WidgetContext>
  );
});
