import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import { useTemplateAPI } from "../../../../../../shared/api";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorCommonField,
  EditorSelect,
  EditorSwitch,
} from "../../../../../ui-components";

type FieldComponentTemplateBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const FieldComponentTemplateBlock: React.FC<FieldComponentTemplateBlockProps> = ({
  setting,
  updateSetting,
  ...props
}) => {
  const [useTemplate, setUseTemplate] = useState(!!setting?.fieldComponents?.useTemplate);
  const [templateId, setTemplateId] = useState<string>(setting?.fieldComponents?.templateId ?? "");

  const handleUseTemplateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUseTemplate(e.target.checked);
  }, []);

  const handleTemplateIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateId(e.target.value);
  }, []);

  const { componentTemplatesAtom } = useTemplateAPI();
  const componentTemplates = useAtomValue(componentTemplatesAtom);

  const templateOptions = useMemo(
    () => componentTemplates.map(t => ({ label: t.name, value: t.id })),
    [componentTemplates],
  );

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        fieldComponents: {
          ...s?.fieldComponents,
          useTemplate,
          templateId,
        },
      };
    });
  }, [useTemplate, templateId, updateSetting]);

  return (
    <EditorBlock title="Template" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Use template">
          <EditorSwitch checked={useTemplate} onChange={handleUseTemplateChange} />
        </EditorCommonField>
        {useTemplate && (
          <EditorSelect
            label="Template"
            value={templateId}
            options={templateOptions}
            disabled={!useTemplate}
            onChange={handleTemplateIdChange}
          />
        )}
      </BlockContentWrapper>
    </EditorBlock>
  );
};
