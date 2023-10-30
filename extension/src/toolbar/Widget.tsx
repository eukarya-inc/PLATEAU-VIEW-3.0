import { FC, memo, useEffect } from "react";

import { LayersRenderer } from "../prototypes/layers";
import { AppFrame } from "../prototypes/ui-components";
import { Environments } from "../prototypes/view/containers/Environments";
import { ReverseGeocoding } from "../prototypes/view/containers/ReverseGeocoding";
import { ScreenSpaceSelection } from "../prototypes/view/containers/ScreenSpaceSelection";
import { SelectionCoordinator } from "../prototypes/view/containers/SelectionCoordinator";
import { ToolMachineEvents } from "../prototypes/view/containers/ToolMachineEvents";
import { AppHeader } from "../prototypes/view/ui-containers/AppHeader";
import { WidgetContext } from "../shared/context/WidgetContext";
import { useHealth } from "../shared/graphql";
import { WidgetProps } from "../shared/types/widget";
import { InitialLayers } from "../shared/view/containers/InitialLayers";
import { layerComponents } from "../shared/view-layers/layerComponents";

import { InitializeApp } from "./containers/InitializeApp";
import { useAttachScreenSpaceSelection } from "./hooks/useAttachScreenSpaceSelection";
import { useInteractionMode } from "./hooks/useInteractionMode";

type Props = WidgetProps<{
  geoURL?: { value: string };
  plateauURL?: { value: string };
  plateauAccessToken?: { value: string };
  catalogURL?: { value: string };
  projectName?: { value: string };
}>;

export const Widget: FC<Props> = memo(function WidgetPresenter({ widget }) {
  useHealthCheck();
  useInteractionMode();
  useAttachScreenSpaceSelection();

  return (
    <WidgetContext
      geoUrl={widget.property.default.geoURL?.value}
      plateauUrl={widget.property.default.plateauURL?.value}
      catalogUrl={widget.property.default.catalogURL?.value}
      projectId={widget.property.default.projectName?.value}
      plateauToken={widget.property.default.plateauAccessToken?.value}>
      <InitializeApp />
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
      <SelectionCoordinator />
      <ScreenSpaceSelection />
      <ReverseGeocoding />
    </WidgetContext>
  );
});

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
