import Editor from "./editor";
import Inspector from "./inspector";
import Search from "./search";
import StreetView from "./streetView";
import Toolbar from "./toolbar";

const loadCSS = () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${import.meta.env.PLATEAU_ORIGIN}/style.css`;
  document.head.appendChild(link);
};
loadCSS();

const pluginId = `plateau-view-3~${process.env.VERSION}`;

const localPlugin = {
  id: pluginId,
  name: "plateau-view-3",
  widgets: [Toolbar, Search, Inspector, StreetView, Editor],
  //    blocks: [
  //      {
  //        type: "block",
  //        extensionId: "localblock",
  //        name: "LocalBlock",
  //        component: LocalBlock,
  //      },
  //    ],
};

export default localPlugin;
