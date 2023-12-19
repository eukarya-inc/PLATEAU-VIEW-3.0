import { FC, memo } from "react";

import { LayersRenderer } from "../prototypes/layers";
import { AppFrame } from "../prototypes/ui-components";
import { Environments } from "../prototypes/view/containers/Environments";
import { PedestrianTool } from "../prototypes/view/containers/PedestrianTool";
import { ReverseGeocoding } from "../prototypes/view/containers/ReverseGeocoding";
import { ScreenSpaceSelection } from "../prototypes/view/containers/ScreenSpaceSelection";
import { SelectionCoordinator } from "../prototypes/view/containers/SelectionCoordinator";
import { ToolMachineEvents } from "../prototypes/view/containers/ToolMachineEvents";
import { AppHeader } from "../prototypes/view/ui-containers/AppHeader";
import { Notifications } from "../prototypes/view/ui-containers/Notifications";
import { WidgetContext } from "../shared/context/WidgetContext";
import { WidgetProps } from "../shared/types/widget";
import { InitialLayers } from "../shared/view/containers/InitialLayers";
import { layerComponents } from "../shared/view-layers/layerComponents";

import { InitializeApp } from "./containers/InitializeApp";
import { useAttachScreenSpaceSelection } from "./hooks/useAttachScreenSpaceSelection";

type Props = WidgetProps<{
  geoURL?: string;
  gsiTileURL?: string;
  plateauURL?: string;
  plateauAccessToken?: string;
  catalogURL?: string;
  projectName?: string;
  googleStreetViewAPIKey?: string;
}>;

export const Widget: FC<Props> = memo(function WidgetPresenter({ widget }) {
  useAttachScreenSpaceSelection();

  return (
    <WidgetContext
      geoUrl={widget.property.default.geoURL}
      gsiTileURL={widget.property.default.gsiTileURL}
      plateauUrl={widget.property.default.plateauURL}
      catalogUrl={widget.property.default.catalogURL}
      projectId={widget.property.default.projectName}
      plateauToken={widget.property.default.plateauAccessToken}
      googleStreetViewAPIKey={widget.property.default.googleStreetViewAPIKey}>
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
      <Notifications />
      <InitialLayers />
      <SelectionCoordinator />
      <ScreenSpaceSelection />
      <ReverseGeocoding />
      <PedestrianTool />
    </WidgetContext>
  );
});
