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
import { getAttributeLabel } from "../featureInspector";

export type AvailableFeatures = ("color" | "buildingFilter" | "floodFilter")[];

interface QualitativeProperty {
  testProperty: (name: string, value: unknown) => boolean;
  colorSet?: QualitativeColorSet;
  getDisplayName?: (name: string) => string;
  getMinMax?: (min: number, max: number) => [min: number, max: number];
  accessor?: (propertyName: string) => string;
  availableFeatures?: AvailableFeatures;
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
    availableFeatures: ["color", "floodFilter"],
  },
  {
    testProperty: propertyName => propertyName === "用途" || propertyName === "bldg:usage",
    colorSet: usageColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName =>
      propertyName === "構造種別" ||
      propertyName === "uro:BuildingDetailAttribute_uro:buildingStructureType",
    colorSet: structureTypeColorSet,
    availableFeatures: ["color"],
  },
  {
    testProperty: propertyName =>
      propertyName === "耐火構造種別" ||
      propertyName === "uro:BuildingDetailAttribute_uro:fireproofStructureType",
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
  {
    testProperty: propertyName =>
      propertyName === "建築年" || propertyName === "bldg:yearOfConstruction",
    availableFeatures: ["buildingFilter"],
    getMinMax: (min, max) => [Math.max(min, 1850), Math.min(max, new Date().getFullYear())],
  },
  {
    testProperty: propertyName => propertyName === "_lod",
    getDisplayName: () => "LOD",
    availableFeatures: ["buildingFilter"],
  },
];

interface NumberProperty {
  testProperty: (name: string, value: unknown) => boolean;
  getDisplayName?: (name: string) => string;
  getMinMax?: (min: number, max: number) => [min: number, max: number];
  accessor?: (propertyName: string) => string;
  availableFeatures?: AvailableFeatures;
}

const numberProperties: NumberProperty[] = [
  {
    testProperty: propertyName =>
      propertyName === "計測高さ" || propertyName === "bldg:measuredHeight",
    availableFeatures: ["color", "buildingFilter"],
  },
  {
    testProperty: propertyName =>
      propertyName === "地上階数" || propertyName === "bldg:storeysAboveGround",
    availableFeatures: ["buildingFilter"],
  },
  {
    testProperty: propertyName =>
      propertyName === "地下階数" || propertyName === "bldg:storeysBelowGround",
    availableFeatures: ["buildingFilter"],
  },
];

export type PlateauTilesetProperty = {
  name: string;
  availableFeatures: AvailableFeatures;
  displayName: string;
  accessor: string;
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

const defaultAccessor = (propertyName: string) => `rootProperties["${propertyName}"]`;

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
        if (value == null || typeof value !== "object") {
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
          const [finalMinimum, finalMaximum] =
            minimum && maximum
              ? qualitativeProperty?.getMinMax?.(minimum, maximum) ?? [minimum, maximum]
              : [];
          return {
            name,
            type: "qualitative" as const,
            colorSet: qualitativeProperty.colorSet,
            minimum: finalMinimum,
            maximum: finalMaximum,
            displayName:
              qualitativeProperty.getDisplayName?.(name) ?? getAttributeLabel(name) ?? name,
            availableFeatures: qualitativeProperty.availableFeatures,
            accessor: qualitativeProperty.accessor?.(name) ?? defaultAccessor(name),
          };
        }

        if (minimum != null && maximum != null) {
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
              displayName: numberProperty.getDisplayName?.(name) ?? getAttributeLabel(name) ?? name,
              availableFeatures: numberProperty.availableFeatures,
              accessor: numberProperty.accessor?.(name) ?? defaultAccessor(name),
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
