import { useMemo } from "react";

import { EXPERIMENTAL_clipping } from "../../reearth/types";
import { TilesetDrawClippingField } from "../../types/fieldComponents/3dtiles";

export const useDrawClipping = (
  component: TilesetDrawClippingField | undefined,
): EXPERIMENTAL_clipping | undefined => {
  const drawClippingProps = useMemo(
    () =>
      component?.value
        ? {
            draw: {
              enabled: component?.value.enabled,
              surfacePoints: component?.value.drawGeometryCoordinates?.map(c => ({
                lng: c[0],
                lat: c[1],
              })),
              direction: component?.value.direction,
              visible: component?.value.visible,
              top: component?.value.top,
              bottom: component?.value.bottom,
            },
          }
        : undefined,
    [component?.value],
  );

  return drawClippingProps;
};
