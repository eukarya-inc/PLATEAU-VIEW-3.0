import { useAtom } from "jotai";
import { useCallback, useState } from "react";

import { useAddLayer } from "../../../prototypes/layers";
import { showMyDataModalAtom } from "../../../prototypes/view/states/app";
import MyDataModal from "../../ui-components/MyData";

const MyData = () => {
  const [showMyDataModal, setShowMyDataModal] = useAtom(showMyDataModalAtom);
  const addLayer = useAddLayer();

  const [value, setValue] = useState("local");

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    if (event) setValue(newValue);
  }, []);

  const onClose = useCallback(() => {
    setShowMyDataModal(false);
  }, [setShowMyDataModal]);

  return (
    <MyDataModal
      selectedTab={value}
      show={showMyDataModal}
      addLayer={addLayer}
      handleTabChange={handleTabChange}
      onClose={onClose}
    />
  );
};

export default MyData;
