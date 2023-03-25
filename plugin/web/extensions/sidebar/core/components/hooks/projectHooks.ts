import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import { Project, ReearthApi } from "@web/extensions/sidebar/types";
import { generateID, mergeProperty, postMsg } from "@web/extensions/sidebar/utils";
import {
  flattenComponents,
  getActiveFieldIDs,
  getDefaultGroup,
} from "@web/extensions/sidebar/utils/dataset";
import { merge } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

import { BuildingSearch, Data, DataCatalogItem, Template } from "../../types";
import {
  StoryItem,
  Story as FieldStory,
  FieldComponent,
} from "../content/common/DatasetCard/Field/Fields/types";

import { mergeOverrides } from "./utils";

export const defaultProject: Project = {
  sceneOverrides: {
    default: {
      camera: {
        lat: 35.65075152248653,
        lng: 139.7617718208305,
        altitude: 2219.7187259974316,
        heading: 6.132702058010316,
        pitch: -0.5672459184621266,
        roll: 0.00019776785897196447,
        fov: 1.0471975511965976,
        height: 2219.7187259974316,
      },
      sceneMode: "3d",
      depthTestAgainstTerrain: false,
    },
    terrain: {
      terrain: true,
      terrainType: "cesiumion",
      terrainCesiumIonAccessToken:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE",
      terrainCesiumIonAsset: "770371",
    },
    tiles: [
      {
        id: "tokyo_1",
        tile_url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
        tile_type: "url",
      },
      {
        id: "tokyo_2",
        tile_url:
          "https://gic-plateau.s3.ap-northeast-1.amazonaws.com/2020/ortho/tiles/{z}/{x}/{y}.png",
        tile_type: "url",
      },
    ],
    atmosphere: { shadows: true },
    light: {
      lightType: "directionalLight",
      lightColor: "#e5f5ffff",
      lightIntensity: 10,
      lightDirectionX: 0.8,
      lightDirectionY: -0.7,
      lightDirectionZ: -0.1,
    },
  },
  datasets: [],
  userStory: undefined,
};

export default ({
  fieldTemplates,
  backendURL,
  backendProjectName,
  processedCatalog,
  buildingSearch,
}: {
  fieldTemplates?: Template[];
  backendURL?: string;
  backendProjectName?: string;
  processedCatalog: DataCatalogItem[];
  buildingSearch?: BuildingSearch;
}) => {
  const [projectID, setProjectID] = useState<string>();
  const [project, updateProject] = useState<Project>(defaultProject);
  const [cleanseOverride, setCleanseOverride] = useState<any>();

  const processOverrides = useCallback(
    (dataset: DataCatalogItem, activeIDs?: string[]) => {
      if (!activeIDs) return undefined;
      let overrides = undefined;

      const flattenedComponents = flattenComponents(dataset.components);
      const inactiveFields = flattenedComponents
        ?.filter(c => !activeIDs.find(id => id === c.id))
        .map(c => {
          if (c.type === "switchDataset" && !c.cleanseOverride) {
            c.cleanseOverride = {
              data: {
                url: dataset.config?.data?.[0].url,
                time: {
                  updateClockOnLoad: false,
                },
              },
            };
          }
          return c;
        });
      const activeFields = flattenedComponents
        ?.filter(c => !!activeIDs.find(id => id === c.id))
        .map(c => {
          if (c.type === "switchDataset" && !c.cleanseOverride) {
            c.cleanseOverride = {
              data: {
                url: dataset.config?.data?.[0].url,
                time: {
                  updateClockOnLoad: false,
                },
              },
            };
          }
          return c;
        });

      const buildingSearchField = buildingSearch?.find(b => b.dataID === dataset.dataID);
      if (buildingSearchField) {
        if (buildingSearchField.active) {
          activeFields?.push(buildingSearchField.field as FieldComponent);
        } else {
          inactiveFields?.push(buildingSearchField.cleanseField as FieldComponent);
        }
      }

      const cleanseOverrides = mergeOverrides("cleanse", inactiveFields, cleanseOverride);
      overrides = mergeOverrides("update", activeFields, cleanseOverrides);

      setCleanseOverride(undefined);

      return overrides;
    },
    [cleanseOverride, buildingSearch],
  );

  const handleProjectSceneUpdate = useCallback(
    (updatedProperties: Partial<ReearthApi>) => {
      updateProject(({ sceneOverrides, datasets }) => {
        const updatedProject: Project = {
          sceneOverrides: [sceneOverrides, updatedProperties].reduce((p, v) => mergeProperty(p, v)),
          datasets,
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        return updatedProject;
      });
    },
    [updateProject],
  );

  const handleProjectDatasetAdd = useCallback(
    (dataset: DataCatalogItem | UserDataItem) => {
      const datasetToAdd = { ...dataset } as DataCatalogItem;

      if (!dataset.components?.length) {
        const defaultTemplate = fieldTemplates?.find(ft =>
          dataset.type2
            ? ft.name.includes(dataset.type2)
            : dataset.type
            ? ft.name.includes(dataset.type)
            : undefined,
        );
        if (defaultTemplate && !datasetToAdd.components) {
          datasetToAdd.components = [
            {
              id: generateID(),
              type: "template",
              templateID: defaultTemplate.id,
              userSettings: {
                components: defaultTemplate.components,
              },
            },
          ];
        }
      }

      updateProject(project => {
        const datasets = [...project.datasets];
        datasets.unshift(datasetToAdd);
        const updatedProject: Project = {
          ...project,
          datasets,
        };

        postMsg({ action: "updateProject", payload: updatedProject });

        return updatedProject;
      });

      const selectedGroup = getDefaultGroup(datasetToAdd.components);

      const activeIDs = getActiveFieldIDs(
        datasetToAdd.components,
        selectedGroup,
        datasetToAdd.config?.data,
      );

      const overrides = processOverrides(datasetToAdd, activeIDs);

      postMsg({
        action: "addDatasetToScene",
        payload: {
          dataset: datasetToAdd,
          overrides,
        },
      });
    },
    [fieldTemplates, processOverrides],
  );

  const handleProjectDatasetRemove = useCallback((dataID: string) => {
    updateProject(({ sceneOverrides, datasets }) => {
      const updatedProject = {
        sceneOverrides,
        datasets: datasets.filter(d => d.dataID !== dataID),
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
    postMsg({ action: "removeDatasetFromScene", payload: dataID });
  }, []);

  const handleProjectDatasetRemoveAll = useCallback(() => {
    updateProject(({ sceneOverrides }) => {
      const updatedProject = {
        sceneOverrides,
        datasets: [],
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
    postMsg({ action: "removeAllDatasetsFromScene" });
  }, []);

  const handleProjectDatasetsUpdate = useCallback((datasets: DataCatalogItem[]) => {
    updateProject(({ sceneOverrides }) => {
      const updatedProject = {
        sceneOverrides,
        datasets,
      };
      postMsg({ action: "updateProject", payload: updatedProject });
      return updatedProject;
    });
  }, []);

  const handleOverride = useCallback(
    (dataID: string, activeIDs?: string[]) => {
      const dataset = project.datasets.find(d => d.dataID === dataID);
      if (dataset) {
        const overrides = processOverrides(dataset, activeIDs);

        postMsg({
          action: "updateDatasetInScene",
          payload: { dataID, overrides },
        });
      }
    },
    [project.datasets, processOverrides],
  );

  const handleStorySaveData = useCallback(
    (story: StoryItem & { dataID?: string }) => {
      if (story.id && story.dataID) {
        // save database story
        updateProject(project => {
          const tarStory = (
            project.datasets
              .find(d => d.dataID === story.dataID)
              ?.components?.find(c => c.type === "story") as FieldStory
          )?.stories?.find((st: StoryItem) => st.id === story.id);
          if (tarStory) {
            tarStory.scenes = story.scenes;
          }
          return project;
        });
      }

      // save user story
      updateProject(project => {
        const updatedProject: Project = {
          ...project,
          userStory: {
            scenes: story.scenes,
          },
        };
        postMsg({ action: "updateProject", payload: updatedProject });
        return updatedProject;
      });
    },
    [updateProject],
  );

  const handleInitUserStory = useCallback((story: StoryItem) => {
    postMsg({ action: "storyPlay", payload: story });
  }, []);

  const fetchedSharedProject = useRef(false);

  useEffect(() => {
    if (!backendURL || !backendProjectName || fetchedSharedProject.current) return;
    if (projectID && processedCatalog.length) {
      (async () => {
        const res = await fetch(`${backendURL}/share/${backendProjectName}/${projectID}`);
        if (res.status !== 200) return;
        const data = await res.json();
        if (data) {
          (data.datasets as Data[]).forEach(d => {
            const dataset = processedCatalog.find(item => item.dataID === d.dataID);
            const mergedDataset: DataCatalogItem = merge(dataset, d, {});
            if (mergedDataset) {
              handleProjectDatasetAdd(mergedDataset);
            }
          });
          if (data.userStory && data.userStory.length > 0) {
            handleInitUserStory(data.userStory);
          }
          handleProjectSceneUpdate(data.sceneOverrides);
        }
        fetchedSharedProject.current = true;
      })();
    }
  }, [
    projectID,
    backendURL,
    backendProjectName,
    processedCatalog,
    handleProjectDatasetAdd,
    handleInitUserStory,
    handleProjectSceneUpdate,
  ]);

  return {
    project,
    updateProject,
    setProjectID,
    setCleanseOverride,
    handleProjectSceneUpdate,
    handleProjectDatasetAdd,
    handleProjectDatasetRemove,
    handleProjectDatasetRemoveAll,
    handleProjectDatasetsUpdate,
    handleStorySaveData,
    handleOverride,
  };
};
