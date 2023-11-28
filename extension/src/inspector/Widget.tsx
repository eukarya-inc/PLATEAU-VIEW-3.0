import { memo } from "react";

import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";

export const Widget = memo(function WidgetPresenter() {
  return (
    <WidgetContext>
      <AppOverlay type="aside" width={320} height={0} />
    </WidgetContext>
  );
});
