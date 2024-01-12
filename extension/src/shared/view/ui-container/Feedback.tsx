import { useAtom } from "jotai";

import { showFeedbackModalAtom } from "../../../prototypes/view/states/app";
import FeedBackModal from "../../ui-components/FeedBackModal";

const FeedBack = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useAtom(showFeedbackModalAtom);

  const handleSubmit = (params: {
    name: string;
    email: string;
    comment: string;
    attachMapReview: boolean;
  }) => {
    console.log(params);
  };

  return (
    <FeedBackModal
      onSubmit={handleSubmit}
      show={showFeedbackModal}
      setShowFeedbackModal={setShowFeedbackModal}
    />
  );
};

export default FeedBack;
