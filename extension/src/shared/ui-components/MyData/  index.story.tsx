import { Meta, StoryObj } from "@storybook/react";
import { FC } from "react";

import MyData from ".";

const meta: Meta<typeof MyData> = {
  title: "MyData",
  component: MyData,
};

export default meta;
type Story = StoryObj<typeof MyData>;

const Component: FC = () => {
  return <MyData />;
};

export const Default: Story = {
  render: () => <Component />,
};
