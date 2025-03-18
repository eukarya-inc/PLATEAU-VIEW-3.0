import { styled, Slider, sliderClasses } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

type TimelineBarProps = {
  startDate: Date;
  endDate: Date;
  currentDate: Date;
  timezone: string;
  onChange: (event: Event, value: number | number[]) => void;
};

type Duration = {
  msStart: number;
  msEnd: number;
  msDuration: number;
};

type TickUnit = "second" | "min" | "tenmin" | "halfhour" | "hour" | "day" | "month" | "year";

const defaultFullWidth = 248;
const minTickWidth = 5;
const endPadding = 30;

const tickGroupSettings: { unit: TickUnit; ms: number }[] = [
  { unit: "second", ms: 1000 },
  { unit: "min", ms: 60000 },
  { unit: "tenmin", ms: 600000 },
  { unit: "halfhour", ms: 1800000 },
  { unit: "hour", ms: 3600000 },
];

const getTicks = (duration: Duration, fullWidth: number, msStep: number) => {
  if (duration.msDuration <= msStep) return [];
  const stepPx = fullWidth / (duration.msDuration / msStep);
  if (stepPx < minTickWidth) return [];
  const ticks: { left: number; ms: number }[] = [];

  for (let t = duration.msStart; t <= duration.msEnd; t += msStep) {
    ticks.push({ left: ((t - duration.msStart) / duration.msDuration) * 100, ms: t });
  }
  return ticks;
};

type LabelProps = {
  startMs: number;
  ms: number;
  left: number;
  hourOnly: boolean;
};
const Label: React.FC<LabelProps> = ({ startMs, ms, left, hourOnly }) => {
  const [hourString, timeString] = useMemo(() => formatDuration(startMs, ms), [startMs, ms]);
  return (
    <StyledLabel left={left} top={6}>
      {hourOnly && <DateLabel>{hourString}</DateLabel>}
      {!hourOnly && <TimeLabel>{timeString}</TimeLabel>}
    </StyledLabel>
  );
};

const TimelineBarForPastTime: React.FC<TimelineBarProps> = ({
  startDate,
  endDate,
  currentDate,
  timezone,
  onChange,
}) => {
  const [fullWidth, setFullWidth] = useState(defaultFullWidth);

  const duration: Duration = useMemo(() => {
    const msStart = getDateWithTimezone(startDate, timezone).getTime();
    const msEnd = getDateWithTimezone(endDate, timezone).getTime();
    const msDuration = msEnd - msStart;
    return {
      msStart,
      msEnd,
      msDuration,
    };
  }, [startDate, endDate, timezone]);

  const hourOnly = useMemo(() => duration.msDuration > 3600000, [duration.msDuration]);

  const trackWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const [entry] = entries;
      let width: number | undefined;
      if (entry.borderBoxSize?.length > 0) {
        const borderBoxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;
        width = borderBoxSize.inlineSize;
      } else if (entry.contentRect) {
        width = entry.contentRect.width;
      } else {
        width = trackWrapperRef.current?.clientWidth;
      }
      setFullWidth(width ?? defaultFullWidth);
    });
    if (trackWrapperRef.current) {
      resizeObserver.observe(trackWrapperRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [trackWrapperRef]);

  const [tickGroups, maxLevel] = useMemo(() => {
    let innerMaxLevel = 0;
    const tg = tickGroupSettings.map((type, i) => {
      const ticks = getTicks(duration, fullWidth, type.ms);
      if (ticks.length > 0 && i > innerMaxLevel) innerMaxLevel = i;
      return {
        ticks,
        unit: type.unit,
      };
    });
    return [tg, innerMaxLevel];
  }, [duration, fullWidth]);

  const dynamicMaxLevelLabels = useMemo(() => {
    const labelWidth = hourOnly ? 50 : 60;
    let startPx = labelWidth / 2;
    const endPx = fullWidth - labelWidth / 2;
    const labels: { left: number; ms: number }[] = [];
    for (let i = 0; i < tickGroups[maxLevel].ticks.length; i++) {
      const tick = tickGroups[maxLevel].ticks[i];
      const labelStartPx = (tick.left / 100) * fullWidth - labelWidth / 2;
      if (labelStartPx > startPx && labelStartPx + labelWidth < endPx) {
        startPx = labelStartPx + labelWidth;
        labels.push({ left: tick.left, ms: tick.ms });
      }
    }
    return labels;
  }, [tickGroups, maxLevel, fullWidth, hourOnly]);

  return (
    <StyledTimelineBar>
      <ContentWrapper>
        <TrackWrapper ref={trackWrapperRef}>
          <Tick key="start" left={0} level={4} />
          <Tick key="end" left={100} level={4} />
          {tickGroups.map((tickGroup, level) => {
            return tickGroup.ticks.map((t, i) => (
              <Tick key={`${tickGroup.unit}-${i}`} left={t.left} level={3 - (maxLevel - level)} />
            ));
          })}
        </TrackWrapper>
        <LabelWrapper>
          <Label startMs={duration.msStart} ms={duration.msStart} left={0} hourOnly={hourOnly} />
          <Label startMs={duration.msStart} ms={duration.msEnd} left={100} hourOnly={hourOnly} />
          {dynamicMaxLevelLabels.map((label, i) => (
            <Label
              key={i}
              startMs={duration.msStart}
              ms={label.ms}
              left={label.left}
              hourOnly={hourOnly}
            />
          ))}
        </LabelWrapper>
        <StyledSlider
          value={currentDate?.getTime()}
          min={startDate?.getTime()}
          max={endDate?.getTime()}
          onChange={onChange}
        />
      </ContentWrapper>
    </StyledTimelineBar>
  );
};

const StyledTimelineBar = styled("div")(() => ({
  position: "relative",
  width: "100%",
  height: 32,
  backgroundColor: "#F3F3F3",
  borderRadius: "10px",
  padding: `0 ${endPadding}px`,

  "*": {
    boxSizing: "border-box",
  },
}));

const ContentWrapper = styled("div")(() => ({
  position: "relative",
  height: 32,
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  [`&.${sliderClasses.root}`]: {
    padding: "14px 0",
  },
  [`.${sliderClasses.thumb}`]: {
    width: 6,
    height: 36,
    borderRadius: theme.shape.borderRadius,
  },
  [`.${sliderClasses.track}, .${sliderClasses.rail}`]: {
    opacity: 0,
  },
}));

const TrackWrapper = styled("div")(() => ({
  position: "absolute",
  pointerEvents: "none",
  width: "100%",
  height: 10,
  bottom: 0,
  left: 0,
}));

const Tick = styled("div")<{ left: number; level: number }>(({ left, level }) => ({
  position: "absolute",
  bottom: 0,
  left: `${left}%`,
  width: 1,
  height: level * 2,
  backgroundColor: level >= 3 ? "#999" : level === 2 ? "#aaa" : "#ccc",
}));

const LabelWrapper = styled("div")(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: 32,
}));

const StyledLabel = styled("div")<{ left: number; top: number }>(({ left, top, theme }) => ({
  position: "absolute",
  top,
  left: `${left}%`,
  transform: "translateX(-50%) scale(0.85)",
  textAlign: "center",
  fontSize: theme.typography.body2.fontSize,
  color: "#999",
  lineHeight: "1",
}));

const DateLabel = styled("div")(() => ({
  whiteSpace: "nowrap",
}));

const TimeLabel = styled("div")(() => ({
  whiteSpace: "nowrap",
}));

export default TimelineBarForPastTime;

// Need to change date with timezone to calculate correct day-breaking etc.
const getDateWithTimezone = (date: Date, timezone: string) => {
  const timezoneOffset = Number(timezone) * 60 * 60 * 1000;
  return new Date(date.getTime() + timezoneOffset);
};

const formatDuration = (start: number, end: number) => {
  const duration = end - start;
  const HH = Math.floor(duration / 3600000);
  const MM = Math.floor((duration % 3600000) / 60000);
  const SS = Math.floor((duration % 60000) / 1000);

  return [
    `${HH < 10 ? "0" + HH : HH}時間`,
    `${MM < 10 ? "0" + MM : MM}分${SS < 10 ? "0" + SS : SS}秒`,
  ];
};
