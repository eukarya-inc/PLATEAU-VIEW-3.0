import GoogleAnalyticstModal from "@web/extensions/location/modals/googleAnalyticsModal";
import TerrainModal from "@web/extensions/location/modals/terrainModal";
import { PostMessageProps, MouseEventData } from "@web/extensions/location/types";

import html from "../dist/web/location/core/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html);

reearth.on("mousemove", (mousedata: MouseEventData) => {
  reearth.ui.postMessage(
    {
      type: "mousedata",
      payload: mousedata,
    },
    "*",
  );
});
reearth.on("cameramove", () => {
  reearth.ui.postMessage({
    type: "getLocations",
    payload: {
      point1: reearth.scene.getLocationFromScreenPosition(
        reearth.viewport.width / 2,
        reearth.viewport.height - 1,
      ),
      point2: reearth.scene.getLocationFromScreenPosition(
        reearth.viewport.width / 2 + 1,
        reearth.viewport.height - 1,
      ),
    },
  });
});
reearth.on("message", ({ action }: PostMessageProps) => {
  if (action === "modal-google-open") {
    reearth.modal.show(GoogleAnalyticstModal);
  } else if (action === "modal-terrain-open") {
    reearth.modal.show(TerrainModal);
  } else if (action === "modal-close") {
    reearth.modal.close();
  }
});
