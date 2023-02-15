import { BaseFieldProps } from "../types";

const Clipping: React.FC<BaseFieldProps<"clipping">> = ({ value, editMode, onUpdate }) => {
  console.log(value, onUpdate);
  return editMode ? <div>editor facingcode</div> : <div>user facing code</div>;
};

export default Clipping;
