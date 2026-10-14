import type { Meta, StoryObj } from '@storybook/react-vite';
import { FindYourStayTravelPartyButton } from '@/components/booking/discovery/FindYourStayTravelPartyButton';

const meta: Meta<typeof FindYourStayTravelPartyButton> = {
  title: 'Components/Booking/Discovery/FindYourStayTravelPartyButton',
  component: FindYourStayTravelPartyButton,
  tags: ['autodocs'],
  args: { id: 'partner', title: 'PARTNER', subtitle: 'Just the two of us', isSelected: false },
  argTypes: { isSelected: { control: 'boolean' }, onSelect: { action: 'onSelect' } },
};

export default meta;
type Story = StoryObj<typeof FindYourStayTravelPartyButton>;

export const Default: Story = {};
export const Selected: Story = { args: { isSelected: true } };
