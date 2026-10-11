import type { Meta, StoryObj } from '@storybook/react-vite';
import { PhoneInput } from '../../components/forms/phone-input';

const meta: Meta<typeof PhoneInput> = {
  title: 'Components/Forms/PhoneInput',
  component: PhoneInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'International phone input component with country dropdown flags, as-you-type formatting, and E.164 validation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text', description: 'Phone number value' },
    defaultCountry: { control: 'text', description: 'ISO country code default (e.g. US, FR)' },
    required: { control: 'boolean', description: 'Required field attribute' },
    invalid: { control: 'boolean', description: 'Invalid state flag' },
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '+12015550123',
    defaultCountry: 'US',
    required: true,
    invalid: false,
  },
};

export const Empty: Story = {
  args: {
    value: '',
    defaultCountry: 'US',
    required: true,
    invalid: false,
  },
};

export const FranceSelected: Story = {
  args: {
    value: '+33612345678',
    defaultCountry: 'FR',
    required: true,
    invalid: false,
  },
};

export const InvalidState: Story = {
  args: {
    value: '123',
    defaultCountry: 'US',
    required: true,
    invalid: true,
  },
};
