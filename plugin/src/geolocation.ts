import { PostMessageProps } from "@web/extensions/geolocation/core/types";

import html from "../dist/web/geolocation/core/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html);

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  if (action === "flyTo") {
    reearth.layers.add({
      extensionId: "marker",
      isVisible: true,
      title: "myLocation",
      property: {
        default: {
          location: {
            lat: payload.currentLocation.latitude,
            lng: payload.currentLocation.longitude,
          },
          style: "point",
          pointColor: "#12BDE2",
          pointOutlineWidth: 4,
          pointOutlineColor: "#FFFFFF",
        },
      },
    });

    reearth.camera.flyTo(
      {
        lat: payload.currentLocation.latitude,
        lng: payload.currentLocation.longitude,
        height: payload.currentLocation.altitude,
        heading: reearth.camera.position?.heading ?? 0,
        pitch: -Math.PI / 2,
        roll: 0,
        fov: reearth.camera.position?.fov ?? 0.75,
      },
      {
        duration: 2,
      },
    );
  }
});
