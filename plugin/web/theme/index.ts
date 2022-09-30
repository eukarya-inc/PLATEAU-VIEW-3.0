import styledComponents, { StyledInterface } from "styled-components";

export const styled = import.meta.env.DEV ? styledComponents : (window.styled as StyledInterface);
