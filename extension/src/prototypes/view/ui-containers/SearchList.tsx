import { Button, ListItemSecondaryAction, ListSubheader, MenuList } from "@mui/material";
import { useAtomValue } from "jotai";
import { useCallback, type FC, type MouseEvent, useContext } from "react";

import {
  AddressIcon,
  AppOverlayLayoutContext,
  BuildingIcon,
  DatasetIcon,
  EntityTitleButton,
  type EntityTitleButtonProps,
  type SearchOption,
} from "../..//ui-components";
import {
  type AreaSearchOption,
  type BuildingSearchOption,
  type DatasetSearchOption,
} from "../hooks/useSearchOptions";

const OptionItem: FC<{
  iconComponent: EntityTitleButtonProps["iconComponent"];
  option: SearchOption;
  onClick?: (event: MouseEvent, option: SearchOption) => void;
}> = ({ iconComponent, option, onClick }) => {
  const handleClick = useCallback(
    (event: MouseEvent) => {
      onClick?.(event, option);
    },
    [option, onClick],
  );
  return (
    <EntityTitleButton
      iconComponent={iconComponent}
      title={option.displayName ?? option.name}
      onClick={handleClick}
    />
  );
};

const FilterButton: FC<{
  filter: string;
  onClick?: (event: MouseEvent, filter: string) => void;
}> = ({ filter, onClick }) => {
  const handleClick = useCallback(
    (event: MouseEvent) => {
      onClick?.(event, filter);
    },
    [filter, onClick],
  );
  return (
    <Button variant="text" size="small" onClick={handleClick}>
      絞り込み
    </Button>
  );
};

export interface SearchListProps {
  datasets: readonly DatasetSearchOption[];
  buildings: readonly BuildingSearchOption[];
  areas: readonly AreaSearchOption[];
  onOptionSelect?: (event: MouseEvent, option: SearchOption) => void;
  onFiltersChange?: (event: MouseEvent, filters: string[]) => void;
}

export const SearchList: FC<SearchListProps> = ({
  datasets,
  buildings,
  areas,
  onOptionSelect,
  onFiltersChange,
}) => {
  const handleClickFilter = useCallback(
    (event: MouseEvent, filter: string) => {
      onFiltersChange?.(event, [filter]);
    },
    [onFiltersChange],
  );

  const { maxMainHeightAtom, searchHeaderHeight } = useContext(AppOverlayLayoutContext);
  const maxMainHeight = useAtomValue(maxMainHeightAtom);

  return (
    <MenuList component="div" dense sx={{ maxHeight: `${maxMainHeight - searchHeaderHeight}px` }}>
      {datasets.length > 0 && [
        <ListSubheader component="div" key="datasets">
          周辺のデータセット
          <ListItemSecondaryAction>
            <FilterButton filter="dataset" onClick={handleClickFilter} />
          </ListItemSecondaryAction>
        </ListSubheader>,
        ...datasets
          .slice(0, 4)
          .map((option, index) => (
            <OptionItem
              key={`datasets:${index}`}
              iconComponent={DatasetIcon}
              option={option}
              onClick={onOptionSelect}
            />
          )),
      ]}
      {buildings.length > 0 && [
        <ListSubheader key="buildings">
          周辺の建築物
          <ListItemSecondaryAction>
            <FilterButton filter="building" onClick={handleClickFilter} />
          </ListItemSecondaryAction>
        </ListSubheader>,
        ...buildings
          .slice(0, 4)
          .map((option, index) => (
            <OptionItem
              key={`buildings:${index}`}
              iconComponent={BuildingIcon}
              option={option}
              onClick={onOptionSelect}
            />
          )),
      ]}
      {areas.length > 0 && [
        <ListSubheader key="areas">
          周辺のエリア
          <ListItemSecondaryAction>
            <FilterButton filter="address" onClick={handleClickFilter} />
          </ListItemSecondaryAction>
        </ListSubheader>,
        ...areas
          .slice(0, 4)
          .map((option, index) => (
            <OptionItem
              key={`areas:${index}`}
              iconComponent={AddressIcon}
              option={option}
              onClick={onOptionSelect}
            />
          )),
      ]}
    </MenuList>
  );
};
