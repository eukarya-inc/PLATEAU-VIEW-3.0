import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { stringify } from "yaml";

import pkg from "./package.json" assert { type: "json" };

const yml = {
  id: "plateau-view-3",
  name: "PLATEAUVIEW3.0",
  version: pkg.version,
  extensions: [
    {
      id: "search-widget",
      type: "widget",
      name: "search",
      widgetLayout: {
        defaultLocation: {
          zone: "outer",
          section: "right",
          area: "top",
        },
      },
    },
    {
      id: "toolbar-widget",
      type: "widget",
      name: "toolbar",
      widgetLayout: {
        defaultLocation: {
          zone: "outer",
          section: "left",
          area: "top",
        },
      },
    },
  ],
};

writeFileSync(resolve("./reearth.yml"), stringify(yml));
