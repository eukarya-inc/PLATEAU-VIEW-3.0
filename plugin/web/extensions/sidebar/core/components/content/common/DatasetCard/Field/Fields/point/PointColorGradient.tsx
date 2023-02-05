import { BaseFieldProps } from "../types";

const PointColorGradient: React.FC<BaseFieldProps<"pointColorGradient">> = ({
  value,
  editMode,
  onUpdate,
}) => {
  // remember to update the BaseFieldProps type!
  console.log(value, editMode, onUpdate);
  return <div>PointColor</div>;
};

export default PointColorGradient;
