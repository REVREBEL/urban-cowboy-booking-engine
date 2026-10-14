import type { Meta, StoryObj } from '@storybook/react-vite';
import { RideEasySoloPage } from '@/components/rates/RideEasySoloPage';

const meta: Meta<typeof RideEasySoloPage> = {
  title: 'Components/Rates/RideEasySoloPage',
  component: RideEasySoloPage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RideEasySoloPage>;

export const Default: Story = {};
