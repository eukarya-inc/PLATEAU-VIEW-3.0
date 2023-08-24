import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { countAtom } from "../shared/states/count";

export const Widget = () => {
  const reearth = (window as any).reearth;
  const [count, setCount] = useState(0);
  const [{ value: globalCount }, setGlobalCount] = useAtom(countAtom);

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
    }, 10);
  }, [reearth]);

  return (
    <div style={{ background: "green" }}>
      <button onClick={() => setCount(n => n + 1)}>Count: {count}</button>
      <br />
      <button onClick={() => setGlobalCount(c => c + 1)}>Global;: {globalCount}</button>
    </div>
  );
};