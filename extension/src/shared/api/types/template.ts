import { ComponentGroup } from "./component";
import { Infobox } from "./infobox";

export type Template = {
  id: string; // This should be like `Building model/LOD2/Default`
  groups: ComponentGroup[];
  infobox?: Infobox;
};
