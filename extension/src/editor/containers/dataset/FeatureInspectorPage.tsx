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
  // const handleFeatureInspectorUpdate = (featureInspectorSettings: FeatureInspectorSettings) => {
  //   updateSetting(s => {
  //     if (!s) return s;
  //     return {
  //       ...s,
  //       featureInspector: { ...s.featureInspector, featureInspector: featureInspectorSettings },
  //     };
  //   });
  // };

  return (
    <>
      <FeatureInspectorBasicBlock setting={setting} updateSetting={updateSetting} />
      <FeatureInspectorEmphasisPropertyBlock setting={setting} updateSetting={updateSetting} />
    </>
  );
};
