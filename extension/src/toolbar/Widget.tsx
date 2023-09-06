import { LayersRenderer } from "../prototypes/layers";
import { AppFrame } from "../prototypes/ui-components";
import { Environments } from "../prototypes/view/containers/Environments";
import { InitialLayers } from "../prototypes/view/containers/InitialLayers";
import { ToolMachineEvents } from "../prototypes/view/containers/ToolMachineEvents";
import { AppHeader } from "../prototypes/view/ui-containers/AppHeader";
import { layerComponents } from "../prototypes/view-layers/layerComponents";
import { WidgetContext } from "../shared/context/WidgetContext";

import { useInteractionMode } from "./hooks/useInteractionMode";

export const Widget = () => {
  useInteractionMode();

  return (
    <WidgetContext>
      <AppFrame header={<AppHeader />} />
      {/* TODO(ReEarth): Support initial layer loading(Splash screen) */}
      {/* <Suspense>
        <SuspendUntilTilesLoaded
          initialTileCount={35}
          remainingTileCount={30}
          onComplete={handleTilesLoadComplete}> */}
      <LayersRenderer components={layerComponents} />
      {/* </SuspendUntilTilesLoaded>
      </Suspense> */}
      <Environments />
      <ToolMachineEvents />
      <InitialLayers />
    </WidgetContext>
  );
};
