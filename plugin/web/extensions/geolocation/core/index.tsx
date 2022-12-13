import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";

import useHooks from "./hooks";

const GeolocationWrapper: React.FC = () => {
  const { handleFlyToCurrentLocation } = useHooks();

  return (
    <Wrapper>
      <Icon icon="bullseye" size={20} color="#262626" onClick={handleFlyToCurrentLocation} />
    </Wrapper>
  );
};

export default GeolocationWrapper;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  width: 44px;
  height: 44px;
  background: #ececec;
  border-radius: 4px;
`;
