import { QualitativeColorSet, floodRankColorSet } from "../../../prototypes/datasets";
import { isNotNullish } from "../../../prototypes/type-helpers";
import { Properties } from "../../reearth/utils";
import {
  usageColorSet,
  structureTypeColorSet,
  fireproofStructureTypeColorSet,
  steepSlopeRiskColorSet,
  mudflowRiskColorSet,
  landSlideRiskColorSet,
} from "../colorSets";

type AvailableFeatures = ("color" | "filter")[];

interface QualitativeProperty {
  testProperty: (name: string, value: unknown) => boolean;
  colorSet: QualitativeColorSet;
  getDisplayName?: (name: string) => string;
  availableFeatures: AvailableFeatures;
}

const qualitativeProperties: QualitativeProperty[] = [
  {
    testProperty: propertyName =>
      // For building layers
      propertyName.endsWith("浸水ランクコード") ||
      // For river flooding risk layers
      propertyName === "rank_code" ||
      propertyName === "rank_org_code" ||
      propertyName === "uro:rank_code" ||
      propertyName === "uro:rank_org_code",
    colorSet: floodRankColorSet,
    getDisplayName: name =>
      name.endsWith("浸水ランクコード") ? name.replaceAll("_", " ") : "浸水ランク",
    availableFeatures: ["color", "filter"],
  },
  {
    testProperty: propertyName => propertyName === "用途",
    colorSet: usageColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "構造種別",
    colorSet: structureTypeColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "耐火構造種別",
    colorSet: fireproofStructureTypeColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "土砂災害リスク_急傾斜地の崩落_区域区分コード",
    colorSet: steepSlopeRiskColorSet,
    getDisplayName: () => "急傾斜地の崩落",
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "土砂災害リスク_土石流_区域区分コード",
    colorSet: mudflowRiskColorSet,
    getDisplayName: () => "土石流",
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName => propertyName === "土砂災害リスク_地すべり_区域区分コード",
    colorSet: landSlideRiskColorSet,
    getDisplayName: () => "地すべり",
    availableFeatures: ["color"],
  },
];

interface NumberProperty {
  testProperty: (name: string, value: unknown) => boolean;
  getDisplayName?: (name: string) => string;
  getMinMax?: (min: number, max: number) => [min: number, max: number];
  availableFeatures: AvailableFeatures;
}

const numberProperties: NumberProperty[] = [
  {
    testProperty: propertyName => propertyName === "計測高さ",
    availableFeatures: ["color", "filter"],
  },
  {
    testProperty: propertyName => propertyName === "建築年",
    availableFeatures: ["filter"],
    getMinMax: (min, max) => [Math.max(min, 1850), Math.min(max, new Date().getFullYear())],
  },
  {
    testProperty: propertyName => propertyName === "地上階数",
    availableFeatures: ["filter"],
  },
  {
    testProperty: propertyName => propertyName === "地下階数",
    availableFeatures: ["filter"],
  },
];

export type PlateauTilesetProperty = {
  name: string;
  availableFeatures: AvailableFeatures;
  displayName: string;
} & (
  | { type: "unknown" }
  | {
      type: "number";
      minimum: number;
      maximum: number;
    }
  | {
      type: "qualitative";
      colorSet: QualitativeColorSet;
      minimum?: number;
      maximum?: number;
    }
);

export class PlateauTilesetProperties extends Properties {
  private _cachedComputedProperties: any;
  get value(): PlateauTilesetProperty[] | undefined {
    if (this._cachedComputedProperties) {
      return this._cachedComputedProperties;
    }
    const properties = super.value;
    if (!properties) return;

    this._cachedComputedProperties = Object.entries(properties)
      .map(([name, value]) => {
        if (name.startsWith("_") || value == null || typeof value !== "object") {
          return undefined;
        }

        const minimum =
          "minimum" in value && typeof value.minimum === "number" ? value.minimum : undefined;
        const maximum =
          "maximum" in value && typeof value.maximum === "number" ? value.maximum : undefined;

        // TODO: Support qualitative properties of non-number type if there
        // are any.
        const qualitativeProperty = qualitativeProperties?.find(({ testProperty }) =>
          testProperty(name, value),
        );
        if (qualitativeProperty != null) {
          return {
            name,
            type: "qualitative" as const,
            colorSet: qualitativeProperty.colorSet,
            minimum,
            maximum,
            displayName: qualitativeProperty.getDisplayName?.(name) ?? name,
            availableFeatures: qualitativeProperty.availableFeatures,
          };
        }

        if (minimum && maximum) {
          const numberProperty = numberProperties?.find(({ testProperty }) =>
            testProperty(name, value),
          );
          const [finalMinimum, finalMaximum] = numberProperty?.getMinMax?.(minimum, maximum) ?? [
            minimum,
            maximum,
          ];
          if (numberProperty != null) {
            return {
              name,
              type: "number" as const,
              minimum: finalMinimum,
              maximum: finalMaximum,
              displayName: numberProperty.getDisplayName?.(name) ?? name,
              availableFeatures: numberProperty.availableFeatures,
            };
          }
        }
        return {
          name,
          type: "unknown" as const,
        };
      })
      .filter(isNotNullish);
    return this._cachedComputedProperties;
  }
}
