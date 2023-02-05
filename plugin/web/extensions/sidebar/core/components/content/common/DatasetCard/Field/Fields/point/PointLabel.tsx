import { BaseFieldProps } from "../types";

const PointLabel: React.FC<BaseFieldProps<"pointLabel">> = ({ value, editMode, onUpdate }) => {
  // remember to update the BaseFieldProps type!
  console.log(value, editMode, onUpdate);
  return <div>PointColor</div>;
};

export default PointLabel;
