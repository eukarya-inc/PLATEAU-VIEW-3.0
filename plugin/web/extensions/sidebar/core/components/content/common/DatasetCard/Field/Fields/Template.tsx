import { mergeOverrides } from "@web/extensions/sidebar/core/components/hooks";
import { Select } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo } from "react";

import { BaseFieldProps } from "./types";

const Template: React.FC<BaseFieldProps<"template">> = ({
  value,
  editMode,
  templates,
  onUpdate,
}) => {
  const handleTemplateChange = useCallback(
    (id: string) => {
      const prevTempComponents = templates?.find(t => t.id === value.templateID)?.components;
      const cleanseOverride = mergeOverrides("cleanse", prevTempComponents);

      onUpdate({
        ...value,
        templateID: id,
        override: cleanseOverride,
      });
    },
    [templates, value, onUpdate],
  );

  const templateOptions = useMemo(
    () =>
      templates?.map(t => {
        return {
          value: t.id,
          label: t.name,
        };
      }),
    [templates],
  );

  return editMode ? (
    <div>
      <Title>テンプレート</Title>
      <Select
        options={templateOptions}
        style={{ width: "100%", alignItems: "center", height: "32px" }}
        value={value.templateID ?? templates?.[0].id}
        onChange={handleTemplateChange}
        getPopupContainer={trigger => trigger.parentElement ?? document.body}
      />
    </div>
  ) : null;
};

export default Template;

const Title = styled.p`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
  margin: 0 0 4px 0;
`;
