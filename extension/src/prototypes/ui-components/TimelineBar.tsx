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

const defaultFullWidth = 248;
const minTickWidth = 5;
const endPadding = 30;
const labelWidth = 50;

const tickGroupSettings = [
  { name: "second", ms: 1000 },
  { name: "min", ms: 60000 },
  { name: "tenmin", ms: 600000 },
  { name: "halfhour", ms: 1800000 },
  { name: "hour", ms: 3600000 },
  { name: "day", ms: 86400000 },
  { name: "month", ms: 2592000000 },
  { name: "year", ms: 31536000000 },
];

const getTicks = (duration: Duration, fullWidth: number, msStep: number) => {
  if (duration.msDuration <= msStep) return [];
  const stepPx = fullWidth / (duration.msDuration / msStep);
  if (stepPx < minTickWidth) return [];
  const ticks: { left: number; ms: number }[] = [];
  const start = msStep - (duration.msStart % msStep);
  for (let t = duration.msStart + start; t <= duration.msEnd; t += msStep) {
    ticks.push({ left: ((t - duration.msStart) / duration.msDuration) * 100, ms: t });
  }
  return ticks;
};

type LabelProps = {
  date: Date;
  left: number;
  timezone: string;
};
const Label: React.FC<LabelProps> = ({ date, left }) => {
  const [dateString, timeString] = formatDate(date);
  return (
    <StyledLabel left={left}>
      <DateLabel>{dateString}</DateLabel>
      <TimeLabel>{timeString}</TimeLabel>
    </StyledLabel>
  );
};

const TimelineBar: React.FC<TimelineBarProps> = ({
  startDate,
  endDate,
  currentDate,
  timezone,
  onChange,
}) => {
  const [fullWidth, setFullWidth] = useState(defaultFullWidth);
  const [maxLevel, setMaxLevel] = useState(0);

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

  const tickGroups = useMemo(() => {
    let innerMaxLevel = 0;
    const tg = tickGroupSettings.map((type, i) => {
      const ticks = getTicks(duration, fullWidth, type.ms);
      if (ticks.length > 0 && i > innerMaxLevel) innerMaxLevel = i;
      return {
        ticks,
        name: type.name,
      };
    });
    setMaxLevel(innerMaxLevel);
    return tg;
  }, [duration, fullWidth]);

  const dynamicMaxLevelLabels = useMemo(() => {
    let startPx = labelWidth / 2;
    const endPx = fullWidth - labelWidth / 2;
    const labels: { left: number; date: Date }[] = [];
    for (let i = 0; i < tickGroups[maxLevel].ticks.length; i++) {
      const tick = tickGroups[maxLevel].ticks[i];
      const labelStartPx = (tick.left / 100) * fullWidth - labelWidth / 2;
      if (labelStartPx > startPx && labelStartPx + labelWidth < endPx) {
        startPx = labelStartPx;
        labels.push({ left: tick.left, date: new Date(tick.ms) });
      }
    }
    return labels;
  }, [tickGroups, maxLevel, fullWidth]);

  return (
    <StyledTimelineBar>
      <ContentWrapper>
        <TrackWrapper ref={trackWrapperRef}>
          <Tick key="start" left={0} level={4} />
          <Tick key="end" left={100} level={4} />
          {tickGroups.map((tickGroup, level) => {
            return tickGroup.ticks.map((t, i) => (
              <Tick key={`${tickGroup.name}-${i}`} left={t.left} level={3 - (maxLevel - level)} />
            ));
          })}
        </TrackWrapper>
        <LabelWrapper>
          <Label date={new Date(duration.msStart)} left={0} timezone={timezone} />
          <Label date={new Date(duration.msEnd)} left={100} timezone={timezone} />
          {dynamicMaxLevelLabels.map((label, i) => (
            <Label key={i} date={label.date} left={label.left} timezone={timezone} />
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

const StyledLabel = styled("div")<{ left: number }>(({ left, theme }) => ({
  position: "absolute",
  top: 1,
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

export default TimelineBar;

const localTimezoneOffset = new Date().getTimezoneOffset();

// Need to change date with timezone to calculate correct day-breaking etc.
const getDateWithTimezone = (date: Date, timezone: string) => {
  const timezoneOffset = Number(timezone) * 60 * 60 * 1000;
  return new Date(date.getTime() + timezoneOffset);
};

// Need to remove effect of local timezone to display correct date.
const formatDate = (date: Date) => {
  const timezoneOffset = localTimezoneOffset * 60 * 1000;
  const dateWithoutLocalTimezone = new Date(date.getTime() + timezoneOffset);
  const mm = dateWithoutLocalTimezone.getMonth() + 1;
  const dd = dateWithoutLocalTimezone.getDate();
  const HH = dateWithoutLocalTimezone.getHours();
  const MM = dateWithoutLocalTimezone.getMinutes();
  const SS = dateWithoutLocalTimezone.getSeconds();

  return [
    `${mm < 10 ? "0" + mm : mm}月${dd < 10 ? "0" + dd : dd}日`,
    `${HH < 10 ? "0" + HH : HH}:${MM < 10 ? "0" + MM : MM}:${SS < 10 ? "0" + SS : SS}`,
  ];
};
