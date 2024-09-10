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
import { useAtomValue } from "jotai";
import { FC, memo, useState } from "react";

import { readyAtom } from "../prototypes/view/states/app";
import { WidgetContext } from "../shared/context/WidgetContext";
import { contentAtom } from "../shared/states/environmentVariables";
import { ViewMarkdownViewer } from "../shared/ui-components/common";
import { PLATEAUVIEW_NOTIFICATION_DOM_ID } from "../shared/ui-components/common/ViewClickAwayListener";

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
  const ready = useAtomValue(readyAtom);
  const [visible, setVisible] = useState(true);
  const content = useAtomValue(contentAtom);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null; // 非表示の場合、何もレンダリングしない

  return (
    <div id={PLATEAUVIEW_NOTIFICATION_DOM_ID}>
      <WidgetContext
        isEnable={widget.property.default.isEnable}
        content={widget.property.default.content}
        startTime={widget.property.default.startTime}
        finishTime={widget.property.default.finishTime}>
        {ready && (
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
                control={<Checkbox name="doNotShowAgain" />}
                label="閉じて今後は表示しない"
              />
            </CardActions>
          </Card>
        )}
      </WidgetContext>
    </div>
  );
});
