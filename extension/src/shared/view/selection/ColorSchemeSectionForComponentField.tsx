import { Button, Stack, styled, Typography } from "@mui/material";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, type FC, useState, SetStateAction } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import {
  ColorMapParameterItem,
  GroupedParameterItem,
  InspectorItem,
  ParameterList,
  QualitativeColorLegend,
  QuantitativeColorLegend,
  SelectParameterItem,
  SliderParameterItem,
} from "../../../prototypes/ui-components";
import { colorSchemeSelectionAtom } from "../../../prototypes/view-layers";
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
  colorSchemeAtom: ReturnType<typeof makeColorSchemeForComponent>;
}> = ({ layers, colorSchemeAtom }) => {
  const colorScheme = useAtomValue(colorSchemeAtom);
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
          <QuantitativeColorLegend
            colorMap={colorScheme.colorMap}
            min={colorScheme.colorRange[0]}
            max={colorScheme.colorRange[1]}
          />
        )}
        {colorScheme.type === "qualitative" && (
          <QualitativeColorLegend colors={colorScheme.colors} />
        )}
      </Stack>
    </StyledButton>
  );
};

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
              const ruleId = componentValue.value?.currentRuleId;
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
              set(componentAtom.atom, {
                ...componentValue,
                value: {
                  ...(componentValue.value ?? {}),
                  currentRuleId: update,
                  currentColorMapName: undefined,
                  currentMin: undefined,
                  currentMax: undefined,
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

  const colorSchemeAtom = useMemo(() => makeColorSchemeAtomForComponent(layers), [layers]);
  const colorScheme = useAtomValue(colorSchemeAtom);
  const colorSchemeValueAtom = useMemo(
    () => makeColorSchemeForComponent(colorSchemeAtom),
    [colorSchemeAtom],
  );

  const colorMapAtoms = useMemo(() => {
    return colorScheme?.type && colorScheme.type === "quantitative"
      ? [colorScheme.colorMapAtom]
      : undefined;
  }, [colorScheme]);

  const colorRangeAtoms = useMemo(() => {
    return colorScheme?.type && colorScheme.type === "quantitative"
      ? [colorScheme.colorRangeAtom]
      : undefined;
  }, [colorScheme]);

  const valueRangeAtom = useMemo(() => {
    return colorScheme?.type && colorScheme.type === "quantitative"
      ? colorScheme.valueRangeAtom
      : undefined;
  }, [colorScheme]);
  const valueRange = useAtomValue(useMemo(() => valueRangeAtom ?? atom([0, 0]), [valueRangeAtom]));

  const handleClickParameterItem = useCallback(() => {
    setRecalcPropertyItems(p => p + 1);
  }, []);

  if (!layers.length || colorPropertyAtoms == null) {
    return null;
  }
  return (
    <ParameterList>
      <GroupedParameterItem
        label="色分け"
        onClick={handleClickParameterItem}
        content={<Legend layers={layers} colorSchemeAtom={colorSchemeValueAtom} />}>
        <InspectorItem sx={{ width: 320 }}>
          <ParameterList>
            <SelectParameterItem
              label="モデル属性"
              atom={colorPropertyAtoms}
              items={propertyItems as [string, string][]}
              layout="stack"
              displayEmpty
            />
            {colorScheme?.type === "quantitative" &&
              colorMapAtoms &&
              colorRangeAtoms &&
              valueRange && (
                <>
                  <ColorMapParameterItem label="配色" atom={colorMapAtoms} />
                  <SliderParameterItem
                    label="値範囲"
                    min={valueRange[0]}
                    max={valueRange[1]}
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