import { Switch } from "@web/sharedComponents";
import { styled } from "@web/theme";
import { Remarkable } from "remarkable";

type Props = {
  value?: {
    content?: string;
    isMarkdown?: boolean;
  };
  editMode?: boolean;
};

const Description: React.FC<Props> = ({ value, editMode }) => {
  const md = new Remarkable({
    html: false,
    breaks: true,
    typographer: true,
    linkTarget: "__blank",
  });
  const description = value?.content
    ? value.isMarkdown
      ? md.render(value.content)
      : value.content
    : undefined;

  return editMode ? (
    <div>
      <Text>内容</Text>
      <TextBox rows={4} defaultValue={value?.content} />
      <SwitchWrapper>
        <Switch checked={value?.isMarkdown} size="small" />
        <Text>マークダウン</Text>
      </SwitchWrapper>
    </div>
  ) : value?.isMarkdown && description ? (
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
