// Plugin state VS Published project state (going to backend for saving)

// Or should we have state management, like Jotai, keeping track of everything separately,
// with everything coming together only on publish/share

// Main api state tree

export type PostMessageProps = { action: string; payload?: any };

export type ReearthApi = {
  default?: {
    camera?: Camera;
    terrain?: boolean;
    sceneMode?: SceneMode;
    depthTestAgainstTerrain?: boolean;
  };
  tiles?: Tile[];
};

export type SceneMode = "3d" | "2d";

type Tile = {
  id: string;
  tile_url: string;
  tile_type: string;
};

type Camera = {
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
  pitch: number;
  roll: number;
};

export type PublishProject = {
  // Here would be all fields being saved to backend
};
