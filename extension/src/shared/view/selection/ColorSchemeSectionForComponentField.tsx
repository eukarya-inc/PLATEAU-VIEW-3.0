import { Button, Stack, styled, Typography } from "@mui/material";
import { atom, useAtomValue, useSetAtom, type Getter } from "jotai";
import { useCallback, useMemo, type FC, useState, SetStateAction } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import {
  ColorMapParameterItem,
  GroupedParameterItem,
  InspectorItem,
  ParameterList,
  QualitativeColorLegend,
  SelectParameterItem,
  SliderParameterItem,
} from "../../../prototypes/ui-components";
import { colorSchemeSelectionAtom } from "../../../prototypes/view-layers";
import { PlateauTilesetProperty } from "../../plateau";
import { Component } from "../../types/fieldComponents";
import { LayerModel } from "../../view-layers";
import {
  isColorSchemeComponent,
  makeColorSchemeAtomForComponent,
  makeColorSchemeForComponent,
} from "../state/colorSchemeForComponent";

const StyledButton = styled(Button)(({ theme }) => ({
  ...theme.typography.body2,
  display: "block",
  width: `calc(100% + ${theme.spacing(2)})`,
  margin: 0,
  padding: `0 ${theme.spacing(1)}`,
  marginLeft: theme.spacing(-1),
  marginRight: theme.spacing(-1),
  textAlign: "left",
}));

const Legend: FC<{
  layers: readonly LayerModel[];
}> = ({ layers }) => {
  const colorSchemeAtom = useMemo(() => makeColorSchemeAtomForComponent(layers), [layers]);
  const colorScheme = useAtomValue(
    useMemo(() => makeColorSchemeForComponent(colorSchemeAtom), [colorSchemeAtom]),
  );

  const setSelection = useSetAtom(colorSchemeSelectionAtom);
  const handleClick = useCallback(() => {
    // Assume that every layer as the same color scheme.
    setSelection([layers[0].id]);
  }, [layers, setSelection]);

  if (colorScheme == null) {
    return null;
  }
  return (
    <StyledButton variant="text" onClick={handleClick}>
      <Stack spacing={1} width="100%" marginY={1}>
        <Typography variant="body2">{colorScheme.name}</Typography>
        {colorScheme.type === "quantitative" && (
          // <QuantitativeColorLegend
          //   colorMap={colorScheme.colorMap}
          //   min={colorScheme.colorRange[0]}
          //   max={colorScheme.colorRange[1]}
          // />
          <div>TODO</div>
        )}
        {colorScheme.type === "qualitative" && (
          <QualitativeColorLegend colors={colorScheme.colors} />
        )}
      </Stack>
    </StyledButton>
  );
};

// TODO: Support gradient
function getProperty(_get: Getter, _layers: readonly LayerModel[]): PlateauTilesetProperty | null {
  // const properties = uniqWith(
  //   layers.map(layer => {
  //     if (!("propertiesAtom" in layer) || !("colorPropertyAtom" in layer)) {
  //       return undefined;
  //     }
  //     const properties = get(layer.propertiesAtom);
  //     const colorProperty = get(layer.colorPropertyAtom);
  //     return colorProperty != null
  //       ? properties?.value?.find(({ name }) => name === colorProperty)
  //       : undefined;
  //   }),
  // );
  // const property = properties[0];
  // if (property == null || !properties.every(other => other?.type === property.type)) {
  //   return null;
  // }
  // switch (property.type) {
  //   case "number": {
  //     const minimum = min(
  //       properties.map(property => {
  //         invariant(property?.type === "number");
  //         return property.minimum;
  //       }),
  //     );
  //     const maximum = min(
  //       properties.map(property => {
  //         invariant(property?.type === "number");
  //         return property.maximum;
  //       }),
  //     );
  //     invariant(minimum != null);
  //     invariant(maximum != null);
  //     return {
  //       ...property,
  //       minimum,
  //       maximum,
  //     };
  //   }
  //   case "qualitative":
  //     return property;
  // }
  return null;
}

export interface ColorSchemeSectionForComponentFieldProps {
  layers: readonly LayerModel[];
}

// TODO: Handle as component
export const ColorSchemeSectionForComponentField: FC<ColorSchemeSectionForComponentFieldProps> = ({
  layers,
}) => {
  const [recalcPropertyItems, setRecalcPropertyItems] = useState(0);
  const propertyItems = useAtomValue(
    useMemo(
      () =>
        atom((get): Array<[null, string] | [string, string]> => {
          const rules =
            layers[0].componentAtoms
              ?.flatMap(c => {
                const componentValue = get(c.atom);
                if (isColorSchemeComponent(componentValue)) {
                  return componentValue.preset?.rules?.map(rule =>
                    rule.propertyName ? rule : undefined,
                  );
                }
              })
              .filter(isNotNullish) ?? [];
          return [
            [null, "なし"],
            ...rules.map((rule): [string, string] => [rule.id, rule.propertyName ?? ""]),
          ];
        }),
      [layers, recalcPropertyItems], // eslint-disable-line react-hooks/exhaustive-deps
    ),
  );

  const colorPropertyAtoms = useMemo(
    () => [
      atom(
        get => {
          if (!layers[0].componentAtoms) return null;
          for (const componentAtom of layers[0].componentAtoms) {
            const componentValue = get(componentAtom.atom);
            if (isColorSchemeComponent(componentValue)) {
              const ruleId = componentValue.preset?.rules?.find(
                rule => rule.id === componentValue.value?.currentRuleId,
              )?.id;
              if (ruleId) {
                return ruleId;
              }
            }
          }
          return null;
        },
        (get, set, action: SetStateAction<string | null>) => {
          layers[0].componentAtoms?.some(componentAtom => {
            const componentValue = get(componentAtom.atom);

            if (isColorSchemeComponent(componentValue)) {
              const update =
                typeof action === "function"
                  ? action(componentValue.value?.currentRuleId ?? null)
                  : action;
              const selectedRule = componentValue.preset?.rules?.find(rule => rule.id === update);
              set(componentAtom.atom, {
                ...componentValue,
                value: {
                  ...(componentValue.value ?? {}),
                  currentRuleId: selectedRule?.id,
                },
              } as Component);
              return true;
            }
          });
        },
      ),
    ],
    [layers],
  );

  // TODO: Support gradient
  const colorMapAtoms = useMemo(() => {
    // const atoms = layers.map(layer =>
    //   "colorMapAtom" in layer ? layer.colorMapAtom : undefined,
    // );
    // return atoms.every(<T,>(atom: T | undefined): atom is T => atom != null) ? atoms : undefined;
    return [];
  }, []);

  // TODO: Support gradient
  const colorRangeAtoms = useMemo(() => {
    // const atoms = buildingLayers.map(layer =>
    //   "colorRangeAtom" in layer ? layer.colorRangeAtom : undefined,
    // );
    // return atoms.every(<T,>(atom: T | undefined): atom is T => atom != null) ? atoms : undefined;
    return [];
  }, []);

  // TODO: Support gradient
  const property = useAtomValue(useMemo(() => atom(get => getProperty(get, layers)), [layers]));

  // TODO: Support gradient
  // Update color range when properties change.
  const resetColorRange = useSetAtom(
    useMemo(
      () =>
        atom(null, (get, set) => {
          if (colorRangeAtoms == null) {
            return;
          }
          const property = getProperty(get, layers);
          if (property?.type === "number") {
            colorRangeAtoms.forEach(colorRange => {
              set(colorRange, [property.minimum, property.maximum]);
            });
          }
        }),
      [layers, colorRangeAtoms],
    ),
  );

  const handleClickParameterItem = useCallback(() => {
    setRecalcPropertyItems(p => p + 1);
  }, []);

  if (
    !layers.length ||
    colorPropertyAtoms == null ||
    colorMapAtoms == null ||
    colorRangeAtoms == null
  ) {
    return null;
  }
  return (
    <ParameterList>
      <GroupedParameterItem
        label="色分け"
        onClick={handleClickParameterItem}
        content={<Legend layers={layers} />}>
        <InspectorItem sx={{ width: 320 }}>
          <ParameterList>
            <SelectParameterItem
              label="モデル属性"
              atom={colorPropertyAtoms}
              items={propertyItems as [string, string][]}
              layout="stack"
              displayEmpty
              onChange={resetColorRange}
            />
            {property?.type === "number" && (
              <>
                <ColorMapParameterItem label="配色" atom={colorMapAtoms} />
                <SliderParameterItem
                  label="値範囲"
                  min={property.minimum}
                  max={property.maximum}
                  range
                  atom={colorRangeAtoms}
                />
              </>
            )}
          </ParameterList>
        </InspectorItem>
      </GroupedParameterItem>
    </ParameterList>
  );
};
