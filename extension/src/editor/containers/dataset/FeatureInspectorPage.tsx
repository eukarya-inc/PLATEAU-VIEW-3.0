import { FeatureInspectorBasicBlock } from "./blocks/FeatureInspectorBasicBlock";
import { FeatureInspectorEmphasisPropertyBlock } from "./blocks/FeatureInspectorEmphasisPropertyBlock";

import { DraftSetting, UpdateSetting } from ".";

type FeatureInspectorPageProps = {
  setting: DraftSetting;
  updateSetting: UpdateSetting;
};

export const FeatureInspectorPage: React.FC<FeatureInspectorPageProps> = ({
  setting,
  updateSetting,
}) => {
  return (
    <>
      <FeatureInspectorBasicBlock
        key={`${setting.datasetId}-${setting.dataId}-feature-inspector-basic`}
        setting={setting}
        updateSetting={updateSetting}
      />
      <FeatureInspectorEmphasisPropertyBlock setting={setting} updateSetting={updateSetting} />
    </>
  );
};
