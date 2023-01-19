import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback, useEffect, useState } from "react";

const validateMessages = {
  required: "このフィルドがない場合は返信できません",
  types: {
    email: "メールアドレスが正しくないです",
  },
};

export default ({
  form,
  addScreenshot,
  backendURL,
  messageApi,
}: {
  form: any;
  addScreenshot: boolean;
  backendURL?: string;
  messageApi: any;
}) => {
  const [screenshot, setScreenshot] = useState<any>();

  const handleSend = useCallback(
    async (values: { name: string; email: string; comment: string }) => {
      if (!backendURL) return;
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("content", values.comment);
      if (screenshot) {
        formData.append("file", screenshot);
      }

      const resp = await fetch(`${backendURL}/opinion`, {
        method: "POST",
        body: formData,
      });
      if (resp.status !== 200) {
        messageApi.open({
          type: "error",
          content: "サバーの問題です。しばらくお待ちしてもう一回して下さい。",
        });
      } else {
        messageApi.open({
          type: "success",
          content: "フィードバックを送りました。ありがとうございます。",
        });
        form.resetFields();
      }
    },
    [form, backendURL, messageApi, screenshot],
  );

  const handleCancel = useCallback(() => {
    form.resetFields();
  }, [form]);

  useEffect(() => {
    if (addScreenshot) {
      postMsg({ action: "screenshot" });
    } else {
      setScreenshot(undefined);
    }
  }, [addScreenshot]);

  useEffect(() => {
    const eventListenerCallback = (e: MessageEvent<any>) => {
      if (e.source !== parent) return;
      if (e.data.type === "screenshot") {
        setScreenshot(e.data.payload);
      }
    };
    addEventListener("message", e => eventListenerCallback(e));
    return () => {
      removeEventListener("message", eventListenerCallback);
    };
  }, []);

  return {
    validateMessages,
    handleSend,
    handleCancel,
  };
};
