import { useAtomValue } from "jotai";
import { type FC } from "react";

import { areasAtom } from "../../../shared/states/address";
import { AppBreadcrumbs, AppBreadcrumbsItem } from "../../ui-components";
// FIXME
// import { LocationBreadcrumbItem } from "./LocationBreadcrumbItem";

export const LocationBreadcrumbs: FC = () => {
  const areas = useAtomValue(areasAtom);
  if (areas == null) {
    return null;
  }
  return (
    <AppBreadcrumbs>
      {[...areas].reverse().map(area => (
        // <LocationBreadcrumbItem key={area.code} area={area} />
        <AppBreadcrumbsItem key={area.code}>{area.name}</AppBreadcrumbsItem>
      ))}
    </AppBreadcrumbs>
  );
};
