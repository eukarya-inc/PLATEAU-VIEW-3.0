import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { FC, memo } from "react";

import { MOBILE_WIDTH } from "../prototypes/view/constants/ui";
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
  const { ready, visible, show, content, handleClose, handleCheckboxChange, doNotShowAgain } =
    useNotificationLogic();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_WIDTH));

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
              position: "absolute",
              right: 0,
              bottom: 0,
              width: isMobile ? "calc(100vw - 16px)" : "349px",
              borderRadius: "6px",
            }}>
            <CardHeader
              avatar={<InfoOutlinedIcon />}
              action={
                <IconButton aria-label="close" onClick={handleClose} size="small">
                  <CloseIcon />
                </IconButton>
              }
              title="お知らせ"
              titleTypographyProps={{ variant: "h6", fontWeight: 400 }}
              sx={{ borderBottom: "1px solid #EAEAEA" }}
            />
            <CardContent>
              <ViewMarkdownViewer content={content} />
            </CardContent>
            <CardActions
              sx={{
                backgroundColor: "#EDEDED",
                padding: "0 0 0 10px",
                height: "40px",
              }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="doNotShowAgain"
                    checked={doNotShowAgain}
                    onChange={handleCheckboxChange}
                    size={"medium"}
                  />
                }
                componentsProps={{
                  typography: { variant: "body2" },
                }}
                sx={{
                  padding: 0,
                }}
                label="閉じて今後は表示しない"
              />
            </CardActions>
          </Card>
        )}
      </WidgetContext>
    </div>
  );
});
