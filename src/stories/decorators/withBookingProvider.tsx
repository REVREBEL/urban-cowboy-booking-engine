import type { Decorator } from "@storybook/react-vite";
import { BookingProvider } from "@/state/booking";

/**
 * Opt-in Storybook decorator for components that read useBooking().
 *
 * Do not add globally: the production provider reads/writes the URL,
 * fetches hotel data, and can track cart events. Stories that need fixed,
 * network-independent data should mock the API or use a test-specific
 * provider instead.
 */
export const withBookingProvider: Decorator = (Story) => (
  <BookingProvider>
    <Story />
  </BookingProvider>
);
