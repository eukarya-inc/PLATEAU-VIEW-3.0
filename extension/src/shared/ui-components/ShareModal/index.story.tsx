import { type Meta, type StoryObj } from "@storybook/react";
import { FC } from "react";

import ShareModal, { Props } from "./index";

const meta: Meta<typeof ShareModal> = {
  title: "ShareModal",
  component: ShareModal,
};

export default meta;

type Story = StoryObj<typeof ShareModal>;

const Component: FC<Props> = ({ loading = false, show = true }) => {
  return (
    <div style={{ width: 300 }}>
      <ShareModal show={show} loading={loading} />
    </div>
  );
};

export const Default: Story = {
  render: () => <Component show={true} />,
};

export const Loading: Story = {
  render: () => <Component show={true} loading={true} />,
};
