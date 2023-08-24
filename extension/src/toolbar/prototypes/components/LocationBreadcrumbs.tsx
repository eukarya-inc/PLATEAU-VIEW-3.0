import { type FC } from "react";

import { AppBreadcrumbs, AppBreadcrumbsItem } from "../../../prototypes/ui-components";
// FIXME
// import { areasAtom } from "../../shared/states/address";
// import { LocationBreadcrumbItem } from "./LocationBreadcrumbItem";

export const LocationBreadcrumbs: FC = () => {
  const areas = ["Prefecture", "Municipality", "City"];
  // useAtomValue(areasAtom);
  if (areas == null) {
    return null;
  }
  return (
    <AppBreadcrumbs>
      {[...areas].reverse().map(area => (
        // <LocationBreadcrumbItem key={area.code} area={area} />
        <AppBreadcrumbsItem key={area}>{area}</AppBreadcrumbsItem>
      ))}
    </AppBreadcrumbs>
  );
};
