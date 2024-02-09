import { AnimatePresence } from "framer-motion";
import { useAtomValue } from "jotai";
import { FC, memo } from "react";

import { LayersRenderer } from "../prototypes/layers";
import { AppFrame, LoadingScreen } from "../prototypes/ui-components";
import { AutoRotateCamera } from "../prototypes/view/containers/AutoRotateCamera";
import { Environments } from "../prototypes/view/containers/Environments";
import { HighlightedAreas } from "../prototypes/view/containers/HighlightedAreas";
import { PedestrianTool } from "../prototypes/view/containers/PedestrianTool";
import { ReverseGeocoding } from "../prototypes/view/containers/ReverseGeocoding";
import { ScreenSpaceCamera } from "../prototypes/view/containers/ScreenSpaceCamera";
import { ScreenSpaceSelection } from "../prototypes/view/containers/ScreenSpaceSelection";
import { SelectionCoordinator } from "../prototypes/view/containers/SelectionCoordinator";
import { SketchTool } from "../prototypes/view/containers/SketchTool";
import { ToolMachineEvents } from "../prototypes/view/containers/ToolMachineEvents";
import { readyAtom } from "../prototypes/view/states/app";
import { AppHeader } from "../prototypes/view/ui-containers/AppHeader";
import { Notifications } from "../prototypes/view/ui-containers/Notifications";
import { WidgetContext } from "../shared/context/WidgetContext";
import { WidgetProps } from "../shared/types/widget";
import { InitialLayers } from "../shared/view/containers/InitialLayers";
import FeedBack from "../shared/view/ui-container/Feedback";
import MyData from "../shared/view/ui-container/MyData";
import { layerComponents } from "../shared/view-layers/layerComponents";

import { InitializeApp } from "./containers/InitializeApp";
import { useAttachScreenSpaceSelection } from "./hooks/useAttachScreenSpaceSelection";
import { useSelectSketchFeature } from "./hooks/useSelectSketchFeature";

type DefaultProps = {
  geoURL?: string;
  gsiTileURL?: string;
  plateauURL?: string;
  plateauAccessToken?: string;
  catalogURL?: string;
  catalogURLForAdmin?: string;
  projectName?: string;
  googleStreetViewAPIKey?: string;
};

type AppearanceProps = {
  logo?: string;
  primaryColor?: string;
};

type Props = WidgetProps<DefaultProps, AppearanceProps>;

export const Loading: FC = () => {
  const ready = useAtomValue(readyAtom);
  return <AnimatePresence>{!ready && <LoadingScreen />}</AnimatePresence>;
};

export const Widget: FC<Props> = memo(function WidgetPresenter({ widget, inEditor }) {
  useAttachScreenSpaceSelection();
  useSelectSketchFeature();

  return (
    <WidgetContext
      geoUrl={widget.property.default.geoURL}
      gsiTileURL={widget.property.default.gsiTileURL}
      plateauUrl={widget.property.default.plateauURL}
      catalogUrl={widget.property.default.catalogURL}
      catalogURLForAdmin={widget.property.default.catalogURLForAdmin}
      projectId={widget.property.default.projectName}
      plateauToken={widget.property.default.plateauAccessToken}
      googleStreetViewAPIKey={widget.property.default.googleStreetViewAPIKey}
      inEditor={inEditor}
      customPrimaryColor={widget.property.appearance?.primaryColor}
      customLogo={widget.property.appearance?.logo}>
      <InitializeApp />
      <AppFrame header={<AppHeader />} />
      {/* TODO(ReEarth): Support initial layer loading(Splash screen) */}
      <Loading />
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
      <HighlightedAreas />
      <ReverseGeocoding />
      <PedestrianTool />
      <SketchTool />
      <MyData />
      <AutoRotateCamera />
      <ScreenSpaceCamera />
      <FeedBack />
    </WidgetContext>
  );
});
