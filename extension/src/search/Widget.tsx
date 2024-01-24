import { useAtomValue } from "jotai";
import { memo } from "react";

import { readyAtom } from "../prototypes/view/states/app";
import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";

export const Widget = memo(function WidgetPresenter() {
  const ready = useAtomValue(readyAtom);

  return (
    <WidgetContext>{ready && <AppOverlay type="main" width={360} height={81} />}</WidgetContext>
  );
});
