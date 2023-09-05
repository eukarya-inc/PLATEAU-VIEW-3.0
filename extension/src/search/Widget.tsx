import { AppOverlay } from "../prototypes/view/ui-containers/AppOverlay";
import { WidgetContext } from "../shared/context/WidgetContext";

export const Widget = () => {
  return (
    <WidgetContext>
      <AppOverlay />
    </WidgetContext>
  );
};
