import Inspector from "./inspector";
import Search from "./search";
import StreetView from "./streetView";
import Toolbar from "./toolbar";

const pluginId = `plateau-view-3~${process.env.VERSION}`;

const localPlugin = {
  id: pluginId,
  name: "plateau-view-3",
  widgets: [Toolbar, Search, Inspector, StreetView],
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
