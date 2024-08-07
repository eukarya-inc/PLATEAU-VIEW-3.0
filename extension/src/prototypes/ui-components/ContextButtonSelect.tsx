import {
  Button,
  buttonClasses,
  Divider,
  filledInputClasses,
  Select,
  selectClasses,
  Stack,
  styled,
  type ButtonProps,
  type SelectChangeEvent,
  type SelectProps,
} from "@mui/material";
import { forwardRef, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import invariant from "tiny-invariant";

import { PrefixedAddSmallIcon, PrefixedCheckSmallIcon } from "./icons";
import { DropDownIcon } from "./icons/DropDownIcon";

const StyledButton = styled(Button)(({ theme }) => ({
  height: theme.spacing(5),
  paddingRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  [`& .${buttonClasses.startIcon}`]: {
    marginRight: theme.spacing(0.75),
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  height: theme.spacing(5),
  [`& .${selectClasses.select}`]: {
    // Increase specificity
    [`&.${selectClasses.select}`]: {
      height: "100%",
      [`&.${filledInputClasses.input}`]: {
        paddingRight: theme.spacing(2),
      },
    },
  },
  [`& .${selectClasses.icon}`]: {
    left: "50%",
    transform: "translate(-50%, 0)",
  },
})) as unknown as typeof Select; // For generics

const StyledDivider = styled(Divider)(({ theme }) => ({
  height: theme.spacing(2),
  marginRight: -1,
}));

const renderValue = (): null => null;

export interface ContextButtonSelectProps extends Omit<SelectProps<string>, "onClick"> {
  label: ReactNode;
  onClick?: ButtonProps["onClick"];
}

export const ContextButtonSelect = forwardRef<HTMLDivElement, ContextButtonSelectProps>(
  ({ label, value, onChange, onClick, children, ...props }, forwardedRef) => {
    const [open, setOpen] = useState(false);

    const handleChange = useCallback(
      (event: SelectChangeEvent<string[]>, value: ReactNode) => {
        const values = event.target.value;
        invariant(Array.isArray(values));
        event.target.value = values[values.length - 1] ?? "";
        onChange?.(event as SelectChangeEvent<string>, value);
        setOpen(false);
      },
      [onChange],
    );

    // WORKAROUND: https://github.com/mui/material-ui/issues/25578#issuecomment-1104779355
    const selectRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
      const handler = (event: MouseEvent): void => {
        if (selectRef.current?.contains(event.target as Node) === true) {
          setOpen(true);
        } else if (
          menuRef.current?.contains(event.target as Node) !== true &&
          menuRef.current?.parentElement !== event.target
        ) {
          setOpen(false);
        }
      };
      window.addEventListener("mouseup", handler);
      return () => {
        window.removeEventListener("mouseup", handler);
      };
    }, []);

    const selected = value != null && value !== "";

    return (
      <Stack ref={forwardedRef} direction="row" alignItems="center" height="100%">
        <StyledButton
          variant="text"
          size="small"
          color={selected ? "primary" : "inherit"}
          startIcon={
            selected ? (
              <PrefixedCheckSmallIcon color="primary" fontSize="small" />
            ) : (
              <PrefixedAddSmallIcon color="action" fontSize="small" />
            )
          }
          onClick={onClick}>
          {label}
        </StyledButton>
        <StyledDivider orientation="vertical" variant="middle" light />
        <StyledSelect
          ref={selectRef}
          open={open}
          variant="filled"
          size="small"
          multiple
          value={value != null && value !== "" ? [value] : []}
          IconComponent={DropDownIcon}
          {...(props as SelectProps<string[]>)}
          renderValue={renderValue}
          onChange={handleChange}
          MenuProps={{
            ...props.MenuProps,
            MenuListProps: {
              ...props.MenuProps?.MenuListProps,
              ref: menuRef,
            },
          }}>
          {children}
        </StyledSelect>
      </Stack>
    );
  },
);
