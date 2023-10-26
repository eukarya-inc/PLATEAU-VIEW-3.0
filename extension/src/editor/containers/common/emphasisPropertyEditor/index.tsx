import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { styled } from "@mui/material";
import { useCallback } from "react";

import { EmphasisProperty } from "../../../../shared/api/types";
import { EditorButton } from "../../ui-components";
import { generateID } from "../../utils";

import { EmphasisPropertyHeader } from "./EmphasisPropertyHeader";
import { EmphasisPropertyItem } from "./EmphasisPropertyItem";

type EmphasisPropertyEditorProps = {
  properties: EmphasisProperty[];
  onPropertiesUpdate: (properties: EmphasisProperty[]) => void;
};

export const EmphasisPropertyEditor: React.FC<EmphasisPropertyEditorProps> = ({
  properties,
  onPropertiesUpdate,
}) => {
  const handlePropertyAdd = useCallback(() => {
    onPropertiesUpdate([
      ...properties,
      {
        id: generateID(),
        displayName: "",
        jsonPath: "",
        visible: true,
        condition: "",
      },
    ]);
  }, [properties, onPropertiesUpdate]);

  const handlePropertyUpdate = useCallback(
    (property: EmphasisProperty) => {
      onPropertiesUpdate?.(
        properties.map(p => {
          if (p.id === property.id) return property;
          return p;
        }),
      );
    },
    [properties, onPropertiesUpdate],
  );

  const handlePropertyRemove = useCallback(
    (propertyId: string) => {
      onPropertiesUpdate?.(properties.filter(p => p.id !== propertyId));
    },
    [properties, onPropertiesUpdate],
  );

  return (
    <EmphasisPropertyEditorWrapper>
      {properties?.length > 0 && <EmphasisPropertyHeader />}
      {properties.map(p => (
        <EmphasisPropertyItem
          key={p.id}
          propertyItem={p}
          onPropertyUpdate={handlePropertyUpdate}
          onPropertyRemove={handlePropertyRemove}
        />
      ))}
      <EditorButton variant="contained" fullWidth onClick={handlePropertyAdd}>
        <AddOutlinedIcon />
        Add Property
      </EditorButton>
    </EmphasisPropertyEditorWrapper>
  );
};

const EmphasisPropertyEditorWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));
