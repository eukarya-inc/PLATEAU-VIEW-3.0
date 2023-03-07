import { mergeOverrides } from "@web/extensions/sidebar/core/components/hooks";
import { Select } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo } from "react";

import FieldComponent from "../..";
import { BaseFieldProps } from "../types";

const Template: React.FC<BaseFieldProps<"template">> = ({
  value,
  dataID,
  editMode,
  templates,
  configData,
  onUpdate,
}) => {
  const hasTemplates = useMemo(() => templates && templates.length > 0, [templates]);

  const currentTempComponents = useMemo(
    () => (hasTemplates ? templates?.find(t => t.id === value.templateID)?.components : undefined),
    [value.templateID, templates, hasTemplates],
  );

  const handleTemplateChange = useCallback(
    (id: string) => {
      const cleanseOverride = mergeOverrides("cleanse", currentTempComponents);

      onUpdate({
        ...value,
        templateID: id,
        components: templates?.find(t => t.id === id)?.components ?? [],
        override: cleanseOverride,
      });
    },
    [value, currentTempComponents, templates, onUpdate],
  );

  const handleFieldUpdate = useCallback(
    (id: string) => (property: any) => {
      const newComponents = value.components
        ? [...(value.components.length ? value.components : currentTempComponents ?? [])]
        : [];
      const componentIndex = newComponents?.findIndex(c => c.id === id);

      if (!newComponents || componentIndex === undefined) return;

      newComponents[componentIndex] = { ...property };

      onUpdate({
        ...value,
        components: newComponents,
      });
    },
    [value, currentTempComponents, onUpdate],
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
        (value.components?.length ? value.components : currentTempComponents)?.map((tc, idx) => (
          <FieldComponent
            key={idx}
            field={tc}
            editMode={editMode}
            dataID={dataID}
            isActive
            templates={templates}
            configData={configData}
            onUpdate={handleFieldUpdate}
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
