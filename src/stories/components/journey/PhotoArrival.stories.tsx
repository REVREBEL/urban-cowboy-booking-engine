import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Arrive } from "@/journey/PhotoArrival";
import type { ActiveDropdownSection } from "@/components/booking/search/SearchBarExpanded";

type ArrivalProps = React.ComponentProps<typeof Arrive>;

function Preview({ openCalendar = false, initialCheckIn = null, initialCheckOut = null, stories = [] }: {
  openCalendar?: boolean;
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
  stories?: ArrivalProps["stories"];
}) {
  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut);
  const [activeSection, setActiveSection] = useState<ActiveDropdownSection>(openCalendar ? "dates" : null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [accessible, setAccessible] = useState(false);
  const [location, setLocation] = useState("CATSKILLS");
  const [promoCode, setPromoCode] = useState("");
  const [action, setAction] = useState<string | null>(null);
  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000))
    : 0;

  return (
    <>
      <Arrive
        checkIn={checkIn} checkOut={checkOut}
        setRange={(start, end) => { setCheckIn(start); setCheckOut(end); }}
        adults={adults} children={children} infants={infants}
        setAdults={setAdults} setChildren={setChildren} setInfants={setInfants}
        accessible={accessible} setAccessible={setAccessible}
        location={location} setLocation={setLocation}
        promoCode={promoCode} setPromoCode={setPromoCode}
        activeSection={activeSection} setActiveSection={setActiveSection}
        dailyRates={{}}
        loadCalendar={async () => { /* No Mews request in Storybook. */ }}
        onMatch={() => setAction("Match me with a room")}
        onBrowse={() => setAction("Browse every room")}
        nights={nights} stories={stories}
      />
      {action && <div role="status" className="fixed bottom-3 right-3 z-50 rounded-lg bg-paper px-4 py-2 text-sm text-smoke">
        Storybook preview: {action}
      </div>}
    </>
  );
}

const editorialStories: ArrivalProps["stories"] = [
  { title: "Disappear for a While", text: "Trade pavement for mountain air.", icon: "/assets/icons/icons-simple/hammock.svg" },
  { title: "Soak It All In", text: "Sauna, outdoor hangs and long baths.", icon: "/assets/icons/icons-simple/estonian_sauna.svg" },
  { title: "Better Together", text: "Dinner, drinks and fireside nights.", icon: "/assets/icons/icons-simple/campfire.svg" },
];

const meta = {
  title: "Journey/Arrive",
  component: Preview,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Interactive preview of the Arrive presentation component. State and callbacks are managed locally, without Mews API calls or non-serializable story arguments.",
      },
    },
  },
  argTypes: {
    openCalendar: { control: "boolean" },
    initialCheckIn: { control: "text" },
    initialCheckOut: { control: "text" },
    stories: { control: "object" },
  },
  args: {
    openCalendar: false,
    initialCheckIn: null,
    initialCheckOut: null,
    stories: editorialStories,
  },
} satisfies Meta<typeof Preview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Arrival: Story = {};
export const CalendarOpen: Story = { args: { openCalendar: true } };
export const DatesSelected: Story = {
  args: { initialCheckIn: "2026-11-12", initialCheckOut: "2026-11-15" },
};
export const FeaturesHidden: Story = { args: { stories: [] } };
