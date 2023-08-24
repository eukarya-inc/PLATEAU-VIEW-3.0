import { useEffect } from "react";

import { AppFrame } from "../prototypes/ui-components";

import { AppHeader } from "./components/AppHeader";

export const Widget = () => {
  const reearth = (window as any).reearth;

  useEffect(() => {
    const layerId = reearth.layers.add({
      type: "simple",
      data: {
        type: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json",
      },
      "3dtiles": {},
    });
    setTimeout(() => {
      reearth.camera.flyTo(layerId, { duration: 0 });
    }, 100);
  }, [reearth]);

  return <AppFrame header={<AppHeader />} />;
};
