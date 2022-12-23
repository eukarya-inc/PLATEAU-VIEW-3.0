import { Switch } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { Remarkable } from "remarkable";

import { BaseField as BaseFieldProps } from ".";

type Props = BaseFieldProps<"description"> & {
  isMarkdown?: boolean;
  value?: string;
  editMode?: boolean;
};

const Description: React.FC<Props> = ({ value, isMarkdown, editMode }) => {
  const md = new Remarkable({
    html: false,
    breaks: true,
    typographer: true,
    linkTarget: "__blank",
  });
  const description = value ? (isMarkdown ? md.render(value) : value) : undefined;

  return editMode ? (
    <div>
      <Text>内容</Text>
      <TextBox rows={4} defaultValue={value} />
      <SwitchWrapper>
        <Switch checked={isMarkdown} size="small" />
        <Text>マークダウン</Text>
      </SwitchWrapper>
    </div>
  ) : isMarkdown && description ? (
    <div dangerouslySetInnerHTML={{ __html: description }} />
  ) : (
    <div>{description}</div>
  );
};

export default Description;

const Text = styled.p`
  margin: 0;
`;

const TextBox = styled.textarea`
  width: 100%;
`;

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
`;
