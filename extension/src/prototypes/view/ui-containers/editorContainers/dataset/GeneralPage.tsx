import { Dataset } from "../../../../../shared/api/types";
import { CameraBlock } from "../../editorBlocks/CameraBlock";
import { DataBlock } from "../../editorBlocks/DataBlock";

import { DraftSetting } from ".";

type GeneralPageProps = {
  dataset?: Dataset;
  setting?: DraftSetting;
  dataId?: string;
  updateSetting?: React.Dispatch<React.SetStateAction<DraftSetting | undefined>>;
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
