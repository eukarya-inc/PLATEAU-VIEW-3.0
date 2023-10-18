import { CameraBlock } from "./blocks/CameraBlock";
import { DataBlock } from "./blocks/DataBlock";

import { DraftSetting, EditorDataset, UpdateSetting } from ".";

type GeneralPageProps = {
  dataset?: EditorDataset;
  setting?: DraftSetting;
  dataId?: string;
  updateSetting?: UpdateSetting;
};

export const GeneralPage: React.FC<GeneralPageProps> = ({
  dataset,
  setting,
  dataId,
  updateSetting,
}) => {
  return (
    <>
      <DataBlock dataset={dataset} dataId={dataId} expanded={false} />
      <CameraBlock setting={setting} updateSetting={updateSetting} expanded={false} />
    </>
  );
};
