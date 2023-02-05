import { BaseFieldProps } from "../types";

const PointModel: React.FC<BaseFieldProps<"pointModel">> = ({ value, editMode, onUpdate }) => {
  // remember to update the BaseFieldProps type!
  console.log(value, editMode, onUpdate);
  return <div>PointColor</div>;
};

export default PointModel;
