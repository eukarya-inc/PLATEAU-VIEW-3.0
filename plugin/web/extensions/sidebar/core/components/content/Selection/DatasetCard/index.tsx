import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useMemo, useState } from "react";

import { expandSection, collapseSection } from "./accordion";
import Field from "./Field";
import { Dataset as DatasetType, Field as FieldType } from "./types";

export type Dataset = DatasetType;

export type Field = FieldType;

export type Props = {
  dataset: Dataset;
  onRemove?: (id: string) => void;
};

function makeid(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const DatasetCard: React.FC<Props> = ({ dataset: { id, name }, onRemove }) => {
  const [expanded, setExpand] = useState(false);
  const collapseClass = useMemo(() => `collapsible-${makeid(id.length)}`, [id]);

  const baseFields: Field[] = [
    { id: "zoom", title: "Ideal Zoom", icon: "mapPin", value: 1 },
    { id: "about", title: "About Data", icon: "about", value: "www.plateau.org/data-url" },
    { id: "remove", icon: "trash" },
  ];

  const handleExpand = useCallback(() => {
    setExpand(!expanded);
    const contentWrapperComponent = document.querySelector(`.${collapseClass}`) as HTMLDivElement;
    const isCollapsed = contentWrapperComponent?.getAttribute("data-collapsed") === "true";

    if (isCollapsed) {
      expandSection(contentWrapperComponent);
      contentWrapperComponent.setAttribute("data-collapsed", "false");
    } else {
      collapseSection(contentWrapperComponent);
    }
  }, [collapseClass, expanded]);

  return (
    <Wrapper>
      <Main expanded={expanded} onClick={handleExpand}>
        <LeftMain>
          <Icon icon="visible" size={20} />
          <Title>{name}</Title>
        </LeftMain>
        <ArrowIcon icon="arrowDown" size={16} expanded={expanded} />
      </Main>
      <ContentWrapper className={collapseClass} data-collapsed>
        <Content>
          {baseFields.map((field, idx) => (
            <Field key={idx} onClick={() => field.id === "remove" && onRemove?.(id)}>
              {field.icon && <Icon icon={field.icon} size={20} />}
              {field.title && <FieldName>{field.title}</FieldName>}
            </Field>
          ))}
          {/* {fields?.map((field, idx) => (
            <Field key={idx}>
              {field.icon && <Icon icon={field.icon} size={20} />}
              {field.title}
            </Field>
          ))} */}
        </Content>
      </ContentWrapper>
    </Wrapper>
  );
};

export default DatasetCard;

const Wrapper = styled.div`
  width: 100%;
  margin: 8px 0;
  border-radius: 4px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
`;

const LeftMain = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Title = styled.p`
  margin: 0;
  font-size: 16px;
`;

const SharedAccordionStyles = styled.div`
  padding: 12px;
`;

const Main = styled(SharedAccordionStyles)<{ expanded?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 46px;
  background: #ffffff;
  border-radius: ${({ expanded }) => (!expanded ? "4px" : "4px 4px 0px 0px")};
  border-bottom: 1px solid #e6e6e6;
  cursor: pointer;
`;

const Content = styled.div`
  display: flex;
  align-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

const ContentWrapper = styled.div`
  background: #f0f0f0;
  border-radius: 0px 0px 4px 4px;
  overflow: hidden;
  transition: height 0.3s ease-out, padding-top 0.3s ease-out, padding-bottom 0.3s ease-out;
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
  padding-left: 12px;
  padding-right: 12px;
`;

const ArrowIcon = styled(Icon)<{ expanded: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ expanded }) => !expanded && "rotate(90deg)"};
`;

const FieldName = styled.p`
  margin: 0;
`;
