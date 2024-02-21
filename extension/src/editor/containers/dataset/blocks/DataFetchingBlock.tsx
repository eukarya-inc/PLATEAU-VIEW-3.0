import { InputAdornment } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { DraftSetting, UpdateSetting } from "..";
import {
  BlockContentWrapper,
  EditorBlock,
  EditorBlockProps,
  EditorCommonField,
  EditorSwitch,
  EditorTextField,
} from "../../ui-components";

type DataFetchingBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const DEFAULT_DATA_FETCHING_BLOCK_VALUE = {
  enabled: false,
};

export const DataFetchingBlock: React.FC<DataFetchingBlockProps> = ({
  setting,
  updateSetting,
  ...props
}) => {
  const [enabled, setEnabled] = useState(
    setting?.general?.dataFetching?.enabled ?? DEFAULT_DATA_FETCHING_BLOCK_VALUE.enabled,
  );
  const [timeInterval, setTimeInterval] = useState<number | string>(
    setting?.general?.dataFetching?.timeInterval ?? "",
  );

  const handleEnabledChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.checked);
  }, []);

  const handleTimeIntervalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const numberTimeInteval = e.target.value === "" ? NaN : Number(e.target.value);
    setTimeInterval(isNaN(numberTimeInteval) ? "" : numberTimeInteval);
  }, []);

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      return {
        ...s,
        general: {
          ...s?.general,
          dataFetching: {
            enabled,
            timeInterval: timeInterval === "" ? undefined : Number(timeInterval),
          },
        },
      };
    });
  }, [enabled, timeInterval, updateSetting]);

  return (
    <EditorBlock title="Data Fetching" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Enable realtime data fetching" inline>
          <EditorSwitch checked={enabled} onChange={handleEnabledChange} />
        </EditorCommonField>
        {enabled && (
          <EditorTextField
            label="Time Interval"
            value={timeInterval}
            onChange={handleTimeIntervalChange}
            type="number"
            InputProps={{
              endAdornment: <InputAdornment position="end">s</InputAdornment>,
            }}
          />
        )}
      </BlockContentWrapper>
    </EditorBlock>
  );
};
