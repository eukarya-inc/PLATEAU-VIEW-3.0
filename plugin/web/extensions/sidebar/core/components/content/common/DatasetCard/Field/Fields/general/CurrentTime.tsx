import { Field } from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/common";
import {
  TextInput,
  Wrapper,
} from "@web/extensions/sidebar/core/components/content/common/DatasetCard/Field/commonComponents";
import { isEqual, pick } from "lodash";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BaseFieldProps } from "../types";

const CurrentTime: React.FC<BaseFieldProps<"currentTime">> = ({
  value,
  editMode,
  onUpdate,
  onSceneUpdate,
}) => {
  const [options, setOptions] = useState({
    date: value.date,
    time: value.time,
  });
  const updaterRef = useRef<() => void>();
  const debouncedUpdater = useMemo(
    () => debounce(() => updaterRef.current?.(), 500, { maxWait: 1000 }),
    [],
  );

  const isInitialized = useRef(false);
  const handleUpdate = useCallback(() => {
    if (isInitialized.current && isEqual(options, pick(value, "date", "time"))) {
      return;
    }
    isInitialized.current = true;

    onUpdate({
      ...value,
      date: options.date,
      time: options.time,
    });

    const currentTimeStr = (() => {
      const dateStr = [options.date, options.time].filter(s => !!s).join("T");
      try {
        return new Date(dateStr).toISOString();
      } catch {
        return new Date().toISOString();
      }
    })();
    onSceneUpdate({
      timeline: {
        current: currentTimeStr,
        start: currentTimeStr,
      },
    });
  }, [value, options, onUpdate, onSceneUpdate]);

  const handleChange = useCallback(
    (prop: keyof typeof options) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.currentTarget.value;
      setOptions(v => {
        const next = { ...v, [prop]: text };
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    updaterRef.current = handleUpdate;
    debouncedUpdater();
  }, [handleUpdate, debouncedUpdater]);

  useEffect(
    () => () => {
      // TODO: Use undefined to reset time.
      // But currently we can not override scene property with undefined.
      const now = Date.now();
      const start = new Date(now - 86400000).toISOString();
      const stop = new Date(now).toISOString();
      onSceneUpdate({
        timeline: {
          current: start,
          start,
          stop,
        },
      });
    },
    [onSceneUpdate],
  );

  return editMode ? (
    <Wrapper>
      <Field
        title="日付"
        titleWidth={87}
        value={
          <TextInput
            value={options.date}
            placeholder="YYYY-MM-DD"
            onChange={handleChange("date")}
          />
        }
      />
      <Field
        title="時間"
        titleWidth={87}
        value={
          <TextInput
            value={options.time}
            placeholder="HH:mm:ss.sss"
            onChange={handleChange("time")}
          />
        }
      />
    </Wrapper>
  ) : null;
};

export default CurrentTime;
