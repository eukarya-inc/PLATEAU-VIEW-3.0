import { BaseFieldProps } from "../types";

const PointSize: React.FC<BaseFieldProps<"pointSize">> = ({ value, editMode, onUpdate }) => {
  // remember to update the BaseFieldProps type!
  console.log(value, editMode, onUpdate);
  return <div>PointColor</div>;
};

export default PointSize;
