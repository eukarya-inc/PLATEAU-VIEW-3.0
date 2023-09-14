import { useEffect } from "react";

import { LayersRenderer } from "../prototypes/layers";
import { AppFrame } from "../prototypes/ui-components";
import { Environments } from "../prototypes/view/containers/Environments";
import { InitialLayers } from "../prototypes/view/containers/InitialLayers";
import { ReverseGeocoding } from "../prototypes/view/containers/ReverseGeocoding";
import { ToolMachineEvents } from "../prototypes/view/containers/ToolMachineEvents";
import { AppHeader } from "../prototypes/view/ui-containers/AppHeader";
import { layerComponents } from "../prototypes/view-layers/layerComponents";
import { WidgetContext } from "../shared/context/WidgetContext";
import { useHealth } from "../shared/graphql";

import { useInteractionMode } from "./hooks/useInteractionMode";

export const Widget = () => {
  useHealthCheck();
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
      <ReverseGeocoding />
    </WidgetContext>
  );
};

// For debug
const useHealthCheck = () => {
  /* eslint-disable react-hooks/rules-of-hooks */
  if (!import.meta.env.DEV) {
    return;
  }
  const { data, loading } = useHealth("123");
  useEffect(() => {
    if (loading) {
      console.log("Loading health...");
    } else {
      console.log("Health has been completed: ", data);
    }
  }, [loading, data]);
};
