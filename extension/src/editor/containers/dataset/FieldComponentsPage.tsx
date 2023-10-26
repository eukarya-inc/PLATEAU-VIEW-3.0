import { FieldComponentEditor } from "../common/fieldComponentEditor";

import { FieldComponentTemplateBlock } from "./blocks/FieldComponentTemplateBlock";

import { DraftSetting, UpdateSetting } from ".";

type FieldComponentsPageProps = {
  setting: DraftSetting;
  updateSetting: UpdateSetting;
};

export const FieldComponentsPage: React.FC<FieldComponentsPageProps> = ({
  setting,
  updateSetting,
}) => {
  const handleComponentGroupsUpdate = (groups: any) => {
    updateSetting(s => {
      if (!s) return s;
      return { ...s, fieldComponents: { ...s.fieldComponents, groups } };
    });
  };

  return (
    <>
      <FieldComponentTemplateBlock setting={setting} updateSetting={updateSetting} />
      {setting.fieldComponents?.groups && (
        <FieldComponentEditor
          componentsGroups={setting.fieldComponents.groups}
          hidden={setting.fieldComponents.useTemplate}
          onComponentGroupsUpdate={handleComponentGroupsUpdate}
        />
      )}
    </>
  );
};
