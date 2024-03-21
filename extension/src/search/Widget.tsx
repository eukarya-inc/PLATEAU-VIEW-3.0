import { Provider, useAtomValue } from "jotai";
import { memo } from "react";

import { readyAtom } from "../prototypes/view/states/app";
import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";
import { store } from "../shared/states/store";
import { PLATEAUVIEW_SEARCH_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";

const WidgetContent = memo(function WidgetPresenter() {
  const ready = useAtomValue(readyAtom);

  return (
    <div id={PLATEAUVIEW_SEARCH_DOM_ID}>
      <WidgetContext>{ready && <AppOverlay type="main" width={360} height={81} />}</WidgetContext>
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
