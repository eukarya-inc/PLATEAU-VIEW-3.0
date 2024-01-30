import { useAtom } from "jotai";
import { useCallback } from "react";

import { showShareModalAtom } from "../../../prototypes/view/states/app";
import Modal from "../../ui-components/ShareModal";

const ShareModal = () => {
  const [showShareModal, setShowShareModal] = useAtom(showShareModalAtom);

  const onClose = useCallback(() => {
    setShowShareModal(false);
  }, [setShowShareModal]);
  //   TODO: pass loading and URL props here
  return <Modal show={showShareModal} onClose={onClose} />;
};

export default ShareModal;
