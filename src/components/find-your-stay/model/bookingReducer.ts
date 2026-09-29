import type { BookingState, BookingAction } from './types';

export const initialBookingState: BookingState = {
  checkIn: '',
  checkOut: '',
  adults: 2,
  children: 0,
};

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_DATES':
      return { ...state, checkIn: action.checkIn, checkOut: action.checkOut };
    case 'SET_GUESTS':
      return { ...state, adults: action.adults, children: action.children, infants: action.infants };
    case 'SET_PROMO':
      return { ...state, promoCode: action.promoCode };
    case 'SET_PREFERENCES':
      return { ...state, recommendationPreferences: action.preferences };
    case 'SELECT_ROOM':
      return { ...state, selectedRoomId: action.room.id, selectedRoom: action.room, selectedRateId: undefined, selectedRate: undefined };
    case 'SELECT_RATE':
      return { ...state, selectedRateId: action.rate.id, selectedRate: action.rate };
    case 'CLEAR_ROOM':
      return { ...state, selectedRoomId: undefined, selectedRoom: undefined, selectedRateId: undefined, selectedRate: undefined };
    case 'CLEAR_RATE':
      return { ...state, selectedRateId: undefined, selectedRate: undefined };
    case 'RESET':
      return initialBookingState;
    default:
      return state;
  }
}
