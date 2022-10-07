import { PostMessageProps } from "@web/extensions/sidebar/types";

import html from "../dist/web/sidebar/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html);

// Sending messages to sidebar

// reearth.ui.postMessage({ message: "A secret message from Re:Earth." }, "*");

reearth.on("message", ({ action, payload }: PostMessageProps) => {
  //   if (msg.act === "getTiles") {
  //     const tiles = reearth.visualizer.property.tiles;
  //     reearth.ui.postMessage(tiles, "*");
  //   } else if (msg.act === "setTile") {
  //     reearth.visualizer.overrideProperty({
  //       tiles: [{ id: msg.payload, tile_type: "url", tile_url: msg.payload }],
  //     });
  //   } else if (msg.act === "setView") {
  //     if (msg.payload === "3d-terrain") {
  //       reearth.visualizer.overrideProperty({
  //         default: {
  //           sceneMode: "3d",
  //           terrain: true,
  //         },
  //       });
  //     } else if (msg.payload === "3d-smooth") {
  //       reearth.visualizer.overrideProperty({
  //         default: {
  //           sceneMode: "3d",
  //           terrain: false,
  //         },
  //       });
  //     } else if (msg.payload === "2d") {
  //       reearth.visualizer.overrideProperty({
  //         default: {
  //           sceneMode: "2d",
  //           terrain: false,
  //         },
  //       });
  //     }
  //   }
  console.log("-------------MESSAGE-------------");
  if (action === "updateOverrides") {
    console.log("action: ", action);
    console.log("payload: ", payload);
    reearth.visualizer.overrideProperty(payload);
  }
  console.log("-------------MESSAGE END-------------");
});
