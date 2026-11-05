import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { SearchBarExpanded, type ActiveDropdownSection } from "../../src/components/booking/search/SearchBarExpanded";
import { DateSearchDropdown } from "../../src/components/booking/search/DateSearchDropdown";

function Fixture() {
  const [activeSection, setActiveSection] = useState<ActiveDropdownSection>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <SearchBarExpanded
      activeSection={activeSection}
      onSectionClick={setActiveSection}
      dateTriggerRef={triggerRef}
      showSearchButton={false}
      values={{ property: "Catskills", checkInDate: "Add dates", checkOutDate: "Add dates", guests: "2 adults", promoCode: "Add promo" }}
      dropdownSlot={
        <>
          {activeSection === "dates" && (
            <DateSearchDropdown
              checkIn="" checkOut="" dailyRates={{}} showQuickSelect={false}
              triggerRef={triggerRef}
              onChange={() => {}}
              onClose={() => setActiveSection(null)}
              onVisibleRangeChange={() => {}}
            />
          )}
          {activeSection === "guests" && <div role="dialog" aria-label="Guest selection" tabIndex={-1}>Guests</div>}
          {activeSection === "property" && <div role="dialog" aria-label="Property selection" tabIndex={-1}>Property</div>}
        </>
      }
    />
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
