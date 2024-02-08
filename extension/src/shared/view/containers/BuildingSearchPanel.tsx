import {
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Popover,
  Tab,
  Tabs,
  styled,
  tabClasses,
} from "@mui/material";
import { PrimitiveAtom, useAtom } from "jotai";
import { get, uniq, uniqBy } from "lodash-es";
import { PopupState, bindPopover } from "material-ui-popup-state/hooks";
import {
  FC,
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { InspectorHeader, Space } from "../../../prototypes/ui-components";
import { BUILDING_LAYER } from "../../../prototypes/view-layers";
import { useOptionalAtomValue, useOptionalPrimitiveAtom } from "../../hooks";
import { PlateauTilesetProperties, TileFeatureIndex, makePropertyName } from "../../plateau";
import { lookAtTileFeature } from "../../reearth/utils";
import {
  MultipleSelectSearch,
  Props as MultipleSelectSearchProps,
} from "../../ui-components/MultipleSelectSearch";
import { LayerModel, SearchedFeatures } from "../../view-layers";

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: theme.spacing(5),
  backgroundColor: theme.palette.background.default,
  width: "100%",
  [`& .${tabClasses.root}`]: {
    minHeight: theme.spacing(5),
    width: "50%",
  },
}));

const Content = styled("div")(({ theme }) => ({
  width: 320,
  [theme.breakpoints.down("mobile")]: {
    width: `calc(100vw - ${theme.spacing(4)})`,
  },
}));

const SearchContent = styled("div")(({ theme }) => ({
  padding: theme.spacing(1, 1, 2, 1),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const SearchButton = styled(Button)(() => ({
  color: "#ffffff",
  fontSize: 12,
  width: 120,
  height: 32,
}));

const SearchConditionList = styled(List)(() => ({
  width: "100%",
  listStyle: "none",
  padding: 0,
}));

const SearchConditionListItem = styled(ListItem)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
}));

const ResultLabel = styled("div")(({ theme }) => ({
  ...theme.typography.body2,
  margin: "14px 16px",
  listStyle: "none",
  padding: 0,
}));

const ResultList = styled(List)(() => ({
  width: "100%",
  maxHeight: 360,
  overflowY: "auto",
}));

const ResultListItem = styled(ListItemButton)(({ theme }) => ({
  ...theme.typography.body2,
  width: "100%",
  maxHeight: 360,
}));

const ResultButtonList = styled("ul")(() => ({
  display: "flex",
  gap: 8,
  justifyContent: "center",
  listStyle: "none",
  padding: 0,
}));

const ResultButton = styled(Button)(() => ({
  color: "#232323",
  width: 120,
  height: 32,
  fontSize: 12,
  "&.MuiButton-containedPrimary": {
    color: "#ffffff",
  },
}));

type Props = {
  state: PopupState;
  layer: LayerModel;
  layerId: string | null;
};

const INCLUDE_PROPERTY_NAMES = [
  "住所",
  "bldg:address",
  "名称",
  "gml:name",
  "構造種別",
  "uro:BuildingDetailAttribute_uro:buildingStructureType",
  "用途",
  "bldg:usage",
  "耐火構造種別",
  "uro:BuildingDetailAttribute_uro:fireproofStructureType",
];

export const BuildingSearchPanel: FC<Props> = ({ state, layer, layerId }) => {
  const [tab, setTab] = useState(0);
  const deferredTab = useDeferredValue(tab);
  const handleTabChange = useCallback((_event: unknown, value: number) => {
    setTab(value);
  }, []);

  const initialized = useRef(false);
  if (state.isOpen && !initialized.current) {
    initialized.current = true;
  }

  const properties = useOptionalAtomValue(
    useMemo(() => {
      if (layer.type !== BUILDING_LAYER || !("propertiesAtom" in layer) || !initialized.current)
        return;
      return layer.propertiesAtom as PrimitiveAtom<PlateauTilesetProperties | null>;
    }, [layer, initialized.current]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  const featureIndex = useOptionalAtomValue(
    useMemo(
      () =>
        ("featureIndexAtom" in layer ? layer.featureIndexAtom : undefined) as
          | PrimitiveAtom<TileFeatureIndex | null>
          | undefined,
      [layer],
    ),
  );
  const [searchedFeatures, setSearchedFeatures] = useAtom(
    useOptionalPrimitiveAtom(
      useMemo(
        () =>
          ("searchedFeaturesAtom" in layer ? layer.searchedFeaturesAtom : undefined) as
            | PrimitiveAtom<SearchedFeatures | null>
            | undefined,
        [layer],
      ),
    ),
  );
  const defferedSearchedFeatures = useDeferredValue(searchedFeatures);

  const allFeatures = useMemo(
    () =>
      initialized.current
        ? window.reearth?.layers?.findFeaturesByIds?.(layerId ?? "", featureIndex?.featureIds ?? [])
        : undefined,
    [layerId, featureIndex, initialized.current], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [groups, setGroups] = useState<
    {
      key: string;
      title: string;
      options: { label: string; value: string }[];
    }[]
  >([]);

  const prevAllFeaturesLengthRef = useRef(0);
  useLayoutEffect(() => {
    if (
      !allFeatures ||
      prevAllFeaturesLengthRef.current === allFeatures.length ||
      !initialized.current ||
      tab !== 0
    )
      return;

    prevAllFeaturesLengthRef.current = allFeatures.length;

    setGroups(
      INCLUDE_PROPERTY_NAMES.map(value => {
        return {
          key: value,
          title: makePropertyName(value) ?? value,
          options: uniqBy(
            allFeatures.reduce((res, f) => {
              const propertyValue = get(f.properties, value);
              if (!propertyValue) return res;
              res.push({ label: propertyValue, value: propertyValue });
              return res;
            }, [] as { label: string; value: string }[]),
            "label",
          ),
        };
      }).filter(v => !!v.options.length) ?? [],
    );
  }, [allFeatures, initialized.current, tab, properties]); // eslint-disable-line react-hooks/exhaustive-deps

  const defferredGroups = useDeferredValue(groups);

  const [conditions, setConditions] = useState<
    Record<string, MultipleSelectSearchProps["options"]>
  >({});
  const handleConditionsChange = useCallback(
    (key: string, value: MultipleSelectSearchProps["options"]) => {
      setConditions(p => ({ ...p, [key]: value }));
    },
    [],
  );

  const handleSearchButtonClick = useCallback(() => {
    if (!allFeatures) return;

    const conditionEntries = Object.entries(conditions)
      .filter(([, v]) => !!v.length)
      .map(([key, value]) => [key, value.map(v => v.label)]);
    const hasCondition = conditionEntries.some(([, values]) => !!values.length);

    if (allFeatures && hasCondition) {
      setSearchedFeatures({
        features: uniq(
          allFeatures
            .filter(f =>
              conditionEntries.every(([key, values]) => values.includes(get(f.properties, key))),
            )
            .map(f => f.id),
        ),
        highlight: true,
        onlyShow: false,
        selectedIndices: [],
      });
    }
    setTab(1);
  }, [allFeatures, conditions, setSearchedFeatures]);

  const handleResultItemClick = useCallback(
    (i: number) => {
      setSearchedFeatures(p => {
        return p
          ? {
              ...p,
              selectedIndices: [i],
              highlight: false,
            }
          : p;
      });
    },
    [setSearchedFeatures],
  );

  useEffect(() => {
    if (!searchedFeatures) return;
    const index = searchedFeatures.selectedIndices[0];
    if (index === undefined) return;
    const featureId = searchedFeatures.features[index];
    if (!layerId || !featureId) return;
    const feature = window.reearth?.layers?.findFeatureById?.(layerId, featureId);
    if (!feature) return;
    lookAtTileFeature(feature.properties);
  }, [searchedFeatures, layerId]);

  const handleHighlightResultButtonClick = useCallback(() => {
    setSearchedFeatures(p => (p ? { ...p, highlight: !p.highlight, selectedIndices: [] } : p));
  }, [setSearchedFeatures]);

  const handleShowOnlyResultButtonClick = useCallback(() => {
    setSearchedFeatures(p => (p ? { ...p, onlyShow: !p.onlyShow } : p));
  }, [setSearchedFeatures]);

  useEffect(() => () => setSearchedFeatures(null), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!allFeatures) return null;

  return (
    <Popover
      {...bindPopover(state)}
      anchorOrigin={{
        horizontal: "left",
        vertical: "top",
      }}
      transformOrigin={{
        horizontal: "right",
        vertical: "top",
      }}>
      <InspectorHeader title={"データを検索"} onClose={state.close} />
      <Divider />
      <StyledTabs value={deferredTab} onChange={handleTabChange} sx={{ width: "100%" }}>
        <Tab label="条件" />
        <Tab label="結果" />
      </StyledTabs>
      <Content>
        {tab === 0 && (
          <SearchContent>
            <SearchConditionList>
              {defferredGroups.map((group, i) => (
                <SearchConditionListItem key={group.title}>
                  <MultipleSelectSearch
                    title={group.title}
                    options={group.options}
                    position={i >= 2 ? "top" : "bottom"}
                    onChange={(_e, value) => handleConditionsChange(group.key, value)}
                    values={conditions[group.key]}
                  />
                </SearchConditionListItem>
              ))}
            </SearchConditionList>
            <Space size={3} />
            <SearchButton
              color="primary"
              variant="contained"
              onClick={handleSearchButtonClick}
              disabled={!defferredGroups.length}>
              検索
            </SearchButton>
          </SearchContent>
        )}
        {tab === 1 && (
          <div>
            <ResultLabel>{searchedFeatures?.features.length ?? 0}件見つかりました</ResultLabel>
            <Divider />
            <ResultList>
              {defferedSearchedFeatures?.features.map((f, i) => (
                <ResultListItem
                  key={f}
                  selected={searchedFeatures?.selectedIndices.includes(i)}
                  onClick={() => handleResultItemClick(i)}
                  disabled={!defferedSearchedFeatures?.features.length}>
                  {f}
                </ResultListItem>
              ))}
            </ResultList>
            <Divider />
            <ResultButtonList>
              <li>
                <ResultButton
                  color={searchedFeatures?.highlight ? "primary" : "secondary"}
                  variant={searchedFeatures?.highlight ? "contained" : "outlined"}
                  onClick={handleHighlightResultButtonClick}
                  disabled={!defferedSearchedFeatures?.features.length}>
                  結果をハイライト
                </ResultButton>
              </li>
              <li>
                <ResultButton
                  color={searchedFeatures?.onlyShow ? "primary" : "secondary"}
                  variant={searchedFeatures?.onlyShow ? "contained" : "outlined"}
                  onClick={handleShowOnlyResultButtonClick}
                  disabled={!defferedSearchedFeatures?.features.length}>
                  結果のみ表示
                </ResultButton>
              </li>
            </ResultButtonList>
          </div>
        )}
      </Content>
    </Popover>
  );
};
