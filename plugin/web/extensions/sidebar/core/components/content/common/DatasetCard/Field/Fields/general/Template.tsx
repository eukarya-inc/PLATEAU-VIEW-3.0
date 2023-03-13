import { mergeOverrides } from "@web/extensions/sidebar/core/components/hooks/utils";
import { Select } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo } from "react";

import FieldComponent from "../..";
import { BaseFieldProps } from "../types";

const Template: React.FC<BaseFieldProps<"template">> = ({
  value,
  dataID,
  editMode,
  activeIDs,
  templates,
  configData,
  onUpdate,
  onCurrentGroupUpdate,
}) => {
  const hasTemplates = useMemo(() => templates && templates.length > 0, [templates]);

  const fieldComponents = useMemo(
    () =>
      (value.components?.length
        ? value.components
        : hasTemplates
        ? templates?.find(t => t.id === value.templateID)?.components ?? templates?.[0].components
        : undefined
      )?.filter(t => activeIDs?.includes(t.id)),
    [value.templateID, activeIDs, value.components, templates, hasTemplates],
  );

  const handleTemplateChange = useCallback(
    (id: string) => {
      const cleanseOverride = mergeOverrides("cleanse", fieldComponents);

      onUpdate({
        ...value,
        templateID: id,
        components: templates?.find(t => t.id === id)?.components ?? [],
        override: cleanseOverride,
      });
    },
    [value, fieldComponents, templates, onUpdate],
  );

  const handleFieldUpdate = useCallback(
    (id: string) => (property: any) => {
      const newComponents = [...(fieldComponents ?? [])];

      const componentIndex = newComponents?.findIndex(c => c.id === id);

      if (!newComponents || componentIndex === undefined) return;

      newComponents[componentIndex] = { ...property };

      onUpdate({
        ...value,
        components: newComponents,
      });
    },
    [value, fieldComponents, onUpdate],
  );

  const templateOptions = useMemo(
    () =>
      hasTemplates
        ? templates?.map(t => {
            return {
              value: t.id,
              label: t.name,
            };
          })
        : [{ value: "-", label: "-" }],
    [templates, hasTemplates],
  );

  return (
    <>
      {editMode ? (
        <div>
          <Title>テンプレート</Title>
          {hasTemplates ? (
            <Select
              options={templateOptions}
              style={{ width: "100%", alignItems: "center", height: "32px" }}
              value={value.templateID ?? templates?.[0].id}
              onChange={handleTemplateChange}
              getPopupContainer={trigger => trigger.parentElement ?? document.body}
            />
          ) : (
            <Text>保存されているテンプレートがないです。</Text>
          )}
        </div>
      ) : (
        fieldComponents?.map(tc => (
          <FieldComponent
            key={tc.id}
            field={tc}
            editMode={editMode}
            dataID={dataID}
            activeIDs={activeIDs}
            isActive={!!activeIDs?.find(id => id === tc.id)}
            templates={templates}
            configData={configData}
            onUpdate={handleFieldUpdate}
            onCurrentGroupUpdate={onCurrentGroupUpdate}
          />
        ))
      )}
    </>
  );
};

export default Template;

const Title = styled.p`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 4px 0;
`;

const Text = styled.p`
  margin: 0;
`;
