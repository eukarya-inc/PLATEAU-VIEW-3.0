import type { Properties, Field } from "@web/extensions/infobox/types";
import { styled } from "@web/theme";

import PropertyBrowser from "../common/PropertyBrowser";

type Props = {
  properties?: Properties;
  fields: Field[];
};

const ViewPanel: React.FC<Props> = ({ properties, fields }) => {
  return (
    <>
      <Header>
        <Title>建物情報</Title>
      </Header>
      <PropertyBrowser properties={properties} fields={fields} />
    </>
  );
};

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  height: 46px;
  padding: 8px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
`;

const Title = styled.div`
  font-size: 16px;
  line-height: 22px;
`;

export default ViewPanel;
