import { Button } from "antd";

import Wrapper from "../common/Wrapper";

const Sidebar: React.FC = () => {
  return (
    <>
      {/* SIDEBAR CONTENTS GO HERE */}
      {/* BELOW WRAPPER IS JUST AN EXAMPLE */}
      <Wrapper>
        <Button type="primary">Primary Button</Button>
      </Wrapper>
    </>
  );
};

export default Sidebar;
