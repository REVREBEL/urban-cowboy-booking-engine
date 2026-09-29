import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { StayCriteria } from "./matching";
import type { PartyType, PreferenceId, RateId } from "./rooms";

export type GuestDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

export type BookingState = {
  stay: StayCriteria;
  party: PartyType | null;
  preferences: PreferenceId[];
  roomId: string | null;
  rateId: RateId | null;
  guest: GuestDetails;
  addonIds: string[];
  termsAccepted: boolean;
  confirmationCode: string | null;
  /** True when the guest asked us to help them choose on the room step. */
  helpOpen: boolean;
};

function isoPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const initialState: BookingState = {
  stay: {
    arrival: isoPlus(14),
    departure: isoPlus(16),
    adults: 2,
    children: 0,
    pets: false,
    accessible: false,
  },
  party: null,
  preferences: [],
  roomId: null,
  rateId: null,
  guest: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  },
  addonIds: [],
  termsAccepted: false,
  confirmationCode: null,
  helpOpen: false,
};

function makeConfirmationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `UC-${code}`;
}

type BookingContextValue = {
  booking: BookingState;
  setStay: (stay: Partial<StayCriteria>) => void;
  setParty: (party: PartyType | null) => void;
  togglePreference: (id: PreferenceId) => void;
  setPreferences: (ids: PreferenceId[]) => void;
  clearPreferences: () => void;
  setHelpOpen: (open: boolean) => void;
  selectRoom: (roomId: string | null) => void;
  selectRate: (roomId: string, rateId: RateId) => void;
  setGuest: (guest: Partial<GuestDetails>) => void;
  toggleAddon: (id: string) => void;
  setTermsAccepted: (accepted: boolean) => void;
  confirmBooking: () => string;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(initialState);

  const value = useMemo<BookingContextValue>(
    () => ({
      booking,
      setStay: (stay) =>
        setBooking((prev) => ({ ...prev, stay: { ...prev.stay, ...stay } })),
      setParty: (party) => setBooking((prev) => ({ ...prev, party })),
      togglePreference: (id) =>
        setBooking((prev) => {
          if (prev.preferences.includes(id)) {
            return {
              ...prev,
              preferences: prev.preferences.filter((pref) => pref !== id),
            };
          }
          // Up to two picks: adding a third drops the oldest.
          const next = [...prev.preferences, id].slice(-2);
          return { ...prev, preferences: next };
        }),
      setPreferences: (ids) =>
        setBooking((prev) => ({ ...prev, preferences: ids.slice(0, 2) })),
      clearPreferences: () => setBooking((prev) => ({ ...prev, preferences: [] })),
      setHelpOpen: (open) => setBooking((prev) => ({ ...prev, helpOpen: open })),
      selectRoom: (roomId) => setBooking((prev) => ({ ...prev, roomId })),
      selectRate: (roomId, rateId) =>
        setBooking((prev) => ({ ...prev, roomId, rateId })),
      setGuest: (guest) =>
        setBooking((prev) => ({ ...prev, guest: { ...prev.guest, ...guest } })),
      toggleAddon: (id) =>
        setBooking((prev) => ({
          ...prev,
          addonIds: prev.addonIds.includes(id)
            ? prev.addonIds.filter((addonId) => addonId !== id)
            : [...prev.addonIds, id],
        })),
      setTermsAccepted: (accepted) =>
        setBooking((prev) => ({ ...prev, termsAccepted: accepted })),
      confirmBooking: () => {
        const code = makeConfirmationCode();
        setBooking((prev) => ({ ...prev, confirmationCode: code }));
        return code;
      },
    }),
    [booking],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return context;
}
