import { PostMessageProps } from "@web/extensions/sidebar/types";

import html from "../dist/web/sidebar/index.html?raw";
import modalHtml from "../dist/web/sidebar/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html);

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  if (action === "updateOverrides") {
    reearth.visualizer.overrideProperty(payload);
  } else if (action === "screenshot" || action === "screenshot-save") {
    reearth.ui.postMessage({
      type: action,
      payload: reearth.scene.captureScreen(),
    });
  } else if (action === "modal") {
    reearth.modal.show(modalHtml);
  }
});

reearth.on("update", () => {
  reearth.ui.postMessage({
    type: "extended",
    payload: reearth.widget.extended,
  });
});
