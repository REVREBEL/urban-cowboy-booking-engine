import { BookingProvider, useBooking } from './booking/BookingContext';
import BookingChrome from './components/BookingChrome';
import Footer from './components/Footer';
import AvailabilityCriteria from './components/AvailabilityCriteria';
import FindYourStay from './components/FindYourStay/FindYourStay';
import HelpMeChoose from './components/FindYourStay/HelpMeChoose';
import MatchResults from './components/FindYourStay/MatchResults';
import AllRoomsGrid from './components/FindYourStay/AllRoomsGrid';
import RoomDrawer from './components/FindYourStay/RoomDrawer';
import RoomDetail from './components/RoomDetail/RoomDetail';
import RateSelection from './components/RateSelection/RateSelection';
import PlaceholderStep from './components/PlaceholderStep';

function BookingRouter() {
  const { view } = useBooking();

  switch (view) {
    case 'availability':
      return <AvailabilityCriteria />;
    case 'find-your-stay':
      return <FindYourStay />;
    case 'help-me-choose':
      return <HelpMeChoose />;
    case 'match-results':
      return <MatchResults />;
    case 'all-rooms':
      return <AllRoomsGrid />;
    case 'room-detail':
      return <RoomDetail />;
    case 'rate-selection':
      return <RateSelection />;
    case 'details':
      return <PlaceholderStep title="Guest Details" />;
    case 'extras':
      return <PlaceholderStep title="Extras" />;
    case 'pay':
      return <PlaceholderStep title="Payment" />;
    default:
      return <AvailabilityCriteria />;
  }
}

export default function App() {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col">
        <BookingChrome />
        <div className="flex-1">
          <BookingRouter />
        </div>
        <Footer />
      </div>
      <RoomDrawer />
    </BookingProvider>
  );
}
