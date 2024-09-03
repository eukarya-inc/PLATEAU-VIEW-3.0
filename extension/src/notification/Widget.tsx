import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Card, CardHeader, CardContent, CardActions, Typography, IconButton, Checkbox, FormControlLabel } from "@mui/material";
import { useAtomValue } from "jotai";
import { FC, memo, useState } from "react";

import { readyAtom } from "../prototypes/view/states/app";
import { WidgetContext } from "../shared/context/WidgetContext";
import { CameraPosition } from "../shared/reearth/types";
import { WidgetProps } from "../shared/types/widget";
import { PLATEAUVIEW_NOTIFICATION_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";

type DefaultProps = {
  geoURL?: string;
  gsiTileURL?: string;
  arURL?: string;
  plateauURL?: string;
  plateauAccessToken?: string;
  catalogURL?: string;
  catalogURLForAdmin?: string;
  projectName?: string;
  googleStreetViewAPIKey?: string;
  geojsonURL?: string;
  hideFeedback?: boolean;
};

type OptionalProps = {
  projectNameForCity?: string;
  plateauAccessTokenForCity?: string;
  cityName?: string;
  cityCode?: string;
  primaryColor?: string;
  mainLogo?: string;
  menuLogo?: string;
  pedestrian?: CameraPosition;
  siteUrl?: string;
};

type Props = WidgetProps<DefaultProps, OptionalProps>;

export const Widget: FC<Props> = memo(function WidgetPresenter({ widget, inEditor }) {
  const ready = useAtomValue(readyAtom);
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null; // 非表示の場合、何もレンダリングしない

  return (
    <div id={PLATEAUVIEW_NOTIFICATION_DOM_ID}>
      <WidgetContext
        inEditor={inEditor}
        plateauUrl={widget.property.default.plateauURL}
        projectId={widget.property.default.projectName}
        plateauToken={widget.property.default.plateauAccessToken}
        catalogUrl={widget.property.default.catalogURL}
        catalogURLForAdmin={widget.property.default.catalogURLForAdmin}
        geoUrl={widget.property.default.geoURL}
        gsiTileURL={widget.property.default.gsiTileURL}
        googleStreetViewAPIKey={widget.property.default.googleStreetViewAPIKey}
        geojsonURL={widget.property.default.geojsonURL}
        hideFeedback={widget.property.default.hideFeedback}
        projectIdForCity={widget.property.optional?.projectNameForCity}
        plateauTokenForCity={widget.property.optional?.plateauAccessTokenForCity}
        cityName={widget.property.optional?.cityName}
        cityCode={widget.property.optional?.cityCode}
        customPrimaryColor={widget.property.optional?.primaryColor}
        customMainLogo={widget.property.optional?.mainLogo}
        customMenuLogo={widget.property.optional?.menuLogo}
        customPedestrian={widget.property.optional?.pedestrian}
        customSiteUrl={widget.property.optional?.siteUrl}
      >
        {ready && (
          <Card
            sx={{
              width: "349px",
              backgroundColor: "#f9f9f9", // 背景色を変更
              border: "1px solid #ccc", // ボーダーを追加
              borderRadius: "8px", // 角を丸くする
            }}
          >
            <CardHeader
              avatar={<InfoOutlinedIcon />}
              action={
                <IconButton aria-label="close" onClick={handleClose} size="small">
                  <CloseIcon />
                </IconButton>
              }
              title="お知らせ"
              titleTypographyProps={{ variant: "h6" }}
              sx={{ borderBottom: "1px solid #ddd" }}
            />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                【重要】2022年2月7日10:00〜11:00にサーバーメンテナンスの実施に伴いPLATEAUサービスがご利用いただけません。 予めご了承ください。
              </Typography>
            </CardContent>
            <CardActions
              sx={{
                backgroundColor: "#EDEDED",
                borderRadius: "4px",
                padding: "4px",
                width: "100%",
              }}
            >
              <FormControlLabel control={<Checkbox name="doNotShowAgain" />} label="閉じて今後は表示しない" />
            </CardActions>
          </Card>
        )}
      </WidgetContext>
    </div>
  );
});
