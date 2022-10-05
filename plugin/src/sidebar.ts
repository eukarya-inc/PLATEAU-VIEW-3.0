import html from "../dist/web/sidebar/index.html?raw";

const reearth = (globalThis as any).reearth;

reearth.ui.show(html);

// Sending messages to sidebar

// reearth.ui.postMessage({ message: "A secret message from Re:Earth." }, "*");

// Receiving messages from sidebar

// reearth.on("message", (msg: any) => {
//   console.log(msg, "MESSAGES SSS");
//   console.log(reearth.visualizer, "vizzzz");
//   if (msg.act === "getTiles") {
//     const tiles = reearth.visualizer.property.tiles;
//     reearth.ui.postMessage(tiles, "*");
//   }
// });
