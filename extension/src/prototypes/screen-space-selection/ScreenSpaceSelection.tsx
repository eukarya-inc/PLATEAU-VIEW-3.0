import { useSetAtom } from "jotai";
import { useEffect, useMemo, type FC } from "react";

import { assignPropertyProps } from "../react-helpers";

// import { Marquee } from "./Marquee";
// import { pickMany } from "./pickMany";
import { ScreenSpaceSelectionHandler } from "./ScreenSpaceSelectionHandler";
import {
  addScreenSpaceSelectionObjectsAtom,
  removeScreenSpaceSelectionObjectsAtom,
  replaceScreenSpaceSelectionObjectsAtom,
  screenSpaceSelectionHandlerAtom,
} from "./states";

const defaultOptions = {
  disabled: false,
};

type ScreenSpaceSelectionOptions = Partial<typeof defaultOptions>;

export type ScreenSpaceSelectionProps = ScreenSpaceSelectionOptions;

export const ScreenSpaceSelection: FC<ScreenSpaceSelectionProps> = ({ ...options }) => {
  const handler = useMemo(() => new ScreenSpaceSelectionHandler(), []);

  if (handler != null) {
    assignPropertyProps(handler, options, defaultOptions);
  }

  const setHandler = useSetAtom(screenSpaceSelectionHandlerAtom);
  useEffect(() => {
    setHandler(handler ?? null);
  }, [handler, setHandler]);

  const replace = useSetAtom(replaceScreenSpaceSelectionObjectsAtom);
  const add = useSetAtom(addScreenSpaceSelectionObjectsAtom);
  const remove = useSetAtom(removeScreenSpaceSelectionObjectsAtom);

  useEffect(() => {
    return handler?.change.addEventListener(event => {
      if (!event) return;

      let objects: object[] = [];

      // TODO(ReEarth): Need to handle groundPrimitives API
      // Ignore ground primitives to pick objects below them.
      // TODO: Support ground primitives.
      // const showGroundPrimitives = scene.groundPrimitives.show;
      // scene.groundPrimitives.show = false;

      switch (event.type) {
        case "point": {
          const object = window.reearth?.layers?.selectedFeature;
          if (object != null) {
            objects = [object];
          }
          break;
        }
        case "rectangle": {
          // TODO(ReEarth): Support selecting multiple features
          // const { x, y, width, height } = event.rectangle;
          // if (width > 0 && height > 0) {
          //   pointScratch.x = x + width / 2;
          //   pointScratch.y = y + height / 2;
          //   objects = pickMany(scene, pointScratch, width, height);
          // }
          break;
        }
      }
      // scene.groundPrimitives.show = showGroundPrimitives;
      ({ replace, add, remove })[event.action](objects);
    });
  }, [handler, replace, add, remove]);

  // return <Marquee />;
  return null;
};
