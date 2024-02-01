import { FC, useCallback } from "react";

import Modal from "../../ui-components/ShareModal";

type Props = {
  showShareModal: boolean;
  setShowShareModal: (val: boolean) => void;
};

const ShareModal: FC<Props> = ({ showShareModal, setShowShareModal }) => {
  const onClose = useCallback(() => {
    setShowShareModal(false);
  }, [setShowShareModal]);
  //   TODO: pass loading and URL props here
  return <Modal show={showShareModal} onClose={onClose} />;
};

export default ShareModal;
