import { useCallback, useEffect, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorSelect,
  EditorTextField,
} from "../../ui-components";

export const DEFAULT_FEATURE_INSPECTOR_BASIC_BLOCK_VALUE: {
  titleType: TitleType;
  customTitle: string;
  displayType: DisplayType;
} = {
  titleType: "datasetType",
  customTitle: "",
  displayType: "auto",
};

type FeatureInspectorBasicBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

type TitleType = "datasetType" | "custom";

// auto (default): Use preset if available, otherwise use propertyList
// builtin: Hardcoded building | flood | etc.
// propertyList: List of properties (with emphasis properties)
// CZMLDescription: Render the description from the CZML property field
type DisplayType = "auto" | "builtin" | "propertyList" | "CZMLDescription";

const titleTypeOptions = [
  {
    label: "Dataset type name",
    value: "datasetType",
  },
  {
    label: "Custom",
    value: "custom",
  },
];

const displayTypeOptions = [
  {
    label: "Auto",
    value: "auto",
  },
  {
    label: "Built-in",
    value: "builtin",
  },
  {
    label: "Property list",
    value: "propertyList",
  },
  {
    label: "CZML description (HTML)",
    value: "CZMLDescription",
  },
];

export const FeatureInspectorBasicBlock: React.FC<FeatureInspectorBasicBlockProps> = ({
  setting,
  updateSetting,
  ...props
}) => {
  const [titleType, setTitleType] = useState<TitleType>(
    setting?.featureInspector?.basic?.titleType ??
      DEFAULT_FEATURE_INSPECTOR_BASIC_BLOCK_VALUE.titleType,
  );
  const [customTitle, setCustomTitle] = useState(
    setting?.featureInspector?.basic?.customTitle ??
      DEFAULT_FEATURE_INSPECTOR_BASIC_BLOCK_VALUE.customTitle,
  );
  const [displayType, setDisplayType] = useState<DisplayType>(
    setting?.featureInspector?.basic?.displayType ??
      DEFAULT_FEATURE_INSPECTOR_BASIC_BLOCK_VALUE.displayType,
  );

  const handleTitleTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (titleTypeOptions.map(o => o.value).includes(e.target.value)) {
      setTitleType(e.target.value as TitleType);
    }
  }, []);

  const handleCustomTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitle(e.target.value);
  }, []);

  const handleDisplayTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (displayTypeOptions.map(o => o.value).includes(e.target.value)) {
      setDisplayType(e.target.value as DisplayType);
    }
  }, []);

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        featureInspector: {
          ...s?.featureInspector,
          basic: {
            titleType,
            customTitle,
            displayType,
          },
        },
      };
    });
  }, [titleType, customTitle, displayType, updateSetting]);

  return (
    <EditorBlock title="Basic Setting" expandable {...props}>
      <BlockContentWrapper>
        <EditorSelect
          label="Title"
          value={titleType}
          options={titleTypeOptions}
          onChange={handleTitleTypeChange}
        />
        {titleType === "custom" && (
          <EditorTextField
            label="Custom Title"
            value={customTitle}
            onChange={handleCustomTitleChange}
          />
        )}
        <EditorSelect
          label="Display Type"
          value={displayType}
          options={displayTypeOptions}
          onChange={handleDisplayTypeChange}
        />
      </BlockContentWrapper>
    </EditorBlock>
  );
};
