import Search from "./search";
import Toolbar from "./toolbar";

const pluginId = "plateau-view-3~1.0.0";

const localPlugin = {
  id: pluginId,
  name: "plateau-view-3",
  widgets: [Toolbar, Search],
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
