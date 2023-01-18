import BasicOperation from "./BasicOperation";
import ClipFunction from "./ClipFunction";
import useGlobalHooks from "./globalHooks";
import ShadowFunction from "./ShadowFunction";
import { PopupWrapper } from "./sharedComponent";
import TryMapInfo from "./TryMapInfo";

const Help: React.FC = () => {
  const { currentPopup, handleClosePopup } = useGlobalHooks();

  return (
    <PopupWrapper handleClose={handleClosePopup}>
      {currentPopup &&
        {
          basic: <BasicOperation />,
          map: <TryMapInfo />,
          shadow: <ShadowFunction />,
          clip: <ClipFunction />,
        }[currentPopup]}
    </PopupWrapper>
  );
};

export default Help;
