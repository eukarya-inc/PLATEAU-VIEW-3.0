import CommonPage from "@web/extensions/sidebar/core/components/content/CommonPage";
import { Icon } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { useCallback, useState } from "react";

import { Template } from "../../../types";

/*
[
    { name: "建物モデル", fields: [{ title: "Filter" }] },
    { name: "ランドマーク", fields: [{ title: "Display" }, { title: "search" }] },
  ] 
  */

export type Props = {
  templates: Template[];
  onTemplateAdd: (newTemplate?: Template) => Promise<Template | undefined>;
  onTemplateUpdate: (template: Template) => Promise<void>;
  onTemplateRemove: (template: Template) => Promise<void>;
};

const Templates: React.FC<Props> = ({
  templates,
  onTemplateAdd,
  // onTemplateUpdate,
  onTemplateRemove,
}) => {
  const [selected, changeSelected] = useState<Template>();

  const handleTemplateAdd = useCallback(async () => {
    const newTemplate = await onTemplateAdd();
    changeSelected(newTemplate);
  }, [onTemplateAdd]);

  const handleTemplateSelect = useCallback((template?: Template) => {
    changeSelected(template);
  }, []);

  const handleBack = useCallback(() => {
    changeSelected(undefined);
  }, []);

  return (
    <CommonPage>
      <Content>
        {selected ? (
          <TemplateEditWrapper>
            <div style={{ height: "36px" }}>
              <BackButton icon="arrowLeft" size={20} onClick={handleBack} />
            </div>
            <TemplateComponent>
              <p style={{ margin: 0 }}>{selected.name}</p>
            </TemplateComponent>
          </TemplateEditWrapper>
        ) : (
          <>
            <Title>Template Editor</Title>
            <TemplateAddButton onClick={handleTemplateAdd}>
              <Icon icon="plus" size={16} /> New Template
            </TemplateAddButton>
            {templates.length > 0 &&
              templates.map((t, idx) => (
                <TemplateComponent key={idx} onClick={() => handleTemplateSelect(t)}>
                  {t.name}
                  <StyledIcon
                    icon="trash"
                    size={16}
                    onClick={e => {
                      e?.stopPropagation();
                      onTemplateRemove(t);
                    }}
                  />
                </TemplateComponent>
              ))}
          </>
        )}
      </Content>
    </CommonPage>
  );
};

export default Templates;

const Content = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.p`
  margin: 0;
`;

const TemplateWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 34px;
  width: 100%;
  background: #f5f5f5;
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: #ffffff;
  }
`;

const TemplateAddButton = styled(TemplateWrapper)`
  user-select: none;
  justify-content: center;
  gap: 8px;
`;

const TemplateComponent = styled(TemplateWrapper)`
  justify-content: space-between;
  padding-left: 12px;
  padding-right: 10px;
`;

const TemplateEditWrapper = styled.div`
  width: 100%;
`;

const BackButton = styled(Icon)`
  cursor: pointer;
`;

const StyledIcon = styled(Icon)`
  border-radius: 4px;
  padding: 2px;
  border-width: 0.5px;
  border-style: solid;
  border-color: transparent;

  :hover {
    background: #f5f5f5;
    border-color: black;
  }
`;
