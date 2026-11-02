import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SearchBarLocationDropdown } from '@/components/booking/search/SearchBarLocationDropdown';

const meta: Meta<typeof SearchBarLocationDropdown> = {
  title: 'Components/Booking/Search/SearchBarLocationDropdown',
  component: SearchBarLocationDropdown,
  tags: ['autodocs'],
  args: { value: 'CATSKILLS' },
};

export default meta;
type Story = StoryObj<typeof SearchBarLocationDropdown>;

export const Default: Story = {};

function FocusHarness() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState('NASHVILLE');

  return (
    <div className="flex items-start gap-4 p-8">
      <button type="button" onClick={() => setOpen(true)}>Open location</button>
      <button type="button" onClick={() => setOpen(false)}>Other section</button>
      {open && (
        <SearchBarLocationDropdown
          value={location}
          focusOnOpen
          onChange={setLocation}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export const KeyboardNavigationAndEscape: Story = {
  render: () => <FocusHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open location' });

    await userEvent.click(trigger);
    const nashville = canvas.getByRole('option', { name: 'NASHVILLE' });
    await expect(nashville).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    const denver = canvas.getByRole('option', { name: 'DENVER' });
    await expect(denver).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const SwitchingSectionPreservesNewFocus: Story = {
  render: () => <FocusHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open location' }));
    await expect(canvas.getByRole('option', { name: 'NASHVILLE' })).toHaveFocus();

    const otherSection = canvas.getByRole('button', { name: 'Other section' });
    await userEvent.click(otherSection);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(otherSection).toHaveFocus();
  },
};
