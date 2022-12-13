import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import "leaflet/dist/leaflet.css";
import { ComponentType, useCallback } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
// import L from "leaflet";
// import { MapContainer, TileLayer, Marker } from "react-leaflet";

import { Data } from "../../types";

// import iconSvg from "./icon.svg?raw";

export type Props = {
  dataset: Data;
  addDisabled: boolean;
  contentSection?: ComponentType;
  onDatasetAdd: (dataset: Data) => void;
};

const initialLocation = { lat: 35.70249, lng: 139.7622 };

const DatasetDetails: React.FC<Props> = ({
  dataset,
  addDisabled,
  contentSection: ContentSection,
  onDatasetAdd,
}) => {
  // const markerRef = useRef<L.Marker<any>>(null);

  // const handleChange = useCallback(
  //   ({ lat, lng }: { lat: number; lng: number }) => {
  //     if (isBuilt || !isEditable) return;
  //     onChange?.("default", "location", { lat, lng }, "latlng");
  //   },
  //   [isBuilt, isEditable, onChange],
  // );

  // const eventHandlers = useMemo(
  //   () => ({
  //     dragend() {
  //       const marker = markerRef.current;
  //       if (marker) {
  //         handleChange(marker.getLatLng());
  //       }
  //     },
  //   }),
  //   [handleChange],
  // );

  const handleDatasetAdd = useCallback(() => {
    if (!dataset) return;
    onDatasetAdd(dataset);
  }, [dataset, onDatasetAdd]);

  return (
    <Wrapper>
      <MapContainer
        style={{ height: "164px" }}
        center={initialLocation}
        zoom={8}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        attributionControl={false}>
        <TileLayer url="https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg" />
        {/* {location && (
            <Marker
              icon={icon}
              position={initialLocation}
              draggable={false}
              // eventHandlers={eventHandlers}
              ref={markerRef}
            />
          )} */}
      </MapContainer>
      <ButtonWrapper>
        <Button>
          <Icon icon="share" />
          シェア
        </Button>
        <Button disabled={addDisabled} onClick={handleDatasetAdd}>
          {!addDisabled && <Icon icon="plusCircle" />}
          {addDisabled ? "シーンに追加済み" : "シーンに追加"}
        </Button>
      </ButtonWrapper>
      <Title>{dataset.name}</Title>
      {ContentSection && <ContentSection />}
    </Wrapper>
  );
};

export default DatasetDetails;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 0 16px 0;
`;

const Button = styled.button<{ disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex: 1;
  height: 40px;
  color: ${({ disabled }) => (disabled ? "grey" : "#00bebe")};
  font-weight: 500;
  background: ${({ disabled }) => (disabled ? "#dcdcdc" : "#ffffff")};
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  ${({ disabled }) => !disabled && "cursor: pointer;"}
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
`;

// const icon = L.divIcon({
//   className: "custom-icon",
//   html: iconSvg,
// });
