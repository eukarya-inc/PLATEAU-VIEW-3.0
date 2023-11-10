// import { Button, Stack, styled, Typography } from "@mui/material";
import { atom, useAtomValue } from "jotai";
import { useCallback, useMemo, type FC, useState, SetStateAction } from "react";

import { isNotNullish } from "../../../prototypes/type-helpers";
import {
  GroupedParameterItem,
  InspectorItem,
  ParameterList,
  SelectParameterItem,
} from "../../../prototypes/ui-components";
import { Component } from "../../types/fieldComponents";
import { LayerModel } from "../../view-layers";
import { isConditionalImageSchemeComponent } from "../state/imageSchemaForComponent";

export interface ImageSchemeSectionForComponentFieldProps {
  layers: readonly LayerModel[];
}

// TODO: Handle as component
export const ImageSchemeSectionForComponentField: FC<ImageSchemeSectionForComponentFieldProps> = ({
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
                if (isConditionalImageSchemeComponent(componentValue)) {
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

  const imagePropertyAtoms = useMemo(
    () => [
      atom(
        get => {
          if (!layers[0].componentAtoms) return null;
          for (const componentAtom of layers[0].componentAtoms) {
            const componentValue = get(componentAtom.atom);
            if (isConditionalImageSchemeComponent(componentValue)) {
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

            if (isConditionalImageSchemeComponent(componentValue)) {
              const update =
                typeof action === "function"
                  ? action(componentValue.value?.currentRuleId ?? null)
                  : action;
              set(componentAtom.atom, {
                ...componentValue,
                value: {
                  ...(componentValue.value ?? {}),
                  currentRuleId: update,
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

  const handleClickParameterItem = useCallback(() => {
    setRecalcPropertyItems(p => p + 1);
  }, []);

  if (!layers.length || imagePropertyAtoms == null) {
    return null;
  }

  // TODO: Add Image legend
  return (
    <ParameterList>
      <GroupedParameterItem label="色分け" onClick={handleClickParameterItem}>
        <InspectorItem sx={{ width: 320 }}>
          <ParameterList>
            <SelectParameterItem
              label="モデル属性"
              atom={imagePropertyAtoms}
              items={propertyItems as [string, string][]}
              layout="stack"
              displayEmpty
            />
          </ParameterList>
        </InspectorItem>
      </GroupedParameterItem>
    </ParameterList>
  );
};
