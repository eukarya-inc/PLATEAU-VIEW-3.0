import { BaseFieldProps } from "../types";

const PointIcon: React.FC<BaseFieldProps<"pointIcon">> = ({ value, editMode, onUpdate }) => {
  console.log(value, editMode, onUpdate);
  return <div>PointColor</div>;
};

export default PointIcon;
