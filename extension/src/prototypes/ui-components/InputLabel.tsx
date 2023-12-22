import { useFormControlContext } from "@mui/base/FormControl";
import { styled } from "@mui/material";
import { useState, useEffect } from "react";

export const Label = styled(
  ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const formControlContext = useFormControlContext();
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
      if (formControlContext?.filled) {
        setDirty(true);
      }
    }, [formControlContext]);

    if (formControlContext === undefined) {
      return <p>{children}</p>;
    }

    const { error, required, filled } = formControlContext;
    const showRequiredError = dirty && required && !filled;

    return (
      <p className={`${className} ${error || showRequiredError ? "invalid" : ""}`}>
        {children}
        {required ? " *" : ""}
      </p>
    );
  },
)`
  font-size: 0.875rem;
  margin-bottom: 4px;

  &.invalid {
    color: red;
  }
`;
