import { Provider } from "jotai";
import { memo } from "react";

import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";
import { store } from "../shared/states/store";
import { PLATEAUVIEW_INSPECTOR_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";

const WidgetContent = memo(function WidgetPresenter() {
  return (
    <div id={PLATEAUVIEW_INSPECTOR_DOM_ID}>
      <WidgetContext>
        <AppOverlay type="aside" width={320} height={0} />
      </WidgetContext>
    </div>
  );
});

export const Widget = memo(() => {
  return (
    <Provider store={store}>
      <WidgetContent />
    </Provider>
  );
});
