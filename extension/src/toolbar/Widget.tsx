import { useEffect } from "react";

import { AppFrame } from "../prototypes/ui-components";

import { AppHeader } from "./prototypes/components/AppHeader";

export const Widget = () => {
  const reearth = (window as any).reearth;

  useEffect(() => {
    const layerId = reearth.layers.add({
      type: "simple",
      data: {
        type: "3dtiles",
        url: "https://assets.cms.plateau.reearth.io/assets/4f/702958-5009-4d6b-a2e0-157c7e573eb2/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod2_no_texture/tileset.json",
      },
      "3dtiles": {},
    });
    setTimeout(() => {
      reearth.camera.flyTo(layerId, { duration: 0 });
    }, 100);
  }, [reearth]);

  return <AppFrame header={<AppHeader />} />;
};
