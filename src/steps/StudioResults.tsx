import { useEffect, useMemo, useState } from "react";
import { useBooking } from "@/state/booking";
import { api, errorMessage } from "@/lib/api";
import { buildRooms } from "@/lib/shaping";
import { rankRecommendedRooms } from "@/lib/roomMatching";
import { parseRecommendationPreferences } from "@/lib/topMatch";
import type { AvailabilityResponse, ShapedRate, ShapedRoom } from "@/types/mews";
import type { RecommendationPreferences } from "@/types/merchandising";
import { StudioFindYourStay } from "@/components/studio-booking/StudioFindYourStay";
import { StudioHelpMeChoose } from "@/components/studio-booking/StudioHelpMeChoose";
import { StudioMatchResults } from "@/components/studio-booking/StudioMatchResults";
import { StudioRoomCatalog } from "@/components/studio-booking/StudioRoomCatalog";
import { StudioRoomDetailModal } from "@/components/studio-booking/StudioRoomDetailModal";
import { StudioRateSelection } from "@/components/studio-booking/StudioRateSelection";

type DiscoveryView = "explore" | "quiz" | "matches" | "rooms" | "rates";

function writeRecommendationPreferences(preferences: RecommendationPreferences) {
  const query = new URLSearchParams(window.location.search);
  query.set("party", preferences.party);
  query.set("dog", preferences.dog ? "yes" : "no");
  query.set("interest", preferences.interests[0]);
  if (preferences.interests[1]) query.set("interest2", preferences.interests[1]);
  else query.delete("interest2");
  window.history.replaceState(null, "", window.location.pathname + "?" + query.toString());
}

export function StudioResults() {
  const {
    hotel,
    hotelError,
    reloadHotel,
    imageBaseUrl,
    checkIn,
    checkOut,
    adults,
    children,
    infants,
    voucherCode,
    properties,
    nightsCount,
    selectRoomRate,
    setAvailableRooms,
    goTo,
  } = useBooking();

  const initialPreferences = useMemo(
    () => parseRecommendationPreferences(window.location.search, { adults, children }),
    [adults, children],
  );

  const [view, setView] = useState<DiscoveryView>(initialPreferences ? "matches" : "explore");
  const [preferences, setPreferences] = useState<RecommendationPreferences | null>(initialPreferences);
  const [pendingRoom, setPendingRoom] = useState<ShapedRoom | null>(null);
  const [modalRoom, setModalRoom] = useState<ShapedRoom | null>(null);
  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!checkIn || !checkOut) goTo("dates");
  }, [checkIn, checkOut, goTo]);

  useEffect(() => {
    if (!hotel) {
      if (hotelError) setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);
    setError(null);
    api
      .availability({
        checkIn,
        checkOut,
        adults,
        children,
        infants,
        voucherCode,
        currencyCode: hotel.DefaultCurrencyCode,
      })
      .then((response) => {
        if (alive) setData(response);
      })
      .catch((reason) => {
        if (alive) setError(errorMessage(reason));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [checkIn, checkOut, adults, children, infants, voucherCode, hotel, hotelError, reloadKey]);

  const allRooms = useMemo(() => (data ? buildRooms(data, hotel) : []), [data, hotel]);

  const dogRequested = preferences?.dog === true;

  const rankedRooms = useMemo(
    () =>
      rankRecommendedRooms(allRooms, preferences, {
        children,
        infants,
        dogRequested,
      }).filter((room) => !room.property || properties.includes(room.property)),
    [allRooms, preferences, children, infants, dogRequested, properties],
  );

  const browseRooms = useMemo(
    () =>
      rankRecommendedRooms(allRooms, null, {
        children,
        infants,
        dogRequested,
      }).filter((room) => !room.property || properties.includes(room.property)),
    [allRooms, children, infants, dogRequested, properties],
  );

  useEffect(() => {
    setAvailableRooms(browseRooms);
  }, [browseRooms, setAvailableRooms]);

  function openRates(room: ShapedRoom) {
    setPendingRoom(room);
    setModalRoom(null);
    setView("rates");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectRate(rate: ShapedRate) {
    if (!pendingRoom) return;
    selectRoomRate(pendingRoom, rate);
    goTo("guest");
  }

  function submitPreferences(next: RecommendationPreferences) {
    writeRecommendationPreferences(next);
    setPreferences(next);
    setView("matches");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading && !hotelError) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#EBE8E0]">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-[#9A5636]/25 border-t-[#9A5636]" />
          <p className="mt-4 font-editorial text-sm text-[#4E332D]/60">Checking live room availability…</p>
        </div>
      </div>
    );
  }

  if (hotelError || error) {
    return (
      <div className="grid min-h-[60vh] place-items-center bg-[#EBE8E0] px-5">
        <div className="max-w-lg rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-8 text-center">
          <h1 className="font-desert text-3xl font-bold uppercase text-[#4E332D]">We couldn&apos;t load availability</h1>
          <p className="mt-3 font-editorial text-sm text-[#6B6259]">{error || "The hotel connection is unavailable right now."}</p>
          <button
            type="button"
            onClick={hotelError ? reloadHotel : () => setReloadKey((value) => value + 1)}
            className="mt-6 rounded-full bg-[#4E332D] px-6 py-3 font-bianco text-xs font-bold uppercase tracking-widest text-[#EBE8E0]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (view === "quiz") {
    return (
      <StudioHelpMeChoose
        initialPreferences={preferences}
        onBack={() => setView("explore")}
        onSubmit={submitPreferences}
      />
    );
  }

  if (view === "matches" && preferences) {
    return (
      <>
        <StudioMatchResults
          rooms={rankedRooms}
          preferences={preferences}
          checkIn={checkIn}
          imageBaseUrl={imageBaseUrl}
          totalAvailable={browseRooms.length}
          onBack={() => setView("quiz")}
          onBrowseAll={() => setView("rooms")}
          onSelectRoom={openRates}
          onOpenRoomDetails={setModalRoom}
        />
        <StudioRoomDetailModal room={modalRoom} imageBaseUrl={imageBaseUrl} onClose={() => setModalRoom(null)} onProceedToRates={openRates} />
      </>
    );
  }

  if (view === "rooms") {
    return (
      <>
        <StudioRoomCatalog
          rooms={browseRooms}
          imageBaseUrl={imageBaseUrl}
          checkIn={checkIn}
          checkOut={checkOut}
          adults={adults}
          onBackToSearch={() => goTo("dates")}
          onHelpMeChoose={() => setView("quiz")}
          onSelectRoom={openRates}
          onOpenRoomDetails={setModalRoom}
        />
        <StudioRoomDetailModal room={modalRoom} imageBaseUrl={imageBaseUrl} onClose={() => setModalRoom(null)} onProceedToRates={openRates} />
      </>
    );
  }

  if (view === "rates" && pendingRoom) {
    return (
      <StudioRateSelection
        room={pendingRoom}
        imageBaseUrl={imageBaseUrl}
        nights={nightsCount}
        onBack={() => setView(preferences ? "matches" : "rooms")}
        onSelectRate={selectRate}
      />
    );
  }

  return (
    <StudioFindYourStay
      checkIn={checkIn}
      checkOut={checkOut}
      nights={nightsCount}
      adults={adults}
      children={children}
      availableCount={browseRooms.length}
      onChangeSearch={() => goTo("dates")}
      onHelpMeChoose={() => setView("quiz")}
      onBrowseAll={() => setView("rooms")}
    />
  );
}
