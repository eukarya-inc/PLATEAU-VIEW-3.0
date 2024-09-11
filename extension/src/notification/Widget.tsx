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
import { atom, useAtomValue, useSetAtom } from "jotai";
import { FC, memo, useState, useEffect } from "react";

import { readyAtom } from "../prototypes/view/states/app";
import { WidgetContext } from "../shared/context/WidgetContext";
import {
  isEnableAtom,
  contentAtom,
  startTimeAtom,
  finishTimeAtom,
} from "../shared/states/environmentVariables";
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
const showAtom = atom<boolean>(false);

export const Widget: FC<Props> = memo(function WidgetPresenter({ widget }) {
  const ready = useAtomValue(readyAtom);
  const [visible, setVisible] = useState(true);
  const [doNotShowAgain, setDoNotShowAgain] = useState<boolean>(false);

  const isEnable = useAtomValue(isEnableAtom);
  const content = useAtomValue(contentAtom);
  const startTime = useAtomValue(startTimeAtom);
  const finishTime = useAtomValue(finishTimeAtom);
  const show = useAtomValue(showAtom);
  const setShow = useSetAtom(showAtom);

  useEffect(() => {
    const storedDoNotShowAgain = localStorage.getItem("doNotShowAgain");
    const storedPreviousContent = localStorage.getItem("previousContent");

    if (storedDoNotShowAgain === "true" && storedPreviousContent === content) {
      setVisible(false);
      return;
    }

    // Get the current time and convert it to UTC
    const nowUTC = new Date().getTime();

    // Convert `startTime` and `finishTime` to UTC
    const startTimeUTC = startTime ? new Date(startTime).getTime() : null;
    const finishTimeUTC = finishTime ? new Date(finishTime).getTime() : null;

    // Check display conditions
    if (isEnable) {
      if (!startTimeUTC && !finishTimeUTC) {
        // If neither is set, always show
        setShow(true);
      } else if (startTimeUTC && !finishTimeUTC) {
        // If only `startTime` is set, show if current time is after `startTime`
        setShow(nowUTC >= startTimeUTC);
      } else if (!startTimeUTC && finishTimeUTC) {
        // If only `finishTime` is set, show if current time is before `finishTime`
        setShow(nowUTC <= finishTimeUTC);
      } else if (startTimeUTC && finishTimeUTC) {
        // If both are set, show if current time is between `startTime` and `finishTime`
        setShow(nowUTC >= startTimeUTC && nowUTC <= finishTimeUTC);
      }
    } else {
      setShow(false); // Always hide if `isEnable` is false
    }
  }, [isEnable, startTime, finishTime, content, setShow]);

  const handleClose = () => {
    setVisible(false);
    if (doNotShowAgain) {
      // Save the "do not show again" flag to localStorage
      localStorage.setItem("doNotShowAgain", "true");
      localStorage.setItem("previousContent", content || "");
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDoNotShowAgain(event.target.checked);
  };

  if (!visible) return null; // 非表示の場合、何もレンダリングしない

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
