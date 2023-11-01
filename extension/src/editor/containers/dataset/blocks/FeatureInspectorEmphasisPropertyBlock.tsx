import { Divider } from "@mui/material";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import { useTemplateAPI } from "../../../../shared/api";
import { EmphasisProperty, EmphasisPropertyTemplate } from "../../../../shared/api/types";
import { EmphasisPropertyEditor } from "../../common/emphasisPropertyEditor";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorCommonField,
  EditorSelect,
  EditorSwitch,
} from "../../ui-components";

type FeatureInspectorEmphasisPropertyBlockProps = EditorBlockProps & {
  setting: DraftSetting;
  updateSetting: UpdateSetting;
};

export const FeatureInspectorEmphasisPropertyBlock: React.FC<
  FeatureInspectorEmphasisPropertyBlockProps
> = ({ setting, updateSetting }) => {
  const [useTemplate, setUseTemplate] = useState(
    !!setting?.featureInspector?.emphasisProperty?.useTemplate,
  );
  const [templateId, setTemplateId] = useState<string>(
    setting?.featureInspector?.emphasisProperty?.templateId ?? "",
  );

  const handleUseTemplateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUseTemplate(e.target.checked);
  }, []);

  const handleTemplateIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateId(e.target.value);
  }, []);

  const { templatesAtom } = useTemplateAPI();
  const templates = useAtomValue(templatesAtom);

  const emphasisPropertyTemplates = useMemo(
    () =>
      templates
        ? (templates?.filter(t => t.type === "emphasis") as EmphasisPropertyTemplate[])
        : [],
    [templates],
  );

  const templateOptions = useMemo(
    () => emphasisPropertyTemplates.map(t => ({ label: t.name, value: t.id })),
    [emphasisPropertyTemplates],
  );

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        featureInspector: {
          ...s?.featureInspector,
          emphasisProperty: {
            ...s?.featureInspector?.emphasisProperty,
            useTemplate,
            templateId,
          },
        },
      };
    });
  }, [useTemplate, templateId, updateSetting]);

  const handlePropertiesUpdate = useCallback(
    (properties: EmphasisProperty[]) => {
      updateSetting?.(s => {
        if (!s) return s;
        return {
          ...s,
          featureInspector: {
            ...s?.featureInspector,
            emphasisProperty: {
              ...s?.featureInspector?.emphasisProperty,
              properties,
            },
          },
        };
      });
    },
    [updateSetting],
  );

  return (
    <EditorBlock title="Emphasis Property" expandable>
      <BlockContentWrapper>
        <EditorCommonField label="Use template" inline>
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
      {!useTemplate && (
        <>
          <Divider />
          <BlockContentWrapper>
            <EmphasisPropertyEditor
              id={`__emphasis-property-${setting.datasetId}-${setting.dataId}__`}
              properties={setting?.featureInspector?.emphasisProperty?.properties ?? []}
              onPropertiesUpdate={handlePropertiesUpdate}
            />
          </BlockContentWrapper>
        </>
      )}
    </EditorBlock>
  );
};
