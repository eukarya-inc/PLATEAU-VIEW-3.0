import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  List,
  ListItemSecondaryAction,
  ListSubheader,
} from "@mui/material";
import { type Meta, type StoryObj } from "@storybook/react";
import { useAtomValue } from "jotai";
import { Resizable } from "re-resizable";
import { useCallback, useContext, useState, type FC } from "react";

import { AppOverlayLayout, AppOverlayLayoutContext } from "./AppOverlayLayout";
import { EntityTitleButton } from "./EntityTitleButton";
import { FloatingPanel } from "./FloatingPanel";
import { BuildingIcon, DatasetIcon, LayerIcon, LocationIcon } from "./icons";
import { LayerList } from "./LayerList";
import { LayerListItem } from "./LayerListItem";
import { SearchAutocomplete } from "./SearchAutocomplete";

const meta: Meta<typeof SearchAutocomplete> = {
  title: "SearchAutocomplete",
  component: SearchAutocomplete,
};

export default meta;

type Story = StoryObj<typeof SearchAutocomplete>;

const options = [
  ...[...Array(1000)].map((_, index) => ({
    type: "dataset" as const,
    name: `Dataset ${index}`,
  })),
  ...[...Array(1000)].map((_, index) => ({
    type: "building" as const,
    name: `Building ${index}`,
  })),
  ...[...Array(1000)].map((_, index) => ({
    type: "area" as const,
    name: `Address ${index}`,
  })),
];

const Component: FC = () => {
  const [focused, setFocused] = useState(false);
  const [mainWidth, setMainWidth] = useState(320);
  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleClickAway = useCallback(() => {
    console.log("sample sample");
    setFocused(false);
  }, []);

  const { maxMainHeightAtom } = useContext(AppOverlayLayoutContext);
  const maxMainHeight = useAtomValue(maxMainHeightAtom);

  return (
    <AppOverlayLayout
      mainWidth={mainWidth}
      main={
        <ClickAwayListener onClickAway={handleClickAway}>
          <FloatingPanel>
            <Resizable
              minWidth={320}
              enable={{
                left: true,
                right: true,
              }}
              onResize={(...val) => {
                setMainWidth(val[2].clientWidth);
              }}>
              <SearchAutocomplete
                placeholder="データ、エリア、場所を検索"
                options={options}
                maxHeight={maxMainHeight}
                onFocus={handleFocus}>
                <Box>
                  <Divider />
                  {!focused ? (
                    <LayerList>
                      <LayerListItem iconComponent={LayerIcon} title="レイヤー 1" />
                      <LayerListItem iconComponent={LayerIcon} title="レイヤー 2" />
                      <LayerListItem iconComponent={LayerIcon} title="レイヤー 3" />
                      <LayerListItem iconComponent={LayerIcon} title="レイヤー 4" />
                      <LayerListItem iconComponent={LayerIcon} title="レイヤー 5" />
                    </LayerList>
                  ) : (
                    <List component="div" dense>
                      <ListSubheader component="div">
                        このエリアのデータセット
                        <ListItemSecondaryAction>
                          <Button variant="text" size="small">
                            絞り込み
                          </Button>
                        </ListItemSecondaryAction>
                      </ListSubheader>
                      <EntityTitleButton iconComponent={DatasetIcon} title="Dataset" />
                      <EntityTitleButton iconComponent={DatasetIcon} title="Dataset" />
                      <EntityTitleButton iconComponent={DatasetIcon} title="Dataset" />
                      <ListSubheader>
                        このエリアの建築物
                        <ListItemSecondaryAction>
                          <Button variant="text" size="small">
                            絞り込み
                          </Button>
                        </ListItemSecondaryAction>
                      </ListSubheader>
                      <EntityTitleButton iconComponent={BuildingIcon} title="Building" />
                      <EntityTitleButton iconComponent={BuildingIcon} title="Building" />
                      <EntityTitleButton iconComponent={BuildingIcon} title="Building" />
                      <ListSubheader>
                        このエリアの住所
                        <ListItemSecondaryAction>
                          <Button variant="text" size="small">
                            絞り込み
                          </Button>
                        </ListItemSecondaryAction>
                      </ListSubheader>
                      <EntityTitleButton iconComponent={LocationIcon} title="Address" />
                      <EntityTitleButton iconComponent={LocationIcon} title="Address" />
                      <EntityTitleButton iconComponent={LocationIcon} title="Address" />
                    </List>
                  )}
                </Box>
              </SearchAutocomplete>
            </Resizable>
          </FloatingPanel>
        </ClickAwayListener>
      }
    />
  );
};

export const Default: Story = {
  render: () => <Component />,
};

export const Sample: Story = {
  render: () => (
    <Resizable
      enable={{
        left: true,
        right: true,
      }}>
      <div
        style={{
          border: "1px solid red",
        }}>
        Sample things here
      </div>
    </Resizable>
  ),
};
