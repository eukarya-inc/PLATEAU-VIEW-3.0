import { usePublishUrl } from "@web/extensions/sidebar/state";
import { postMsg } from "@web/extensions/sidebar/utils";
import { useCallback } from "react";

export default () => {
  const [publishUrl, setPublishUrl] = usePublishUrl();

  const handleScreenshotShow = useCallback(() => {
    postMsg({ action: "screenshot" });
  }, []);

  const handleScreenshotSave = useCallback(() => {
    postMsg({ action: "screenshot-save" });
  }, []);

  const handleProjectShare = useCallback(() => {
    const suffix = makeUrlSuffix();
    if (!publishUrl) {
      // To do: hit PLATEAU backend endpoint and create project, returning
      // publish URl or error.
      setPublishUrl(`https://plateauview.mlit.go.jp/${suffix}`);
    }
  }, []);

  return {
    publishUrl,
    handleProjectShare,
    handleScreenshotShow,
    handleScreenshotSave,
  };
};

addEventListener("message", e => {
  if (e.source !== parent) return;
  if (e.data.type) {
    if (e.data.type === "screenshot") {
      generatePrintView(e.data.payload);
    } else if (e.data.type === "screenshot-save") {
      const link = document.createElement("a");
      link.download = "screenshot.png";
      link.href = e.data.payload;
      link.click();
      link.remove();
    }
  }
});

function makeUrlSuffix() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generatePrintView(payload?: string) {
  const doc = window.open()?.document;

  if (!doc || !payload) return;

  const css = `html,body{ margin: 0; }`;

  const styleTag = doc.createElement("style");
  styleTag.appendChild(document.createTextNode(css));
  styleTag.setAttribute("type", "text/css");
  doc.head.appendChild(styleTag);

  const iframe = doc.createElement("iframe");
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  doc.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.open();

  const iframeHTML = `
  <div style="display: flex; flex-direction: column; max-width: 1200px; height: 100%; margin: 0 auto; padding: 20px;">
    <div style="display: flex; justify-content: right; align-items: center; gap: 8px; height: 60px;">
      <button style="padding: 8px; border: none; border-radius: 4px; background: #00BEBE; color: white; cursor: pointer;">Download map</button>
      <button style="padding: 9px; border: none; border-radius: 4px; background: #00BEBE; color: white; cursor: pointer;">Print</button>
    </div>
    <div style="display: flex; justify-content: center; width: 100%;">
      <img src="${payload}" style="max-width: 100%; object-fit: contain;" />
    </div>
    <div>
      <p>This map was created using https://plateauview.mlit.go.jp on ${new Date()}</p>
    </div>
  </div>
`;
  iframe.contentWindow?.document.write(iframeHTML);

  const iframeHtmlStyle = iframe.contentWindow?.document.createElement("style");
  if (iframeHtmlStyle) {
    iframeHtmlStyle.appendChild(document.createTextNode(css));
    iframeHtmlStyle.setAttribute("type", "text/css");
    iframe.contentWindow?.document.head.appendChild(iframeHtmlStyle);
  }

  iframe.contentWindow?.document.close();

  return iframe;
}
