import { CameraBlock } from "./blocks/CameraBlock";
import { DataBlock } from "./blocks/DataBlock";
import { DataFetchingBlock } from "./blocks/DataFetchingBlock";
import { EventBlock } from "./blocks/EventBlock";

import { DraftSetting, EditorDataset, UpdateSetting } from ".";

type GeneralPageProps = {
  dataset?: EditorDataset;
  setting: DraftSetting;
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
      <DataBlock
        key={`${setting.datasetId}-${setting.dataId}-data`}
        dataset={dataset}
        dataId={dataId}
        expanded={false}
      />
      <CameraBlock
        key={`${setting.datasetId}-${setting.dataId}-camera`}
        setting={setting}
        updateSetting={updateSetting}
        expanded={false}
      />
      <DataFetchingBlock
        key={`${setting.datasetId}-${setting.dataId}-data-fetching`}
        setting={setting}
        updateSetting={updateSetting}
        expanded={false}
      />
      <EventBlock
        key={`${setting.datasetId}-${setting.dataId}-event`}
        setting={setting}
        updateSetting={updateSetting}
        expanded={false}
      />
    </>
  );
};
