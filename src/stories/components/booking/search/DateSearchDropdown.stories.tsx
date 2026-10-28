import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DateSearchDropdown } from "@/components/booking/search/DateSearchDropdown";

const meta = {
  title: "Components/Booking/Search/DateSearchDropdown",
  component: DateSearchDropdown,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    checkIn: "2026-11-05",
    checkOut: "2026-11-08",
    dailyRates: {},
    onChange: () => {},
    onClose: () => {},
    onVisibleRangeChange: () => {},
  },
  render: (args) => {
    function Preview() {
      const [range, setRange] = useState({ checkIn: args.checkIn, checkOut: args.checkOut });
      const [closed, setClosed] = useState(false);
      return <div className="mx-auto max-w-[760px] min-h-[600px]">{closed
        ? <button className="rounded border p-3" onClick={() => setClosed(false)}>Reopen date picker</button>
        : <DateSearchDropdown {...args} checkIn={range.checkIn} checkOut={range.checkOut}
            onChange={(checkIn, checkOut) => setRange({ checkIn, checkOut })}
            onClose={() => setClosed(true)} />}</div>;
    }
    return <Preview />;
  },
} satisfies Meta<typeof DateSearchDropdown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Unselected: Story = { args: { checkIn: "", checkOut: "" } };
export const ExternalActions: Story = { args: { variant: "external-actions" } };
