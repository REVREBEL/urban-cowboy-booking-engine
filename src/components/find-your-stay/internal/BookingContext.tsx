import { createContext, useContext, useReducer, useState, type ReactNode } from 'react';
import { bookingReducer, initialBookingState } from './bookingReducer';
import type { BookingState, BookingAction, BookingView, RoomProduct } from './types';

type BookingContextValue = {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
  view: BookingView;
  setView: (v: BookingView) => void;
  viewHistory: BookingView[];
  goBack: () => void;
  drawerRoom: RoomProduct | null;
  openDrawer: (room: RoomProduct) => void;
  closeDrawer: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialBookingState);
  const [view, setViewRaw] = useState<BookingView>('availability');
  const [viewHistory, setViewHistory] = useState<BookingView[]>([]);
  const [drawerRoom, setDrawerRoom] = useState<RoomProduct | null>(null);

  function setView(next: BookingView) {
    setViewHistory((h) => [...h, view]);
    setViewRaw(next);
  }

  function goBack() {
    const history = [...viewHistory];
    const prev = history.pop();
    if (prev) {
      setViewHistory(history);
      setViewRaw(prev);
    }
  }

  function openDrawer(room: RoomProduct) {
    setDrawerRoom(room);
  }

  function closeDrawer() {
    setDrawerRoom(null);
  }

  return (
    <BookingContext.Provider
      value={{ state, dispatch, view, setView, viewHistory, goBack, drawerRoom, openDrawer, closeDrawer }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
