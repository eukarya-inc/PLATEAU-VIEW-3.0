import { PostMessageProps, MouseEvent } from "@web/extensions/location/core/types";

import html from "../dist/web/location/core/index.html?raw";
import googleAnalyticsHtml from "../dist/web/location/modals/googleAnalytics/index.html?raw";
import terrainHtml from "../dist/web/location/modals/terrain/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html, { width: 350, height: 40 });

reearth.on("mousemove", (mousedata: MouseEvent) => {
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
      point1: reearth.scene.getLocationFromScreen(
        reearth.viewport.width / 2,
        reearth.viewport.height - 1,
      ),
      point2: reearth.scene.getLocationFromScreen(
        reearth.viewport.width / 2 + 1,
        reearth.viewport.height - 1,
      ),
    },
  });
});

reearth.on("message", ({ action }: PostMessageProps) => {
  if (action === "modal-google-open") {
    reearth.modal.show(googleAnalyticsHtml, { background: "transparent", width: 572, height: 670 });
  } else if (action === "modal-terrain-open") {
    reearth.modal.show(terrainHtml, {
      background: "transparent",
      width: 572,
      height: 222,
    });
  } else if (action === "modal-close") {
    reearth.modal.close();
  }
});
