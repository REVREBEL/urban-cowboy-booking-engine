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
  component: Arrive,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    checkIn: null, checkOut: null, setRange: () => {},
    adults: 2, children: 0, infants: 0,
    setAdults: () => {}, setChildren: () => {}, setInfants: () => {},
    accessible: false, setAccessible: () => {},
    location: "CATSKILLS", setLocation: () => {},
    promoCode: "", setPromoCode: () => {},
    activeSection: null, setActiveSection: () => {},
    dailyRates: {}, loadCalendar: async () => {},
    onMatch: () => {}, onBrowse: () => {},
    nights: 0, stories: editorialStories,
  },
  render: () => <Preview stories={editorialStories} />,
} satisfies Meta<typeof Arrive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Arrival: Story = {};
export const CalendarOpen: Story = { render: () => <Preview openCalendar stories={editorialStories} /> };
export const DatesSelected: Story = {
  render: () => <Preview initialCheckIn="2026-11-12" initialCheckOut="2026-11-15" stories={editorialStories} />,
};
export const FeaturesHidden: Story = { render: () => <Preview stories={[]} /> };
