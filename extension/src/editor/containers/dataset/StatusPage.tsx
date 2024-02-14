import { StatusBlock } from "./blocks/StatusBlock";

import { DraftSetting, EditorDataset, UpdateSetting } from ".";

type StatusPageProps = {
  dataset?: EditorDataset;
  setting: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const StatusPage: React.FC<StatusPageProps> = ({ dataset, setting, updateSetting }) => {
  return <StatusBlock dataset={dataset} setting={setting} updateSetting={updateSetting} />;
};
