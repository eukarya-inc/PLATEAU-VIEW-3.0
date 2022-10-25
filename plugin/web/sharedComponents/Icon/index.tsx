import { styled } from "@web/theme";
import { memo } from "react";

import icons from "./icons";

type Props = {
  className?: string;
  icon: string;
  size?: string | number;
  color?: string;
  wide?: boolean;
  onClick?: () => void;
};

type Icons = keyof typeof icons;

const Icon: React.FC<Props> = ({ className, icon, size = 24, color, wide, onClick }) => {
  const sizeStr = typeof size === "number" ? `${size}px` : size;
  const IconComponent = icons[icon as Icons];

  return (
    <Wrapper className={className} size={sizeStr} color={color} wide={wide} onClick={onClick}>
      <IconComponent />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ size: string; color?: string; wide?: boolean }>`
  display: flex;
  justify-content: center;
  align-content: center;

  svg {
    width: ${({ size }) => size};
    ${({ wide, size }) => !wide && `height: ${size};`}
    color: ${({ color }) => color};
  }
`;

export default memo(Icon);
