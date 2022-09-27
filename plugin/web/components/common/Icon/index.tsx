import { styled } from "@web/theme";
import { memo } from "react";

import icons from "./icons";

type Props = {
  icon: string;
  size?: string | number;
};

type Icons = keyof typeof icons;

const Icon: React.FC<Props> = ({ icon, size = 24 }) => {
  const sizeStr = typeof size === "number" ? `${size}px` : size;
  const IconComponent = icons[icon as Icons];

  return (
    <Wrapper size={sizeStr}>
      <IconComponent />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ size: string }>`
  font-size: 0;
  display: inline-block;
  width: ${({ size }: any) => size};
  height: ${({ size }: any) => size};

  svg {
    width: 100%;
    height: 100%;
  }
`;

export default memo(Icon);
