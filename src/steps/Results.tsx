import { useEffect, useMemo, useState } from "react";
import { useBooking } from "../state/booking";
import { api, errorMessage } from "../lib/api";
import { fmtDate, imgUrl } from "../lib/format";
import { buildRooms } from "../lib/shaping";
import type { AvailabilityResponse, ShapedRate, ShapedRoom } from "../types/mews";
import { InlineUpsell } from "@/components/booking/extras/upsell-card";
import { IconCalendar, IconUsers, IconChevron } from "@/components/icons/cowboy-icons";
import { t } from "../i18n";
import { parseRecommendationPreferences } from "../lib/topMatch";
import { rankRecommendedRooms } from "../lib/roomMatching";
import { unresolvedCategoryBindings } from "../lib/roomMerchandising";
import HelpMeChoose from "./HelpMeChoose";
import { StudioFindYourStay } from "./StudioFindYourStay";
import { StudioMatchResults } from "./StudioMatchResults";
import { RoomsListCard, type RoomCardColor } from "@/components/RoomsListCard";
import { BuildingExperienceList } from "@/components/BuildingExperienceList";
import { RoomDetailModal } from "@/components/RoomDetailModal";
import type { RoomType as StudioRoomType } from "@/types";
import type { RecommendationPreferences as DiscoveryPreferences } from "../types/find-your-stay";
import type { RecommendationPreferences as MatcherPreferences } from "../types/merchandising";
import { ROOM_IMAGE_ASSETS } from "@/data/roomImagePlaceholders";
import { roomDetailTags } from "@/lib/roomTags";

function toStudioRoom(room: ShapedRoom, imageBaseUrl: string): StudioRoomType {
  const merchandising = room.merchandising;
  const tags = roomDetailTags(merchandising).map((tag) => tag.label);
  const images = room.imageIds
    .map((imageId) => imgUrl(imageBaseUrl, imageId, 1600))
    .filter((image): image is string => Boolean(image));
  const soakType: StudioRoomType["soakType"] = merchandising?.features.outdoorSoak
    ? "outdoor-cedar-tub"
    : merchandising?.features.fireplace
      ? "copper-tub-fireplace"
      : "clawfoot-window";

  return {
    id: room.categoryId,
    buildingId: room.property || "catskills",
    buildingName: room.property || "Catskills",
    name: room.name,
    eyebrow: merchandising?.family || "A distinct room experience",
    tagline: merchandising?.family || "Stay a little differently",
    description: room.description,
    longDescription: room.description,
    basePrice: room.rates[0]?.perNightGross ?? room.fromGross ?? 0,
    squareFeet: 0,
    bedType: room.normalBedCount > 1 ? `${room.normalBedCount} beds` : "1 bed",
    maxGuests: room.capacity,
    isDogFriendly: merchandising?.dogPolicy === "allowed",
    ageRestricted21: merchandising?.agePolicy === "adultsOnly21",
    soakType,
    soakHighlight: tags[0] || "Private bathing experience",
    images: images.length ? images : [ROOM_IMAGE_ASSETS.ALPINE_BATHING_SUITE],
    features: tags,
    tags,
  };
}

// The discovery UI retains the Studio label "Spaces to Gather" (`social`).
// The live merchandising catalogue predates that label and represents the same
// room-space signal as `ownPlace`; keep the UI vocabulary without changing the
// existing Mews matcher contract.
function toMatcherPreferences(preferences: DiscoveryPreferences | null): MatcherPreferences | null {
  if (!preferences) return null;
  return {
    ...preferences,
    interests: preferences.interests.map((interest) => (interest === "social" ? "ownPlace" : interest)) as MatcherPreferences["interests"],
  };
}

export function Results() {
  const {
    hotel,
    hotelError,
    reloadHotel,
    imageBaseUrl,
    products,
    checkIn,
    checkOut,
    adults,
    children,
    infants,
    voucherCode,
    properties,
    nightsCount,
    roomId,
    rateId,
    selectedRoom,
    selectRoomRate,
    hydrateSelection,
    setAvailableRooms,
    setProperties,
    toggleProduct,
    productIds,
    goTo,
  } = useBooking();

  const [data, setData] = useState<AvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRoom, setOpenRoom] = useState<ShapedRoom | null>(null);
  const [openStudioRoom, setOpenStudioRoom] = useState<StudioRoomType | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Accordéons « autres hébergements » (ouverts/fermés par clé d'hébergement).
  const [openProps, setOpenProps] = useState<string[]>([]);
  const [discoveryView, setDiscoveryView] = useState<"explore" | "quiz" | "matches" | "rooms">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("interest")
      ? "matches"
      : "explore",
  );
  const [quizPreferences, setQuizPreferences] = useState<DiscoveryPreferences | null>(null);
  const toggleProp = (key: string) =>
    setOpenProps((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  // Garde-fou : pas de dates → retour à l'écran de recherche.
  useEffect(() => {
    if (!checkIn || !checkOut) goTo("dates");
  }, [checkIn, checkOut, goTo]);

  // On interroge TOUS les hébergements (pas de filtre `properties` côté requête) :
  // le filtre est appliqué à l'affichage, ce qui permet de compter les hébergements
  // NON cochés dispos et de les proposer en teaser (bascule instantanée, sans refetch).
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
        currencyCode: hotel?.DefaultCurrencyCode,
      })
      .then((res) => alive && setData(res))
      .catch((e) => alive && setError(errorMessage(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [checkIn, checkOut, adults, children, infants, voucherCode, hotel, hotelError, reloadKey]);

  // Toutes les chambres dispos (tous hébergements), enrichies avec la couche
  // merchandising Urban Cowboy au moment du shaping.
  const allRooms = useMemo(() => (data ? buildRooms(data, hotel) : []), [data, hotel]);

  const recommendationSearch = window.location.search;
  const urlRecommendationPreferences = useMemo(
    () => parseRecommendationPreferences(recommendationSearch, { adults, children }),
    [recommendationSearch, adults, children],
  );
  const recommendationPreferences = toMatcherPreferences(quizPreferences ?? urlRecommendationPreferences);
  const dogRequested = useMemo(() => {
    const value = new URLSearchParams(recommendationSearch).get("dog");
    return value === "yes" || value === "1";
  }, [recommendationSearch]);

  // Eligibility first, then preference ranking. Dog eligibility is independent
  // from whether the guest selected an interest. When Help Me Choose was not used,
  // rankRecommendedRooms otherwise preserves the normal Mews/price order.
  const eligibleAllRooms = useMemo(
    () =>
      rankRecommendedRooms(allRooms, recommendationPreferences, {
        children,
        infants,
        dogRequested,
      }),
    [allRooms, recommendationPreferences, children, infants, dogRequested],
  );

  // Filtre d'affichage : hébergements cochés (une chambre sans property reste visible).
  const rooms = useMemo(
    () => eligibleAllRooms.filter((r) => !r.property || properties.includes(r.property)),
    [eligibleAllRooms, properties],
  );

  // During the migration to permanent RoomCategoryId bindings, surface exact IDs in
  // development without ever making the matcher itself depend on room names.
  useEffect(() => {
    if (!import.meta.env.DEV || !hotel) return;
    const unresolved = unresolvedCategoryBindings(hotel.RoomCategories);
    if (unresolved.length) {
      console.info("[room-merchandising] Add these Mews RoomCategoryId bindings:");
      console.table(unresolved);
    }
  }, [hotel]);

  // Teaser : hébergements NON cochés mais dispos sur ces dates (nom + nombre).
  const teasers = useMemo(() => {
    const labels: { key: string; label: string }[] = hotel?.Properties ?? [];
    return labels
      .filter((p) => !properties.includes(p.key))
      .map((p) => ({ ...p, count: eligibleAllRooms.filter((r) => r.property === p.key).length }))
      .filter((p) => p.count > 0);
  }, [hotel, properties, eligibleAllRooms]);

  // Aucun logement dispo dans les hébergements cochés → on ouvre AUTOMATIQUEMENT les
  // accordéons « aussi disponibles sur vos dates » (les seuls résultats à montrer).
  // Déps = longueurs (primitives) → ne se ré-exécute pas à chaque rendu, donc ne rouvre
  // pas si l'utilisateur en referme un.
  useEffect(() => {
    if (!loading && rooms.length === 0 && teasers.length > 0) {
      setOpenProps(teasers.map((tz) => tz.key));
    }
  }, [loading, rooms.length, teasers.length]);

  // Publie la liste visible pour l'étape de surclassement (upsell chambre après Guest).
  useEffect(() => {
    setAvailableRooms(rooms);
  }, [rooms, setAvailableRooms]);

  // Réhydrate la sélection depuis l'URL (lien partagé / retour arrière) — depuis
  // TOUTES les chambres, même si l'hébergement de la chambre n'est pas coché.
  useEffect(() => {
    if (!selectedRoom && roomId && eligibleAllRooms.length) {
      const room = eligibleAllRooms.find((r) => r.categoryId === roomId);
      const rate = room?.rates.find((rt) => rt.rateId === rateId) ?? room?.rates[0] ?? null;
      if (room && rate) {
        hydrateSelection(room, rate);
        // Le lien partageait une chambre d'un hébergement décoché → on l'affiche.
        if (room.property && !properties.includes(room.property)) setProperties([...properties, room.property]);
      }
    }
  }, [eligibleAllRooms, roomId, rateId, selectedRoom, hydrateSelection, properties, setProperties]);

  function choose(room: ShapedRoom, rate: ShapedRate) {
    selectRoomRate(room, rate);
    setOpenRoom(null);
    goTo("guest");
  }

  // Upsell inline : un extra de l'hébergement de la 1re chambre (sinon il serait
  // refusé à la réservation, cf. produits rattachés à une config Mews).
  const inlineProduct = products.find((p) => !p.property || p.property === rooms[0]?.property) ?? null;
  // Date search now opens the discovery choice first. The room catalogue remains
  // this component's source of truth; the discovery screens only choose whether
  // to browse it or rank it with the existing live matcher.
  if (discoveryView === "explore") {
    return (
      <StudioFindYourStay
        checkIn={checkIn}
        checkOut={checkOut}
        nights={nightsCount}
        adults={adults}
        children={children}
        infants={infants}
        availableCount={!loading && !hotelError && !error ? rooms.length : undefined}
        onChangeSearch={() => {
          setQuizPreferences(null);
          goTo("dates");
        }}
        onHelpMeChoose={() => setDiscoveryView("quiz")}
        onBrowseAll={() => {
          setQuizPreferences(null);
          setDiscoveryView("rooms");
        }}
      />
    );
  }

  if (discoveryView === "quiz") {
    return (
      <HelpMeChoose
        initialPreferences={quizPreferences ?? undefined}
        onBack={() => setDiscoveryView("explore")}
        onSubmit={(preferences) => {
          setQuizPreferences(preferences);
          setDiscoveryView("matches");
        }}
      />
    );
  }

  if (discoveryView === "matches" && !loading && !hotelError && !error && recommendationPreferences) {
    return (
      <>
        <StudioMatchResults
          rooms={rooms}
          preferences={recommendationPreferences}
          checkIn={checkIn}
          imageBaseUrl={imageBaseUrl}
          totalAvailable={eligibleAllRooms.length}
          onBack={() => setDiscoveryView("quiz")}
          onBrowseAll={() => {
            setQuizPreferences(null);
            setDiscoveryView("rooms");
          }}
          onSelectRoom={(room) => {
            const rate = room.rates[0];
            if (rate) choose(room, rate);
          }}
          onOpenRoomDetails={setOpenRoom}
        />
        {openRoom && (
          <div className="studio-room-experience">
            <RoomDetailModal
              room={toStudioRoom(openRoom, imageBaseUrl)}
              criteria={{ property: "catskills", checkIn, checkOut, nights: nightsCount, guests: adults, children: children + infants, rooms: 1 }}
              onClose={() => setOpenRoom(null)}
              onProceedToRates={() => {
                const rate = openRoom.rates[0];
                if (rate) choose(openRoom, rate);
              }}
            />
          </div>
        )}
      </>
    );
  }

  if (discoveryView === "rooms") {
    const studioCriteria = {
      property: "catskills",
      checkIn,
      checkOut,
      nights: nightsCount,
      guests: adults,
      children: children + infants,
      rooms: 1,
    };

    return (
      <div className="studio-room-experience">
        <BuildingExperienceList
          criteria={studioCriteria}
          onUpdateCriteria={() => goTo("dates")}
          onSelectRoom={setOpenStudioRoom}
          onOpenRoomDetails={setOpenStudioRoom}
          onOpenHelpMeChoose={() => setDiscoveryView("quiz")}
          onBackToSearch={() => goTo("dates")}
        />
        {openStudioRoom && (
          <RoomDetailModal
            room={openStudioRoom}
            criteria={studioCriteria}
            onClose={() => setOpenStudioRoom(null)}
            onProceedToRates={() => setOpenStudioRoom(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="booking-shell py-8">
      {/* Barre de recherche / résumé */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-ink/10 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink/80">
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar className="h-4 w-4 text-turquoise" />
            {fmtDate(checkIn)} → {fmtDate(checkOut)}
            <span className="text-ink/45">
              · {t("results.nights", { count: nightsCount })}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconUsers className="h-4 w-4 text-turquoise" />
            {t("results.adults", { count: adults })}
            {children > 0 ? `, ${t("results.children", { count: children })}` : ""}
            {infants > 0 ? `, ${t("results.infants", { count: infants })}` : ""}
          </span>
        </div>
        <button type="button" onClick={() => goTo("dates")} className="btn-link">
          {t("results.editSearch")}
        </button>
      </div>

      {!recommendationPreferences && (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-ink sm:text-3xl">
              {rooms.length > 0 ? t("results.availableCount", { count: rooms.length }) : t("results.ourAccommodations")}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/55">
              <span>{t("results.subtitle")}</span>
            </div>
          </div>
        </div>
      )}

      {/* États */}
      {loading && !hotelError && <SkeletonList />}

      {!loading && hotelError && (
        <ErrorBox message={t("hotelError.msg")} onRetry={reloadHotel} />
      )}

      {!loading && !hotelError && error && (
        <ErrorBox message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      )}

      {!loading && !hotelError && !error && allRooms.length === 0 && (
        <EmptyBox onModify={() => goTo("dates")} />
      )}

      {!loading &&
        !hotelError &&
        !error &&
        allRooms.length > 0 &&
        eligibleAllRooms.length === 0 && (
          <NoEligibleMatchBox onModify={() => goTo("dates")} />
        )}

      {!loading && !hotelError && !error && rooms.length > 0 && !recommendationPreferences && (
        <div className="mt-5 space-y-5">
          {rooms.map((room, index) => (
            <div key={room.categoryId} className="space-y-4">
              <RoomsListCard
                room={room}
                imageBaseUrl={imageBaseUrl}
                color={(["paper", "copper", "smoke", "forest"] as RoomCardColor[])[index % 4]}
                layout={index % 2 === 0 ? "left" : "right"}
                onSelectRoom={(selected) => {
                  const rate = selected.rates[0];
                  if (rate) choose(selected, rate);
                }}
                onOpenRoomDetails={setOpenRoom}
              />
              {index === 0 && inlineProduct && (
                <InlineUpsell
                  product={inlineProduct}
                  added={productIds.includes(inlineProduct.id)}
                  onToggle={() => toggleProduct(inlineProduct.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Autres hébergements dispos sur ces dates — accordéons, EN BAS. */}
      {!loading && !hotelError && !error && teasers.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-ink">{t("results.alsoAvailable")}</h2>
          <div className="mt-3 space-y-3">
            {teasers.map((x) => {
              const isOpen = openProps.includes(x.key);
              const propRooms = allRooms.filter((r) => r.property === x.key);
              return (
                <div key={x.key} className="overflow-hidden rounded-xl2 border border-ink/10 bg-white shadow-card">
                  <button
                    type="button"
                    onClick={() => toggleProp(x.key)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-cream"
                  >
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-lg text-ink">{x.label}</span>
                      <span className="text-sm font-normal text-teal-deep/60">
                        · {t("results.availableSuffix", { count: x.count })}
                      </span>
                    </span>
                    <IconChevron
                      className={`h-5 w-5 shrink-0 text-teal-deep transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="space-y-4 border-t border-ink/10 bg-cream/40 p-4">
                      {propRooms.map((room) => (
                        <RoomsListCard
                          key={room.categoryId}
                          room={room}
                          imageBaseUrl={imageBaseUrl}
                          onSelectRoom={(selected) => {
                            const rate = selected.rates[0];
                            if (rate) choose(selected, rate);
                          }}
                          onOpenRoomDetails={setOpenRoom}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {openRoom && (
        <div className="studio-room-experience">
          <RoomDetailModal
            room={toStudioRoom(openRoom, imageBaseUrl)}
            criteria={{ property: "catskills", checkIn, checkOut, nights: nightsCount, guests: adults, children: children + infants, rooms: 1 }}
            onClose={() => setOpenRoom(null)}
            onProceedToRates={() => {
              const rate = openRoom.rates[0];
              if (rate) choose(openRoom, rate);
            }}
          />
        </div>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="mt-5 space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card flex animate-pulse flex-col overflow-hidden sm:flex-row">
          <div className="aspect-[4/3] w-full bg-sand sm:aspect-auto sm:w-64" />
          <div className="flex-1 space-y-3 p-5">
            <div className="h-5 w-1/3 rounded bg-sand" />
            <div className="h-3 w-3/4 rounded bg-sand/70" />
            <div className="h-3 w-2/3 rounded bg-sand/70" />
            <div className="mt-6 h-9 w-40 rounded-full bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-6 rounded-xl2 border border-red-200 bg-red-50 p-6 text-center">
      <p className="font-medium text-red-700">{message}</p>
      <button type="button" onClick={onRetry} className="btn-primary mt-4">
        {t("results.retry")}
      </button>
    </div>
  );
}

function EmptyBox({ onModify }: { onModify: () => void }) {
  return (
    <div className="mt-6 rounded-xl2 border border-ink/10 bg-white p-10 text-center shadow-card">
      <p className="font-display text-xl text-ink">{t("results.emptyTitle")}</p>
      <p className="mt-2 text-sm text-ink/60">
        {t("results.emptyBody")}
      </p>
      <button type="button" onClick={onModify} className="btn-primary mt-5">
        {t("results.editSearch")}
      </button>
    </div>
  );
}

function NoEligibleMatchBox({ onModify }: { onModify: () => void }) {
  return (
    <div className="mt-6 rounded-xl2 border border-ink/10 bg-white p-10 text-center shadow-card">
      <p className="font-display text-xl text-ink">{t("results.noEligibleTitle")}</p>
      <p className="mt-2 text-sm text-ink/60">{t("results.noEligibleBody")}</p>
      <button type="button" onClick={onModify} className="btn-primary mt-5">
        {t("results.editSearch")}
      </button>
    </div>
  );
}
