import update from "immutability-helper";
import { useCallback, useState, useRef, useEffect } from "react";

import type {
  Camera,
  Scene,
  Viewport,
  StoryEdit,
  StorySave,
  StoryDelete,
  StoryPlay,
  StoryCancelPlay,
} from "../types";

import { postMsg, generateId } from "./utils";

export const sizes = {
  mini: {
    width: 122,
    height: 40,
  },
  editor: {
    width: undefined,
    height: 178,
  },
  player: {
    width: undefined,
    height: 195,
  },
};

export type Mode = "editor" | "player";
export type Size = { width: number | undefined; height: number };

export default () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const handleViewportResize = useCallback(
    (viewport: Viewport) => {
      if (viewport.isMobile !== isMobile) {
        setIsMobile(viewport.isMobile);
      }
    },
    [isMobile],
  );

  const [mode, setMode] = useState<Mode>("player");

  const [minimized, setMinimized] = useState<boolean>(true);
  const minimizedRef = useRef<boolean>(minimized);
  minimizedRef.current = minimized;

  const [size, setSize] = useState<Size>(sizes.mini);
  const sizeRef = useRef<Size>(size);
  sizeRef.current = size;
  const prevSizeRef = useRef<Size>(sizes.mini);

  const [playerHeight, setPlayerHeight] = useState<number>(sizes.player.height);
  const playerHeightRef = useRef<number>(playerHeight);
  playerHeightRef.current = playerHeight;

  const handleMinimize = useCallback(() => {
    setMinimized(minimized => !minimized);
  }, []);

  const handleSetMode = useCallback(
    (newMode: Mode) => {
      if (newMode !== mode) {
        setMode(newMode);
        if (newMode === "editor") {
          setPlayerHeight(0);
          if (storyId.current) {
            postMsg("storyCancelPlay", {
              id: storyId.current,
            });
            storyId.current = undefined;
          }
        }
      }
    },
    [mode],
  );

  useEffect(() => {
    prevSizeRef.current = sizeRef.current;

    setSize(
      minimized
        ? sizes.mini
        : mode === "editor"
        ? sizes.editor
        : { width: undefined, height: playerHeight },
    );
  }, [minimized, mode, playerHeight]);

  useEffect(() => {
    if (size.height > prevSizeRef.current.height) {
      postMsg("resize", [size.width, size.height, !minimizedRef.current]);
    } else if (size.height < prevSizeRef.current.height) {
      setTimeout(() => {
        if (sizeRef.current === size) {
          postMsg("resize", [size.width, size.height, !minimizedRef.current]);
        }
      }, 500);
    }
  }, [size]);

  // scenes
  const [scenes, setScenes] = useState<Scene[]>([]);

  const sceneCreate = useCallback((scene: Scene) => {
    setScenes(scenes => [...scenes, scene]);
    postMsg("sceneEdit", { id: scene.id, title: scene.title, description: scene.description });
  }, []);

  const sceneView = useCallback((camera: Camera) => {
    postMsg("sceneView", camera);
  }, []);

  const sceneCapture = useCallback(() => {
    postMsg("sceneCapture");
  }, []);

  const sceneRecapture = useCallback((id: string) => {
    postMsg("sceneRecapture", id);
  }, []);

  const sceneEdit = useCallback(
    (id: string) => {
      const scene = scenes.find(scene => scene.id === id);
      if (scene) {
        postMsg("sceneEdit", scene);
      }
    },
    [scenes],
  );

  const sceneMove = useCallback((dragIndex: number, hoverIndex: number) => {
    setScenes((prevScenes: Scene[]) =>
      update(prevScenes, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevScenes[dragIndex] as Scene],
        ],
      }),
    );
  }, []);

  const sceneDelete = useCallback((id: string) => {
    setScenes(scenes => {
      const index = scenes.findIndex(scene => scene.id === id);
      if (index !== -1) {
        scenes.splice(index, 1);
      }
      return [...scenes];
    });
  }, []);

  const handleSceneCapture = useCallback(
    (camera: Camera) => {
      sceneCreate({
        id: generateId(),
        title: "",
        description: "",
        camera,
      });
    },
    [sceneCreate],
  );

  const handleSceneRecapture = useCallback(({ camera, id }: { camera: Camera; id: string }) => {
    setScenes(scenes => {
      const scene = scenes.find(scene => scene.id === id);
      if (scene) {
        scene.camera = camera;
      }
      return [...scenes];
    });
  }, []);

  const handleSceneSave = useCallback((sceneInfo: Omit<Scene, "camera">) => {
    setScenes(scenes => {
      const scene = scenes.find(scene => scene.id === sceneInfo.id);
      if (scene) {
        scene.title = sceneInfo.title;
        scene.description = sceneInfo.description;
      }
      return [...scenes];
    });
  }, []);

  // story
  const storyId = useRef<string>();

  const storyClear = useCallback(() => {
    storyId.current = undefined;
    setScenes([]);
  }, []);

  const storyShare = useCallback(() => {
    postMsg("storyShare", {
      scenes: JSON.stringify(scenes),
    });
  }, [scenes]);

  const handleStoryEdit = useCallback(
    ({ id, scenes }: StoryEdit["payload"]) => {
      handleSetMode("editor");
      storyId.current = id;
      setScenes(scenes ? JSON.parse(scenes) : []);
      if (minimized) {
        handleMinimize();
      }
    },
    [handleSetMode, minimized, handleMinimize],
  );

  const handleStorySave = useCallback(
    ({ id }: StorySave["payload"]) => {
      postMsg("storySaveData", {
        id,
        scenes: JSON.stringify(scenes),
      });
    },
    [scenes],
  );

  const handleStoryDelete = useCallback(({ id }: StoryDelete["payload"]) => {
    if (storyId.current === id) {
      storyId.current = undefined;
      setScenes([]);
    }
  }, []);

  const handleStoryPlay = useCallback(
    ({ id, scenes }: StoryPlay["payload"]) => {
      storyId.current = id;
      setScenes(JSON.parse(scenes ?? "[]"));
      handleSetMode("player");
      if (minimized) {
        handleMinimize();
      }
    },
    [handleSetMode, minimized, handleMinimize],
  );

  const handleStoryCancelPlay = useCallback(
    ({ id }: StoryCancelPlay["payload"]) => {
      if (storyId.current === id) {
        storyId.current = undefined;
        setScenes([]);
        if (!minimized) {
          handleMinimize();
        }
      }
    },
    [minimized, handleMinimize],
  );

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", "#00BEBE");
    postMsg("getViewport");
  }, []);

  const [contentWidth, setContentWidth] = useState<number>(document.body.clientWidth);
  useEffect(() => {
    const viewportResizeObserver = new ResizeObserver(entries => {
      const [entry] = entries;
      let width: number | undefined;

      if (entry.contentBoxSize) {
        const contentBoxSize = Array.isArray(entry.contentBoxSize)
          ? entry.contentBoxSize[0]
          : entry.contentBoxSize;
        width = contentBoxSize.inlineSize;
      } else if (entry.contentRect) {
        width = entry.contentRect.width;
      }

      setContentWidth(width ?? document.body.clientWidth);
    });

    viewportResizeObserver.observe(document.body);

    return () => {
      viewportResizeObserver.disconnect();
    };
  }, []);

  const onMessage = useCallback(
    (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      switch (e.data.action) {
        case "getViewport":
          handleViewportResize(e.data.payload);
          break;
        case "sceneCapture":
          handleSceneCapture(e.data.payload);
          break;
        case "sceneRecapture":
          handleSceneRecapture(e.data.payload);
          break;
        case "sceneSave":
          handleSceneSave(e.data.payload);
          break;
        case "storyEdit":
          handleStoryEdit(e.data.payload);
          break;
        case "storySave":
          handleStorySave(e.data.payload);
          break;
        case "storyDelete":
          handleStoryDelete(e.data.payload);
          break;
        case "storyPlay":
          handleStoryPlay(e.data.payload);
          break;
        case "storyCancelPlay":
          handleStoryCancelPlay(e.data.payload);
          break;
        default:
          break;
      }
    },
    [
      handleViewportResize,
      handleSceneCapture,
      handleSceneRecapture,
      handleSceneSave,
      handleStoryEdit,
      handleStorySave,
      handleStoryDelete,
      handleStoryPlay,
      handleStoryCancelPlay,
    ],
  );

  useEffect(() => {
    addEventListener("message", onMessage);
    return () => {
      removeEventListener("message", onMessage);
    };
  }, [onMessage]);

  return {
    size,
    mode,
    minimized,
    scenes,
    isMobile,
    contentWidth,
    setPlayerHeight,
    handleMinimize,
    handleSetMode,
    sceneCapture,
    sceneView,
    sceneRecapture,
    sceneDelete,
    sceneEdit,
    sceneMove,
    storyClear,
    storyShare,
  };
};
