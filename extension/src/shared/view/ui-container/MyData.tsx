import { useAtom } from "jotai";
import { useCallback } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { showMyDataModalAtom } from "../../../prototypes/view/states/app";
import MyDataModal from "../../ui-components/MyData";

const MyData = () => {
  const [showMyDataModal, setShowMyDataModal] = useAtom(showMyDataModalAtom);
  const addLayer = useAddLayer();

  const onClose = useCallback(() => {
    setShowMyDataModal(false);
  }, [setShowMyDataModal]);

  return <MyDataModal show={showMyDataModal} addLayer={addLayer} onClose={onClose} />;
};

export default MyData;
