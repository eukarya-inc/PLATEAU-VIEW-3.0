import { useCallback, useEffect, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorSelect,
  EditorTextField,
} from "../../../../../ui-components";

export type EventBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

const eventTypeOptions = [
  {
    label: "Open Feature Inspector",
    value: "openFeatureInspector",
  },
  {
    label: "Jump to URL",
    value: "jumpToUrl",
  },
];

const urlTypeOptions = [
  {
    label: "Manual",
    value: "manual",
  },
  {
    label: "Feature Property",
    value: "featureProperty",
  },
];

export const EventBlock: React.FC<EventBlockProps> = ({ setting, updateSetting, ...props }) => {
  const [eventType, setEventType] = useState(
    setting?.general?.featureClickEvent?.eventType ?? "openFeatureInspector",
  );

  const [urlType, setUrlType] = useState(setting?.general?.featureClickEvent?.urlType ?? "manual");
  const [manualUrl, setManualUrl] = useState(setting?.general?.featureClickEvent?.manualUrl ?? "");
  const [featurePropertyName, setFeaturePropertyName] = useState(
    setting?.general?.featureClickEvent?.featurePropertyName ?? "",
  );

  const handleEventTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "openFeatureInspector" || e.target.value === "jumpToUrl") {
      setEventType(e.target.value);
    }
  }, []);

  const handleUrlTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "manual" || e.target.value === "featureProperty") {
      setUrlType(e.target.value);
    }
  }, []);

  const handleManualUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setManualUrl(e.target.value);
  }, []);

  const handleFeaturePropertyNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFeaturePropertyName(e.target.value);
  }, []);

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        general: {
          ...s?.general,
          featureClickEvent: {
            eventType,
            urlType,
            manualUrl,
            featurePropertyName,
          },
        },
      };
    });
  }, [eventType, urlType, manualUrl, featurePropertyName, updateSetting]);

  return (
    <EditorBlock title="Event" expandable {...props}>
      <BlockContentWrapper>
        <EditorSelect
          label="Feature Click Event Type"
          value={eventType}
          options={eventTypeOptions}
          onChange={handleEventTypeChange}
        />
        {eventType === "jumpToUrl" && (
          <EditorSelect
            label="Feature Click Event Type"
            value={urlType}
            options={urlTypeOptions}
            onChange={handleUrlTypeChange}
          />
        )}
        {eventType === "jumpToUrl" && urlType === "manual" && (
          <EditorTextField label="Manual URL" value={manualUrl} onChange={handleManualUrlChange} />
        )}
        {eventType === "jumpToUrl" && urlType === "featureProperty" && (
          <EditorTextField
            label="Feature Property Name"
            value={featurePropertyName}
            onChange={handleFeaturePropertyNameChange}
          />
        )}
      </BlockContentWrapper>
    </EditorBlock>
  );
};
