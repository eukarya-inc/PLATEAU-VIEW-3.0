import { type Meta, type StoryObj } from "@storybook/react";
import { FC } from "react";

import ShareModal from "./index";

const meta: Meta<typeof ShareModal> = {
  title: "ShareModal",
  component: ShareModal,
};

export default meta;

type Story = StoryObj<typeof ShareModal>;

const Component: FC = () => {
  return (
    <div style={{ width: 300 }}>
      <ShareModal show={true} loading={false} />
    </div>
  );
};

export const Default: Story = {
  render: () => <Component />,
};
