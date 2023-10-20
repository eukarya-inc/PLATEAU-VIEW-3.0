import { FieldComponentEditor } from "../common/fieldComponentEditor";

import { FieldComponentTemplateBlock } from "./blocks/FieldComponentTemplateBlock";

import { DraftSetting, UpdateSetting } from ".";

type FieldComponentsPageProps = {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const FieldComponentsPage: React.FC<FieldComponentsPageProps> = ({
  setting,
  updateSetting,
}) => {
  return (
    <>
      <FieldComponentTemplateBlock setting={setting} updateSetting={updateSetting} />
      <FieldComponentEditor
        fieldComponentsGroups={setting?.fieldComponents?.groups}
        hidden={setting?.fieldComponents?.useTemplate}
        updateSetting={updateSetting}
      />
    </>
  );
};
