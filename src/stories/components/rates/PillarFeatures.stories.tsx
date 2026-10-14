import type { Meta, StoryObj } from '@storybook/react-vite';
import { PillarFeatures } from '@/components/rates/PillarFeatures';

const meta: Meta<typeof PillarFeatures> = {
  title: 'Components/Rates/PillarFeatures',
  component: PillarFeatures,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PillarFeatures>;

export const Default: Story = {};
