import {
  styled,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  type ToggleButtonGroupProps,
  type ToggleButtonProps,
  useTheme,
} from "@mui/material";
import { useAtom, type WritableAtom } from "jotai";
import {
  forwardRef,
  useCallback,
  type MouseEvent,
  type PropsWithoutRef,
  type ReactNode,
  useEffect,
  RefAttributes,
  useState, // Import useState
} from "react";

import { ParameterItem, type ParameterItemProps } from "./ParameterItem";

const StyledToggleButton = styled(ToggleButton)({
  display: "block",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
});

export interface SegmentParameterItemProps<
  T extends string | number = string | number,
  Exclusive extends boolean = boolean,
> extends PropsWithoutRef<Omit<ToggleButtonGroupProps, "value">>,
    Pick<ParameterItemProps, "label" | "labelFontSize" | "description"> {
  exclusive?: Exclusive;
  atom: WritableAtom<
    Exclusive extends true ? T | null : T[] | null,
    [Exclusive extends true ? T : T[]],
    void
  >;
  val?: string;
  items?: ReadonlyArray<
    readonly [T, ReactNode] | readonly [T, ReactNode, Partial<ToggleButtonProps>]
  >;
}

const SegmentParameterItem = forwardRef<HTMLDivElement, SegmentParameterItemProps>(
  (
    {
      label,
      labelFontSize,
      description,
      exclusive = false,
      atom,
      items,
      onChange,
      children,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useAtom(atom);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("mobile"));

    const [defaultValueSet, setDefaultValueSet] = useState(false);

    const handleChange = useCallback(
      (event: MouseEvent<HTMLElement>, value: (string | number) | Array<string | number>) => {
        setValue(value);
        onChange?.(event, value);
        if (isMobile) {
          localStorage.setItem("graphicValue", JSON.stringify(value));
        }
      },
      [isMobile, onChange, setValue],
    );

    const storedValue = localStorage.getItem("graphicValue");
    useEffect(() => {
      if (isMobile && !defaultValueSet && !storedValue) {
        const defaultValue = items?.find(item => item[0] === "low");
        defaultValue && setValue(defaultValue[0]);
        setDefaultValueSet(value => !value);
      }
    }, [isMobile, setValue, items, value, defaultValueSet, storedValue]);

    return (
      <ParameterItem
        ref={ref}
        label={label}
        labelFontSize={labelFontSize}
        description={description}
        gutterBottom>
        <ToggleButtonGroup
          size="small"
          fullWidth
          {...props}
          exclusive={exclusive}
          value={value}
          onChange={handleChange}>
          {items != null
            ? items.map(([value, content, props]) => (
                <StyledToggleButton {...props} key={value} value={value}>
                  {content}
                </StyledToggleButton>
              ))
            : children}
        </ToggleButtonGroup>
      </ParameterItem>
    );
  },
) as <T extends string | number, Exclusive extends boolean = false>(
  props: SegmentParameterItemProps<T, Exclusive> & RefAttributes<HTMLDivElement>,
) => JSX.Element;

export default SegmentParameterItem;
