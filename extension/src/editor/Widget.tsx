import { Provider, useAtomValue } from "jotai";
import { memo } from "react";

import { readyAtom } from "../prototypes/view/states/app";
import { WidgetContext } from "../shared/context/WidgetContext";
import { inEditor } from "../shared/reearth/utils";
import { store } from "../shared/states/store";

import { Editor } from "./containers";

const WidgetContent = memo(function WidgetPresenter() {
  const enabled = inEditor();
  const ready = useAtomValue(readyAtom);

  return enabled ? <WidgetContext>{ready && <Editor />}</WidgetContext> : null;
});

export const Widget = memo(() => {
  return (
    <Provider store={store}>
      <WidgetContent />
    </Provider>
  );
});
