import { styled } from "@mui/material";

import {
  IconWrapper,
  PropertyItemWrapper,
  VisibleWrapper,
  NameWrapper,
  PathWrapper,
  ConditionWrapper,
} from "./EmphasisPropertyItem";

export const EmphasisPropertyHeader: React.FC = () => {
  return (
    <StyledPropertyItemWrapper>
      <IconWrapper />
      <VisibleWrapper />
      <NameWrapper>Display Name</NameWrapper>
      <PathWrapper>JSON Path</PathWrapper>
      <ConditionWrapper>Condition</ConditionWrapper>
      <IconWrapper />
    </StyledPropertyItemWrapper>
  );
};

const StyledPropertyItemWrapper = styled(PropertyItemWrapper)(() => ({
  fontSize: "11px",
}));
