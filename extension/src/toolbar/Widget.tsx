import { LayersRenderer } from "../prototypes/layers";
import { AppFrame } from "../prototypes/ui-components";
import { InitialLayers } from "../prototypes/view/containers/InitialLayers";
import { ToolMachineEvents } from "../prototypes/view/containers/ToolMachineEvents";
import { AppHeader } from "../prototypes/view/ui-containers/AppHeader";
import { layerComponents } from "../prototypes/view-layers/layerComponents";
import { WidgetContext } from "../shared/context/WidgetContext";
import { useView } from "../shared/reearth/hooks/useView";
import { FlyToDestination } from "../shared/reearth/types";

import { useInteractionMode } from "./hooks/useInteractionMode";

const InitialDestination: FlyToDestination = {
  lng: 139.755,
  lat: 35.675,
  height: 1000,
  heading: Math.PI * 0.4,
  pitch: -Math.PI * 0.2,
};

export const Widget = () => {
  useView(InitialDestination);
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
      <ToolMachineEvents />
      <InitialLayers />
    </WidgetContext>
  );
};
