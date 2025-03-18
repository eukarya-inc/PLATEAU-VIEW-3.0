import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { FC, useEffect, useMemo } from "react";

import { StoryBlock } from "../../../types";

import Content from "./Content";
import { type LinkBlock as LinkBlockType } from "./Editor";

export type Props = BlockProps<StoryBlock>;

const LinkBlock: FC<Props> = ({
  block,
  isSelected,
  onPropertyItemAdd,
  ...props
}) => {
  const linkButtons = useMemo(
    () => (block?.property?.default ?? []) as LinkBlockType[],
    [block?.property?.default]
  );

  // if there's no item add 1 button.
  // TODO: Should be added to block creationAPI for generic blocks that require at least 1 item
  useEffect(() => {
    if (!block?.property?.default || block?.property?.default.length === 0) {
      onPropertyItemAdd?.(block?.propertyId, "default");
    }
  }, [block?.propertyId, block?.property?.default, onPropertyItemAdd]);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      settingsEnabled={false}
      onPropertyItemAdd={onPropertyItemAdd}
      {...props}
    >
      <Content
        linkButtons={linkButtons}
        propertyId={block?.propertyId}
        isEditable={props.isEditable}
        onPropertyUpdate={props.onPropertyUpdate}
        onPropertyItemAdd={onPropertyItemAdd}
        onPropertyItemMove={props.onPropertyItemMove}
        onPropertyItemDelete={props.onPropertyItemDelete}
      />
    </BlockWrapper>
  );
};

export default LinkBlock;
