import { Checkbox, Row } from "@web/extensions/sharedComponents";
import CommonPage from "@web/extensions/sidebar/components/content/CommonPage";
import { ReearthApi } from "@web/extensions/sidebar/types";
import { styled } from "@web/theme";
import { memo } from "react";

import useHooks from "./hooks";

export type Props = {
  overrides: ReearthApi;
  onOverridesUpdate: (updatedProperties: Partial<ReearthApi>) => void;
};

const MapSettings: React.FC<Props> = ({ overrides, onOverridesUpdate }) => {
  const {
    mapViewData,
    baseMapData,
    currentView,
    currentTiles,
    currentHideUnderground,
    handleViewChange,
    handleTileChange,
    handleHideUnderGround,
  } = useHooks({ overrides, onOverridesUpdate });

  return (
    <CommonPage title="マップ設定">
      <>
        <SubTitle>マップビュー</SubTitle>
        <Section>
          <ViewWrapper>
            {mapViewData.map(({ key, title }) => (
              <MapViewButton
                key={key}
                value={key}
                selected={currentView === key}
                onClick={() => handleViewChange(key)}>
                <Text style={{ color: " #FFFFFF" }}>{title}</Text>
              </MapViewButton>
            ))}
          </ViewWrapper>
          <Checkbox checked={!!currentHideUnderground} onClick={handleHideUnderGround}>
            <Text>地下を隠す</Text>
          </Checkbox>
        </Section>
      </>
      <>
        <Title>ベースマップ</Title>
        <Section>
          <MapWrapper>
            {baseMapData.map(item => (
              <ImageButton
                key={item.key}
                selected={item.key === currentTiles?.[0].id}
                onClick={() => handleTileChange(item)}
                style={{
                  backgroundImage: "url(" + item.icon + ")",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ))}
          </MapWrapper>
        </Section>
      </>
    </CommonPage>
  );
};

export default memo(MapSettings);

const Title = styled.p`
  font-size: 16px;
`;

const SubTitle = styled.p`
  font-size: 14px;
`;

const Text = styled.p``;

const Section = styled(Row)`
  gap: 16px;
`;

const ViewWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
`;

const MapViewButton = styled.button<{ selected?: boolean }>`
  width: 91px;
  height: 29px;
  background: ${({ selected }) => (selected ? "#00bebe" : "#d1d1d1")};
  border-radius: 4px;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: #00bebe;
  }
`;

const MapWrapper = styled.div`
  display: flex;
  justify-content: start;
  gap: 8px;
  width: 100%;
`;

const ImageButton = styled.div<{ selected?: boolean }>`
  height: 64px;
  width: 64px;
  background: #d1d1d1;
  border: 2px solid ${({ selected }) => (selected ? "#00bebe" : "#d1d1d1")};
  border-radius: 2px;
  padding: 4px 8px;
  cursor: pointer;
`;
