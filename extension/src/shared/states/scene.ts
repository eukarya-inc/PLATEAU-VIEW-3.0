import { SceneProperty } from "../reearth/scene";
import { sharedAtom } from "../sharedAtoms";

const initialScene: SceneProperty = {};

export const sceneAtom = sharedAtom("scene", initialScene);
