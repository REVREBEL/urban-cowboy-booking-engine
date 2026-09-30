import { useEffect, useMemo, useState } from "react";
import { useBooking } from "../state/booking";
import { api, errorMessage } from "../lib/api";
import { fmtDate, imgUrl, money } from "../lib/format";
import { buildRooms } from "../lib/shaping";
import type { AvailabilityResponse, ShapedRate, ShapedRoom } from "../types/mews";
import { RoomDetailDrawer } from "@/components/rooms/room-detail-drawer";
import { InlineUpsell } from "@/components/booking/extras/upsell-card";
import { IconCalendar, IconUsers, IconChevron } from "@/components/icons/cowboy-icons";
import { Photo } from "@/components/media/photo";
import { MatchBenefitsCard } from "@/features/booking/components/MatchBenefitsCard";
import { t } from "../i18n";
import { buildTopMatchCopy, parseRecommendationPreferences } from "../lib/topMatch";
import { rankRecommendedRooms } from "../lib/roomMatching";
import { roomDetailTags } from "../lib/roomTags";
import { unresolvedCategoryBindings } from "../lib/roomMerchandising";
import FindYourStay from "@/features/find-your-stay/components/flows/FindYourStay";
import HelpMeChoose from "@/features/find-your-stay/components/flows/HelpMeChoose";
import type { RecommendationPreferences } from "@/types/merchandising";

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
  const [reloadKey, setReloadKey] = useState(0);
  const [discoveryView, setDiscoveryView] = useState<"explore" | "quiz" | "results">(() =>
    new URLSearchParams(window.location.search).has("interest") ? "results" : "explore",
  );
  const [recommendationSearch, setRecommendationSearch] = useState(() => window.location.search);
  // Accordéons « autres hébergements » (ouverts/fermés par clé d'hébergement).
  const [openProps, setOpenProps] = useState<string[]>([]);
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

  const recommendationPreferences = useMemo(
    () => parseRecommendationPreferences(recommendationSearch, { adults, children }),
    [recommendationSearch, adults, children],
  );
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

  const search = { checkIn, checkOut, adults, children };

  function writeRecommendationPreferences(preferences: RecommendationPreferences) {
    const query = new URLSearchParams(window.location.search);
    query.set("party", preferences.party);
    query.set("dog", preferences.dog ? "yes" : "no");
    query.set("interest", preferences.interests[0]);
    if (preferences.interests[1]) query.set("interest2", preferences.interests[1]);
    else query.delete("interest2");
    const next = "?" + query.toString();
    window.history.replaceState(null, "", window.location.pathname + next);
    setRecommendationSearch(next);
  }

  function clearRecommendationPreferences() {
    const query = new URLSearchParams(window.location.search);
    for (const key of ["party", "dog", "interest", "interest2"]) query.delete(key);
    const suffix = query.toString() ? "?" + query.toString() : "";
    window.history.replaceState(null, "", window.location.pathname + suffix);
    setRecommendationSearch(suffix);
  }

  function choose(room: ShapedRoom, rate: ShapedRate) {
    selectRoomRate(room, rate);
    setOpenRoom(null);
    goTo("guest");
  }

  // Upsell inline : un extra de l'hébergement de la 1re chambre (sinon il serait
  // refusé à la réservation, cf. produits rattachés à une config Mews).
  const inlineProduct = products.find((p) => !p.property || p.property === rooms[0]?.property) ?? null;
  const topMatchId = recommendationPreferences ? rooms[0]?.categoryId ?? null : null;
  const topMatchCopy = useMemo(() => {
    const room = rooms[0];
    if (!recommendationPreferences || !room) return null;
    return buildTopMatchCopy(room.name, recommendationPreferences, checkIn, room.merchandising);
  }, [rooms, recommendationPreferences, checkIn]);

  if (!loading && !hotelError && !error && allRooms.length > 0 && discoveryView === "explore") {
    return (
      <FindYourStay
        checkIn={checkIn}
        checkOut={checkOut}
        adults={adults}
        children={children}
        availableCount={eligibleAllRooms.length}
        onChangeSearch={() => goTo("dates")}
        onHelpMeChoose={() => setDiscoveryView("quiz")}
        onBrowseAll={() => {
          clearRecommendationPreferences();
          setDiscoveryView("results");
        }}
      />
    );
  }

  if (discoveryView === "quiz") {
    return (
      <HelpMeChoose
        initialPreferences={recommendationPreferences}
        onBack={() => setDiscoveryView("explore")}
        onSubmit={(preferences) => {
          writeRecommendationPreferences(preferences);
          setDiscoveryView("results");
        }}
      />
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

      {!loading && !hotelError && !error && rooms.length > 0 && recommendationPreferences && topMatchCopy && (
        <section className="mx-auto mt-10 max-w-4xl">
          <button
            type="button"
            onClick={() => setDiscoveryView("quiz")}
            className="mb-8 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#6B6259] hover:text-[#4E332D]"
          >
            ← Adjust Preferences
          </button>
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-3 text-umber" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-umber" />
              <span className="h-px w-8 bg-umber" />
              <span className="size-2.5 rounded-full bg-umber" />
              <span className="h-px w-8 bg-umber" />
              <span className="size-2.5 rounded-full bg-umber" />
            </div>
            <p className="font-topic text-xs uppercase tracking-[0.2em] text-umber">Step 1 of 3</p>
            <h1 className="mt-3 font-display text-4xl text-oxblood sm:text-5xl">Your Matches</h1>
          </div>

          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,2.25fr)_minmax(14rem,0.95fr)]">
            <ResultRoomPreview
              room={rooms[0]}
              imageBaseUrl={imageBaseUrl}
              topMatch
              onChoose={() => choose(rooms[0], rooms[0].rates[0])}
              onDetails={() => setOpenRoom(rooms[0])}
            />
            <MatchBenefitsCard
              room={{
                name: rooms[0].name,
                headline: topMatchCopy.interest_summary,
                blurb: topMatchCopy.top_match_reason,
                features: roomDetailTags(rooms[0].merchandising).map((tag) => ({ label: tag.label })),
              }}
              intro={`This room is our top match for ${topMatchCopy.party_summary}. You told us ${topMatchCopy.interest_summary.toLowerCase()} mattered, and ${topMatchCopy.top_match_reason}.`}
              reasons={[topMatchCopy.benefit_1, topMatchCopy.benefit_3]}
              reasonHeadings={[
                "Your Choices, Reflected",
                `Even Better in ${topMatchCopy.season_label.charAt(0).toUpperCase()}${topMatchCopy.season_label.slice(1)}`,
              ]}
              compact
            />
          </div>

          {inlineProduct && (
            <div className="mt-5">
              <InlineUpsell
                product={inlineProduct}
                added={productIds.includes(inlineProduct.id)}
                onToggle={() => toggleProduct(inlineProduct.id)}
              />
            </div>
          )}

          {rooms.length > 1 && (
            <div className="mt-12">
              <h2 className="font-display text-2xl text-oxblood sm:text-3xl">Other High Matching Options</h2>
              <div className="mt-5 space-y-4">
                {rooms.slice(1, 3).map((room, index) => (
                  <ResultRoomPreview
                    key={room.categoryId}
                    room={room}
                    imageBaseUrl={imageBaseUrl}
                    imageRight={index % 2 === 1}
                    onChoose={() => choose(room, room.rates[0])}
                    onDetails={() => setOpenRoom(room)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!loading && !hotelError && !error && rooms.length > 0 && !recommendationPreferences && (
        <div className="mt-5 space-y-4">
          {rooms.slice(0, 3).map((room, index) => (
            <div key={room.categoryId} className="space-y-4">
              <ResultRoomPreview
                room={room}
                imageBaseUrl={imageBaseUrl}
                topMatch={room.categoryId === topMatchId}
                onChoose={() => choose(room, room.rates[0])}
                onDetails={() => setOpenRoom(room)}
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
                        <ResultRoomPreview
                          key={room.categoryId}
                          room={room}
                          imageBaseUrl={imageBaseUrl}
                          onChoose={() => choose(room, room.rates[0])}
                          onDetails={() => setOpenRoom(room)}
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
        <RoomDetailDrawer
          room={openRoom}
          imageBaseUrl={imageBaseUrl}
          search={search}
          nightsCount={nightsCount}
          tags={roomDetailTags(openRoom.merchandising)}
          onClose={() => setOpenRoom(null)}
          onSelectRate={(rate) => choose(openRoom, rate)}
        />
      )}
    </div>
  );
}

function ResultRoomPreview({
  room,
  imageBaseUrl,
  topMatch = false,
  imageRight = false,
  onChoose,
  onDetails,
}: {
  room: ShapedRoom;
  imageBaseUrl: string;
  topMatch?: boolean;
  imageRight?: boolean;
  onChoose: () => void;
  onDetails: () => void;
}) {
  const rate = room.rates[0];
  const currency = rate?.currency ?? "USD";
  const nightlyRate = rate?.perNightGross ?? room.fromGross;
  const tags = roomDetailTags(room.merchandising);

  return (
    <article
      className={`overflow-hidden rounded-xl2 border bg-white shadow-card ${
        topMatch ? "h-full min-h-[310px] border-teal-deep" : "border-ink/10"
      }`}
    >
      <div className={`grid h-full ${topMatch ? "sm:grid-cols-[minmax(14rem,48%)_1fr]" : "sm:grid-cols-[minmax(13rem,48%)_1fr]"}`}>
        <div className={`relative bg-sand ${topMatch ? "min-h-72 sm:min-h-full" : "min-h-56 sm:min-h-64"} ${imageRight ? "sm:order-2" : ""}`}>
          <Photo
            src={imgUrl(imageBaseUrl, room.imageIds[0], topMatch ? 1000 : 760)}
            alt={room.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className={`flex min-w-0 flex-col p-5 ${topMatch ? "sm:p-4" : "sm:p-5"}`}>
          <p className="font-topic text-[11px] uppercase tracking-[0.18em] text-umber">
            {room.property || "Catskills"}
          </p>
          <h2 className={`mt-2 font-display leading-[0.95] text-oxblood ${topMatch ? "text-3xl" : "text-2xl"}`}>
            {room.name}
          </h2>

          {room.description && (
            <p className={`${topMatch ? "line-clamp-6 text-xs" : "line-clamp-4 text-sm"} mt-4 leading-relaxed text-ink/65`}>
              {room.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {room.capacity > 0 && (
              <span className="rounded-full border border-umber/35 px-2.5 py-1 font-topic text-[10px] uppercase tracking-wide text-umber">
                Sleeps {room.capacity}
              </span>
            )}
            {tags.slice(0, topMatch ? 5 : 4).map((tag) => (
              <span
                key={tag.key}
                className="rounded-full border border-umber/35 px-2.5 py-1 font-topic text-[10px] uppercase tracking-wide text-umber"
              >
                {tag.label}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-7">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={onChoose} className="btn-primary">
                Select Room
              </button>
              <button type="button" onClick={onDetails} className="btn-ghost">
                View Details
              </button>
            </div>
            <p className="mt-4 font-display text-xl text-oxblood">
              from {money(nightlyRate, currency)}<span className="text-sm">/night</span>
            </p>
            <p className="mt-1 text-xs text-ink/45">
              {room.availableRoomCount} available for these dates
            </p>
          </div>
        </div>
      </div>
    </article>
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
