import { useState, useCallback, useEffect } from "react";

import { BlockContentWrapper } from "../../../ui-components";
import { EditorButton } from "../../../ui-components/editor/EditorButton";
import { EditorCommonField, LineWrapper } from "../../../ui-components/editor/EditorCommonField";
import { EditorTextInput } from "../../../ui-components/editor/EditorTextField";

import { BasicBlock, BasicBlockProps } from "./BasicBlock";

type CameraBlockProps = BasicBlockProps & {};

export const CameraBlock: React.FC<CameraBlockProps> = ({ setting, updateSetting, ...props }) => {
  const [latitude, setLatitude] = useState<number | "">(setting?.general?.camera?.lat ?? "");
  const [longitude, setLongitude] = useState<number | "">(setting?.general?.camera?.lng ?? "");
  const [altitude, setAltitude] = useState<number | "">(setting?.general?.camera?.height ?? "");
  const [heading, setHeading] = useState<number | "">(setting?.general?.camera?.heading ?? "");
  const [pitch, setPitch] = useState<number | "">(setting?.general?.camera?.pitch ?? "");
  const [roll, setRoll] = useState<number | "">(setting?.general?.camera?.roll ?? "");

  useEffect(() => {
    updateSetting?.(s => {
      if (!s) return;
      return {
        ...s,
        general: {
          ...s?.general,
          camera:
            latitude === "" ||
            longitude === "" ||
            altitude === "" ||
            heading === "" ||
            pitch === "" ||
            roll === ""
              ? undefined
              : {
                  lat: latitude,
                  lng: longitude,
                  height: altitude,
                  heading: heading,
                  pitch: pitch,
                  roll: roll,
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
    <BasicBlock title="Camera" expandable {...props}>
      <BlockContentWrapper>
        <EditorCommonField label="Position">
          <LineWrapper>
            <EditorTextInput
              placeholder="Latitude"
              value={latitude}
              onChange={e => setLatitude(Number(e.target.value))}
            />
            <EditorTextInput
              placeholder="Longitude"
              value={longitude}
              onChange={e => setLongitude(Number(e.target.value))}
            />
            <EditorTextInput
              placeholder="Altitude"
              value={altitude}
              onChange={e => setAltitude(Number(e.target.value))}
            />
          </LineWrapper>
        </EditorCommonField>
        <EditorCommonField label="Rotation">
          <LineWrapper>
            <EditorTextInput
              placeholder="Heading"
              value={heading}
              onChange={e => setHeading(Number(e.target.value))}
            />
            <EditorTextInput
              placeholder="Pitch"
              value={pitch}
              onChange={e => setPitch(Number(e.target.value))}
            />
            <EditorTextInput
              placeholder="Roll"
              value={roll}
              onChange={e => setRoll(Number(e.target.value))}
            />
          </LineWrapper>
        </EditorCommonField>
        <LineWrapper>
          <EditorButton variant="outlined" onClick={handleClearCamera}>
            Clear
          </EditorButton>
          <EditorButton variant="contained" onClick={handleCapture}>
            Capture
          </EditorButton>
        </LineWrapper>
      </BlockContentWrapper>
    </BasicBlock>
  );
};
