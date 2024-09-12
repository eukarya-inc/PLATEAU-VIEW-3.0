import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { FC, memo } from "react";

import { WidgetContext } from "../shared/context/WidgetContext";
import { ViewMarkdownViewer } from "../shared/ui-components/common";
import { PLATEAUVIEW_NOTIFICATION_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";

import { useNotificationLogic } from "./hooks/useNotificationLogic";

type NotificationProps = {
  isEnable?: boolean;
  content?: string;
  startTime?: string;
  finishTime?: string;
};

type NotificationWidgetProps<NotificationProps> = {
  inEditor: boolean;
  widget: {
    property: {
      default: NotificationProps;
    };
  };
};

type Props = NotificationWidgetProps<NotificationProps>;

export const Widget: FC<Props> = memo(function WidgetPresenter({ widget }) {
  const { ready, visible, show, content, handleClose, handleCheckboxChange, doNotShowAgain } = useNotificationLogic();

  if (!visible) return null;

  return (
    <div id={PLATEAUVIEW_NOTIFICATION_DOM_ID}>
      <WidgetContext
        isEnable={widget.property.default.isEnable}
        content={widget.property.default.content}
        startTime={widget.property.default.startTime}
        finishTime={widget.property.default.finishTime}>
        {ready && show && (
          <Card
            sx={{
              width: "349px",
              backgroundColor: "#f9f9f9", // 背景色を変更
              border: "1px solid #ccc", // ボーダーを追加
              borderRadius: "8px", // 角を丸くする
            }}>
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
                <ViewMarkdownViewer content={content} />
              </Typography>
            </CardContent>
            <CardActions
              sx={{
                backgroundColor: "#EDEDED",
                borderRadius: "4px",
                padding: "4px",
                width: "100%",
              }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="doNotShowAgain"
                    checked={doNotShowAgain}
                    onChange={handleCheckboxChange}
                  />
                }
                label="閉じて今後は表示しない"
              />
            </CardActions>
          </Card>
        )}
      </WidgetContext>
    </div>
  );
});
