import { isReEarthAPIv2 } from "./reearth";

export const inEditor = () =>
  isReEarthAPIv2(window.reearth)
    ? !!window.reearth?.viewer?.env?.inEditor
    : !!window.reearth?.scene?.inEditor;
