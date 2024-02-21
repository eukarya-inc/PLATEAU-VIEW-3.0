import { useCallback, useEffect, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorSelect,
  EditorTextField,
} from "../../ui-components";

export const DEFAULT_EVENT_BLOCK_VALUE: {
  eventType: "openFeatureInspector" | "openNewTab";
  urlType: "manual" | "fromData";
  websiteURL: string;
  fieldName: string;
} = {
  eventType: "openFeatureInspector",
  urlType: "manual",
  websiteURL: "",
  fieldName: "",
};

export type EventBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

const eventTypeOptions = [
  {
    label: "Open feature inspector",
    value: "openFeatureInspector",
  },
  {
    label: "Open new tab",
    value: "openNewTab",
  },
];

const urlTypeOptions = [
  {
    label: "Manual",
    value: "manual",
  },
  {
    label: "From data",
    value: "fromData",
  },
];

export const EventBlock: React.FC<EventBlockProps> = ({ setting, updateSetting, ...props }) => {
  const [eventType, setEventType] = useState(
    setting?.general?.featureClickEvent?.eventType ?? DEFAULT_EVENT_BLOCK_VALUE.eventType,
  );

  const [urlType, setUrlType] = useState(
    setting?.general?.featureClickEvent?.urlType ?? DEFAULT_EVENT_BLOCK_VALUE.urlType,
  );
  const [websiteURL, setWebsiteURL] = useState(
    setting?.general?.featureClickEvent?.websiteURL ?? DEFAULT_EVENT_BLOCK_VALUE.websiteURL,
  );
  const [fieldName, setFieldName] = useState(
    setting?.general?.featureClickEvent?.fieldName ?? DEFAULT_EVENT_BLOCK_VALUE.fieldName,
  );

  const handleEventTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "openFeatureInspector" || e.target.value === "openNewTab") {
      setEventType(e.target.value);
    }
  }, []);

  const handleUrlTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "manual" || e.target.value === "fromData") {
      setUrlType(e.target.value);
    }
  }, []);

  const handleWebsiteUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteURL(e.target.value);
  }, []);

  const handleFieldNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldName(e.target.value);
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
            websiteURL,
            fieldName,
          },
        },
      };
    });
  }, [eventType, urlType, websiteURL, fieldName, updateSetting]);

  return (
    <EditorBlock title="Event" expandable {...props}>
      <BlockContentWrapper>
        <EditorSelect
          label="Feature Click Event Type"
          value={eventType}
          options={eventTypeOptions}
          onChange={handleEventTypeChange}
        />
        {eventType === "openNewTab" && (
          <EditorSelect
            label="URL Type"
            value={urlType}
            options={urlTypeOptions}
            onChange={handleUrlTypeChange}
          />
        )}
        {eventType === "openNewTab" && urlType === "manual" && (
          <EditorTextField
            label="Website URL"
            value={websiteURL}
            onChange={handleWebsiteUrlChange}
          />
        )}
        {eventType === "openNewTab" && urlType === "fromData" && (
          <EditorTextField label="Field Name" value={fieldName} onChange={handleFieldNameChange} />
        )}
      </BlockContentWrapper>
    </EditorBlock>
  );
};
