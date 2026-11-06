import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

type PartyScenario = "couple" | "family" | "solo";

interface BookingPartyTemplateProps {
  dogRequested: boolean;
  highlightEligibility: boolean;
}

const SCENARIOS: Record<PartyScenario, { adults: number; children: number }> = {
  couple: { adults: 2, children: 0 },
  family: { adults: 2, children: 2 },
  solo: { adults: 1, children: 0 },
};

/**
 * Story-only template: verifies global toolbar changes and controlled args.
 * Does not make API calls, affect the booking cart, or represent an actual
 * room eligibility decision. Production eligibility stays in booking logic.
 */
function BookingPartyTemplate({
  dogRequested,
  highlightEligibility,
  scenario,
}: BookingPartyTemplateProps & { scenario: PartyScenario }) {
  const [, updateArgs] = useArgs<BookingPartyTemplateProps>();
  const { adults, children } = SCENARIOS[scenario];

  return (
    <section className="flex max-w-md flex-col gap-4 rounded border p-6">
      <h2 className="text-xl">Storybook booking scenario</h2>
      <p>Adults: {adults} | Children: {children}</p>
      <p>Dog requested: {dogRequested ? "Yes" : "No"}</p>
      {highlightEligibility && (
        <p className="text-sm">Room eligibility must be calculated by the production matching logic.</p>
      )}
      <button
        type="button"
        className="rounded border px-4 py-2"
        onClick={() => updateArgs({ dogRequested: !dogRequested })}
      >
        {dogRequested ? "Remove dog request" : "Add dog request"}
      </button>
    </section>
  );
}

const meta = {
  title: "Examples/Booking/Party Template",
  component: BookingPartyTemplate,
  tags: ["autodocs"],
  args: {
    dogRequested: false,
    highlightEligibility: true,
    scenario: "couple",
  },
  argTypes: {
    scenario: { control: false, table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component: "Demonstrates a data-driven template, controlled useArgs, and the global Example party toolbar. This is Storybook-only mock data, not booking API state.",
      },
    },
  },
} satisfies Meta<typeof BookingPartyTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args, context) => (
    <BookingPartyTemplate
      {...args}
      scenario={(context.globals.bookingParty as PartyScenario) || "couple"}
    />
  ),
};
