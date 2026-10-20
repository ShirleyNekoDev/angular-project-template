import type { Meta, StoryObj } from '@storybook/angular';

import { HelloUser } from './hello-user';

const meta: Meta<HelloUser> = {
	title: 'Components/HelloUser',
	component: HelloUser,
	tags: ['autodocs'],
	argTypes: {
		user: { control: 'text' },
	},
	args: {
		user: 'World',
	},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
