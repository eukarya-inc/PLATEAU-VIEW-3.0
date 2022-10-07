import { Button, Form, Icon, Input, Typography } from "@web/extensions/sharedComponents";
import CommonPage from "@web/extensions/sidebar/components/content/CommonPage";
import { styled } from "@web/theme";
import { memo } from "react";

const Info: React.FC = () => {
  const { Text } = Typography;
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
  };

  const handleSend = (values: any) => {
    console.log(values);
    form.resetFields();
  };

  return (
    <CommonPage title="会社内容">
      <>
        <Paragraph>
          PLATEAU は、国土交通省が進める 3D都市モデル整備・活用・オープンデータ化
          のリーディングプロジェクトである。都市活動のプラットフォームデータとして
          3D都市モデルを整備し、
          そのユースケースを創出。さらにこれをオープンデータとして公開することで、誰もが自由に都市のデータを引き出し、活用できるようになる。
        </Paragraph>
        <PlateauButton
          onClick={() => window.open("hqt-mlit-plateau@mlit.go.jp", "_blank", "noopener")}>
          <Icon icon="plateauLogoPart" />
          PLATEAU Project Website
        </PlateauButton>
      </>
      <>
        <Subtitle>ご意見・ご要望</Subtitle>
        <Text>ご意見をお聞かせください。</Text>
        <Form form={form} name="feedback" onFinish={handleSend} layout="vertical">
          <Form.Item name="name" label="お名前（任意）">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="メールアドレス（任意）">
            <Input />
            <Text type="secondary">メールアドレスがない場合は返信できません</Text>
          </Form.Item>
          <Form.Item name="comment" label="コメントまたは質問">
            <Input.TextArea />
          </Form.Item>
          <FormItem>
            <Button htmlType="button" onClick={handleCancel}>
              キャンセル
            </Button>
            <SendButton type="primary" htmlType="submit">
              送信
            </SendButton>
          </FormItem>
        </Form>
      </>
    </CommonPage>
  );
};
export default memo(Info);

const Text = styled.p`
  font-size: 14px;
  margin: 0;
`;

const Subtitle = styled(Text)`
  margin-bottom: 24px;
`;

const Paragraph = styled.p`
  font-size: 12px;
`;

const PlateauButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 48px;
  width: 100%;
  background: transparent;
  border: 1px solid #c7c5c5;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  :hover {
    background: #d1d1d1;
  }
`;

const FormItem = styled(Form.Item)`
  display: flex;
  justify-content: flex-end;
`;

const SendButton = styled(Button)`
  margin-left: 12px;
`;
