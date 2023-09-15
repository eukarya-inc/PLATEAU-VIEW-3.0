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
      id: "toolbar-widget",
      type: "widget",
      name: "Toolbar",
      widgetLayout: {
        extendable: {
          horizontally: true,
        },
        defaultLocation: {
          zone: "outer",
          section: "center",
          area: "top",
        },
        extended: true,
      },
    },
    {
      id: "search-widget",
      type: "widget",
      name: "Search",
      widgetLayout: {
        extendable: {
          vertically: true,
        },
        defaultLocation: {
          zone: "inner",
          section: "left",
          area: "middle",
        },
        extended: true,
      },
    },
    {
      id: "inspector-widget",
      type: "widget",
      name: "Inspector",
      widgetLayout: {
        extendable: {
          vertically: true,
        },
        defaultLocation: {
          zone: "inner",
          section: "right",
          area: "middle",
        },
        extended: true,
      },
    },
  ],
};

writeFileSync(resolve("./reearth.yml"), stringify(yml));
