import { SceneProperty } from "../reearth/types";
import { sharedAtom } from "../sharedAtoms";

const initialScene: SceneProperty = {};

export const sceneAtom = sharedAtom("scene", initialScene);
