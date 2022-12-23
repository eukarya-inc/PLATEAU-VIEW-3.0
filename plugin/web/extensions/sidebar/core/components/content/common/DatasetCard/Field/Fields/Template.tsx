import { BaseField as BaseFieldProps } from ".";

type Props = BaseFieldProps<"template"> & {};

const Template: React.FC<Props> = () => {
  return <p>I AM Template</p>;
};

export default Template;
