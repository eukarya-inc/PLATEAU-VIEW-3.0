import { styled } from "@web/theme";

import useHooks from "./hook";

const LocationWrapper: React.FC = () => {
  const { currentPoint, currentDistance, handlegoogleModalChange, handleTerrainModalChange } =
    useHooks();

  return (
    <ContentWrapper>
      <LocationsWrapper>
        <Text>Lat{currentPoint?.lat}° N</Text>
        <Text>Lon{currentPoint?.lng}° E</Text>
        <Text>{currentDistance}</Text>
      </LocationsWrapper>
      <ModalsWrapper>
        <GoogleAnalyticsLink onClick={handlegoogleModalChange}>
          Google Analyticsの利用について
        </GoogleAnalyticsLink>
        <TerrainLink onClick={handleTerrainModalChange}>地形データ</TerrainLink>
      </ModalsWrapper>
    </ContentWrapper>
  );
};

export default LocationWrapper;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  width: 1680px;
  height: 40px;
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
`;

const Text = styled.p`
  font-size: 10px;
  margin: 0;
  color: #262626;
`;

const LocationsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 326px;
  height: 14px;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
`;

const ModalsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px;
  gap: 12px;
  width: 212px;
  height: 14px;
  flex: none;
  order: 1;
  flex-grow: 0;
`;

const GoogleAnalyticsLink = styled.a`
  font-size: 10px;
  color: #434343;
  text-decoration-line: underline;
`;

const TerrainLink = styled.a`
  font-size: 10px;
  color: #434343;
  text-decoration-line: underline;
`;
