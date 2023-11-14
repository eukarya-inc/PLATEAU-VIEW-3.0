import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { styled } from "@mui/material";
import { useAtom, useAtomValue, useSetAtom, type PrimitiveAtom, atom } from "jotai";
import {
  forwardRef,
  useCallback,
  type ComponentPropsWithRef,
  type ComponentType,
  type MouseEvent,
  useMemo,
} from "react";
import { mergeRefs } from "react-merge-refs";

import { makeColorSchemeAtomForComponent } from "../../shared/view/state/colorSchemeForComponent";
import { makeImageSchemeAtomForComponent } from "../../shared/view/state/imageSchemaForComponent";

import { addLayerSelectionAtom, layerSelectionAtom } from "./states";
import { type LayerModel, type LayerProps } from "./types";

const Root = styled("div")({});

export interface LayerListItemProps extends ComponentPropsWithRef<typeof Root> {
  index: number;
  layerAtom: PrimitiveAtom<LayerModel>;
  itemComponent: ComponentType<LayerProps>;
}

export const LayerListItem = forwardRef<HTMLDivElement, LayerListItemProps>(
  ({ index, layerAtom, itemComponent, ...props }, forwardedRef) => {
    const layer = useAtomValue(layerAtom);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: layer.id,
    });

    const [selection, setSelection] = useAtom(layerSelectionAtom);
    const addSelection = useSetAtom(addLayerSelectionAtom);
    const handleMouseDown = useCallback(
      (event: MouseEvent) => {
        event.stopPropagation();
        if (event.shiftKey) {
          // TODO: Toggle selection
          addSelection([layer.id]);
        } else {
          setSelection([layer.id]);
        }
      },
      [layer.id, setSelection, addSelection],
    );

    const colorSchemeAtom = useMemo(() => {
      const generalColorScheme = makeColorSchemeAtomForComponent([layer]);
      return atom(get => get(layer.colorSchemeAtom) || get(generalColorScheme) || null);
    }, [layer]);

    const imageSchemeAtom = useMemo(() => {
      const generalImageScheme = makeImageSchemeAtomForComponent([layer]);
      return atom(get => get(layer.imageSchemeAtom) || get(generalImageScheme) || null);
    }, [layer]);

    const ItemComponent = itemComponent;
    return (
      <Root
        ref={mergeRefs([forwardedRef, setNodeRef])}
        {...props}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
        }}
        {...attributes}
        {...listeners}>
        <ItemComponent
          {...layer}
          colorSchemeAtom={colorSchemeAtom}
          imageSchemeAtom={imageSchemeAtom}
          index={index}
          selected={selection.includes(layer.id)}
          itemProps={{
            onMouseDown: handleMouseDown,
          }}
        />
      </Root>
    );
  },
);
