import { useState, useCallback, useEffect } from "react";

import { DraftSetting, UpdateSetting } from "..";
import { EditorBlock, EditorBlockProps, BlockContentWrapper } from "../../../../../ui-components";
import { EditorButton } from "../../../../../ui-components/editor/EditorButton";
import {
  EditorCommonField,
  LineWrapper,
} from "../../../../../ui-components/editor/EditorCommonField";
import { EditorTextInput } from "../../../../../ui-components/editor/EditorTextField";

type CameraBlockProps = EditorBlockProps & {
  setting?: DraftSetting;
  updateSetting?: UpdateSetting;
};

export const CameraBlock: React.FC<CameraBlockProps> = ({ setting, updateSetting, ...props }) => {
  const [latitude, setLatitude] = useState<number | string>(setting?.general?.camera?.lat ?? "");
  const [longitude, setLongitude] = useState<number | string>(setting?.general?.camera?.lng ?? "");
  const [altitude, setAltitude] = useState<number | string>(setting?.general?.camera?.height ?? "");
  const [heading, setHeading] = useState<number | string>(setting?.general?.camera?.heading ?? "");
  const [pitch, setPitch] = useState<number | string>(setting?.general?.camera?.pitch ?? "");
  const [roll, setRoll] = useState<number | string>(setting?.general?.camera?.roll ?? "");

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return s;
      const isUndefinedCamera =
        latitude === "" &&
        longitude === "" &&
        altitude === "" &&
        heading === "" &&
        pitch === "" &&
        roll === "";

      const numberLatitude = latitude === "" ? NaN : Number(latitude);
      const numberLongitude = longitude === "" ? NaN : Number(longitude);
      const numberAltitude = altitude === "" ? NaN : Number(altitude);
      const numberHeading = heading === "" ? NaN : Number(heading);
      const numberPitch = pitch === "" ? NaN : Number(pitch);
      const numberRoll = roll === "" ? NaN : Number(roll);

      return {
        ...s,
        general: {
          ...s?.general,
          camera:
            isUndefinedCamera ||
            isNaN(numberLatitude) ||
            isNaN(numberLongitude) ||
            isNaN(numberAltitude) ||
            isNaN(numberHeading) ||
            isNaN(numberPitch) ||
            isNaN(numberRoll)
              ? undefined
              : {
                  lat: numberLatitude,
                  lng: numberLongitude,
                  height: numberAltitude,
                  heading: numberHeading,
                  pitch: numberPitch,
                  roll: numberRoll,
                  fov: window.reearth?.camera?.position?.fov ?? 1.04,
                },
        },
      };
    });
  }, [latitude, longitude, altitude, heading, pitch, roll, updateSetting]);

  const handleClearCamera = useCallback(() => {
    setLatitude("");
    setLongitude("");
    setAltitude("");
    setHeading("");
    setPitch("");
    setRoll("");
  }, []);

  const handleCapture = useCallback(() => {
    const cameraPosition = window.reearth?.camera?.position;
    if (!cameraPosition) return;
    setLatitude(cameraPosition.lat ?? "");
    setLongitude(cameraPosition.lng ?? "");
    setAltitude(cameraPosition.height ?? "");
    setHeading(cameraPosition.heading ?? "");
    setPitch(cameraPosition.pitch ?? "");
    setRoll(cameraPosition.roll ?? "");
  }, []);

  return (
    <EditorBlock title="Camera" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Position">
          <LineWrapper>
            <EditorTextInput
              placeholder="Latitude"
              type="number"
              value={latitude}
              onChange={e => setLatitude(e.target.value)}
            />
            <EditorTextInput
              placeholder="Longitude"
              type="number"
              value={longitude}
              onChange={e => setLongitude(e.target.value)}
            />
            <EditorTextInput
              placeholder="Altitude"
              type="number"
              value={altitude}
              onChange={e => setAltitude(e.target.value)}
            />
          </LineWrapper>
        </EditorCommonField>
        <EditorCommonField label="Rotation">
          <LineWrapper>
            <EditorTextInput
              placeholder="Heading"
              type="number"
              value={heading}
              onChange={e => setHeading(e.target.value)}
            />
            <EditorTextInput
              placeholder="Pitch"
              type="number"
              value={pitch}
              onChange={e => setPitch(e.target.value)}
            />
            <EditorTextInput
              placeholder="Roll"
              type="number"
              value={roll}
              onChange={e => setRoll(e.target.value)}
            />
          </LineWrapper>
        </EditorCommonField>
        <LineWrapper>
          <EditorButton variant="outlined" fullWidth onClick={handleClearCamera}>
            Clear
          </EditorButton>
          <EditorButton variant="contained" fullWidth onClick={handleCapture}>
            Capture
          </EditorButton>
        </LineWrapper>
      </BlockContentWrapper>
    </EditorBlock>
  );
};
