import { UserDataItem } from "@web/extensions/sidebar/modals/datacatalog/types";
import { Project, ReearthApi } from "@web/extensions/sidebar/types";
import { generateID, mergeProperty, postMsg } from "@web/extensions/sidebar/utils";
import { merge } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

import { Data, DataCatalogItem, Template } from "../../types";
import {
  FieldComponent,
  StoryItem,
  Story as FieldStory,
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
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NGI5ZDM0Mi1jZDIzLTRmMzEtOTkwYi0zZTk4Yzk3ODZlNzQiLCJpZCI6NDA2NDYsImlhdCI6MTYwODk4MzAwOH0.3rco62ErML11TMSEflsMqeUTCDbIH6o4n4l5sssuedE",
      terrainCesiumIonAsset: "286503",
    },
    tiles: [
      {
        id: "tokyo",
        tile_url: "https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
        tile_type: "url",
      },
    ],
    atmosphere: { shadows: true },
  },
  datasets: [],
  userStory: undefined,
};

export default ({
  fieldTemplates,
  backendURL,
  backendProjectName,
  processedCatalog,
}: {
  fieldTemplates?: Template[];
  backendURL?: string;
  backendProjectName?: string;
  processedCatalog: DataCatalogItem[];
}) => {
  const [projectID, setProjectID] = useState<string>();
  const [project, updateProject] = useState<Project>(defaultProject);
  const [cleanseOverride, setCleanseOverride] = useState<string>();

  const processOverrides = useCallback(
    (dataset: DataCatalogItem, activeIDs?: string[]) => {
      if (!activeIDs) return undefined;
      let overrides = undefined;

      const inactivefields = dataset?.components?.filter(c => !activeIDs.find(id => id === c.id));
      const inactiveTemplates = inactivefields?.filter(af => af.type === "template");
      if (inactiveTemplates) {
        const inactiveTemplateFields = inactiveTemplates
          .map(
            at =>
              fieldTemplates?.find(ft => at.type === "template" && at.templateID === ft.id)
                ?.components,
          )
          .reduce((acc, field) => [...(acc ?? []), ...(field ?? [])], []);

        if (inactiveTemplateFields) {
          inactivefields?.push(...inactiveTemplateFields);
        }
      }

      const activeFields: FieldComponent[] | undefined = dataset?.components
        ?.filter(c => !!activeIDs.find(id => id === c.id))
        .map(c2 => {
          if (c2.type === "template") {
            return [
              c2,
              ...(c2.components?.length
                ? c2.components
                : fieldTemplates?.find(ft => ft.id === c2.templateID)?.components ?? []),
            ];
          }
          return c2;
        })
        .reduce((acc: FieldComponent[], field: FieldComponent | FieldComponent[] | undefined) => {
          if (!field) return acc;
          return [...acc, ...(Array.isArray(field) ? field : [field])];
        }, []);

      const cleanseOverrides = mergeOverrides("cleanse", inactivefields, cleanseOverride);
      overrides = mergeOverrides("update", activeFields, cleanseOverrides);

      setCleanseOverride(undefined);

      return overrides;
    },
    [fieldTemplates, cleanseOverride],
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

      updateProject(project => {
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
                components: defaultTemplate.components,
              },
            ];
          }
        }

        const updatedProject: Project = {
          ...project,
          datasets: [...project.datasets, datasetToAdd],
        };

        postMsg({ action: "updateProject", payload: updatedProject });

        return updatedProject;
      });

      const activeIDs = (
        !datasetToAdd.components?.find(c => c.type === "switchGroup") || !datasetToAdd.fieldGroups
          ? datasetToAdd.components
          : datasetToAdd.components.filter(
              c =>
                (c.group && c.group === datasetToAdd.fieldGroups?.[0].id) ||
                c.type === "switchGroup",
            )
      )
        ?.filter(c => !(!datasetToAdd.config?.data && c.type === "switchDataset"))
        ?.map(c => c.id);

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
    handleStorySaveData,
    handleOverride,
  };
};
