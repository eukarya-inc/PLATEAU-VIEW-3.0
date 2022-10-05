import { Divider } from "@web/extensions/sharedComponents";
import { styled } from "@web/theme";
import { Children, Fragment, ReactNode } from "react";

export type Props = {
  title?: string;
  children?: ReactNode;
};

const CommonPageWrapper: React.FC<Props> = ({ title, children }) => {
  const childArray = Children.toArray(children);

  return (
    <Wrapper>
      {title && (
        <>
          <Title>{title}</Title>
          <Divider />
        </>
      )}
      {childArray.map((child, idx) => (
        <Fragment key={idx}>
          {child}
          {idx + 1 !== childArray.length && <Divider />}
        </Fragment>
      ))}
    </Wrapper>
  );
};

export default CommonPageWrapper;

const Wrapper = styled.div`
  padding: 32px 16px;
`;

const Title = styled.p`
  font-size: 16px;
`;
