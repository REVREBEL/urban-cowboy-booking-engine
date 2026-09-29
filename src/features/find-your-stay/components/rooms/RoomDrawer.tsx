import { useEffect, useRef, useState } from "react"
import type { RateOffer, RoomProduct } from "../../types"

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtMoney(value: number | null, currency = "USD") {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function calcNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 2
  return Math.max(
    1,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    ),
  )
}

function getPricing(rate: RateOffer, nights: number) {
  const pricing = rate.pricing
  return {
    nightly: pricing.nightly ?? rate.nightlyRate,
    stayTotal: pricing.accommodation,
    taxes: pricing.taxesAndFees,
    total: pricing.total,
    dueNow: pricing.dueNow,
    remaining: pricing.remainingBalance,
    currency: pricing.currency,
    nights,
  }
}

// Photo fallback pool
function getPhotos(room: RoomProduct): string[] {
  const base = room.images?.length ? room.images : []
  const fallbacks = [
    "/assets/room-photo-1.png",
    "/assets/room-photo-2.png",
    "/assets/room-photo-3.png",
    "/assets/room-photo-4.png",
  ]
  return base.length >= 4
    ? base.slice(0, 4)
    : [...base, ...fallbacks].slice(0, 4)
}

// ── Amenity icon map ──────────────────────────────────────────────────────────

const AMENITY_ICONS: {
  key: keyof RoomProduct["features"]
  label: string
  icon: string
}[] = [
  {
    key: "outdoorSoak",
    label: "Outdoor Cedar Soaking Tub",
    icon: "/assets/outdoor-cedar-soaking-tub.png",
  },
  {
    key: "indoorTub",
    label: "Copper Clawfoot Tub",
    icon: "/assets/copper-clawfoot-soaking-tub-1.svg",
  },
  {
    key: "castIronStove",
    label: "Cast Iron Wood Stove",
    icon: "/assets/cast-iron-wood-stove-1.svg",
  },
  {
    key: "heatedFloors",
    label: "Radiant Heated Floors",
    icon: "/assets/heating-element.svg",
  },
  {
    key: "fireplace",
    label: "Gas Fireplace",
    icon: "/assets/enameled-gas-fireplace-1.svg",
  },
  {
    key: "fullKitchen",
    label: "Full Kitchen",
    icon: "/assets/full-kitchen-breakfast-bar-1.svg",
  },
  { key: "wetBar", label: "Minibar", icon: "/assets/minibar-1.svg" },
  {
    key: "privateDeck",
    label: "Private Deck",
    icon: "/assets/private-deck-or-porch-1.svg",
  },
  {
    key: "wrapAroundPorch",
    label: "Wrap-Around Porch",
    icon: "/assets/private-deck-or-porch-2.svg",
  },
  {
    key: "dogFriendly",
    label: "Dog Friendly",
    icon: "/assets/dog-friendly-1.svg",
  },
  {
    key: "separateLivingRoom",
    label: "Seating Area",
    icon: "/assets/seating-area-1.svg",
  },
  { key: "den", label: "Den", icon: "/assets/seating-area-2.svg" },
  {
    key: "walkInShower",
    label: "Walk-In Shower",
    icon: "/assets/alcove-seating.svg",
  },
]

// ── Pricing Detail Panel ──────────────────────────────────────────────────────

function PricingDetail({ rate, nights }: { rate: RateOffer; nights: number }) {
  const p = getPricing(rate, nights)
  const isFullPrepay = (rate.pricing.remainingBalance ?? 0) <= 0

  const rows: [string, string][] = [
    [
      `${fmtMoney(p.nightly, p.currency)} × ${nights} night${nights !== 1 ? "s" : ""}`,
      fmtMoney(p.stayTotal, p.currency),
    ],
    ["Taxes & Fees", fmtMoney(p.taxes, p.currency)],
  ]

  return (
    <div
      className="border-t mt-0 px-5 py-5 flex flex-col gap-4"
      style={{ borderColor: "rgba(0,0,0,0.1)" }}
    >
      {/* Description */}
      {rate.description && (
        <p
          className="text-[13px] leading-relaxed"
          style={{
            fontFamily: "var(--font-lato)",
            color: "inherit",
            opacity: 0.8,
          }}
        >
          {rate.description}
        </p>
      )}

      {/* Pricing table */}
      <div
        className="flex flex-col gap-0"
        style={{ fontFamily: "var(--font-lato)", fontSize: 12 }}
      >
        {rows.map(([label, val]) => (
          <div
            key={label}
            className="flex justify-between py-[5px]"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
          >
            <span className="uppercase tracking-[1.5px] opacity-60">
              {label}
            </span>
            <span className="font-bold">{val}</span>
          </div>
        ))}
        <div
          className="flex justify-between py-[6px] mt-1"
          style={{ borderBottom: "2px solid rgba(0,0,0,0.15)" }}
        >
          <span className="uppercase tracking-[1.5px] font-bold">
            Total Stay
          </span>
          <span className="font-bold">{fmtMoney(p.total, p.currency)}</span>
        </div>
        <div className="flex justify-between py-[5px]">
          <span className="uppercase tracking-[1.5px] opacity-60">
            Due at Booking
          </span>
          <span className="font-bold">{fmtMoney(p.dueNow, p.currency)}</span>
        </div>
        {!isFullPrepay && (
          <div className="flex justify-between py-[5px]">
            <span className="uppercase tracking-[1.5px] opacity-60">
              Remaining Balance
            </span>
            <span className="font-bold">{fmtMoney(p.remaining, p.currency)}</span>
          </div>
        )}
      </div>

      {/* Cancellation */}
      <p
        className="text-[11px] tracking-wide opacity-60"
        style={{ fontFamily: "var(--font-lato)" }}
      >
        {rate.cancellationPolicy}
      </p>
    </div>
  )
}

// ── Per-variant overlay rate cards ────────────────────────────────────────────

type OverlayCardProps = {
  rate: RateOffer
  nights: number
  expanded: boolean
  onExpand: () => void
  onBook: () => void
}

function RideEasyOverlay({
  rate,
  nights,
  expanded,
  onExpand,
  onBook,
}: OverlayCardProps) {
  return (
    <div className="bg-[#e2e2e1] border-[3px] border-[#343833] rounded-[30px] p-[4px] w-full">
      <div className="bg-white border-[3px] border-[#343833] rounded-[26px] overflow-hidden">
        {/* Card face */}
        <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
          <p
            className="text-[#d65241] text-[11px] tracking-[2.5px] uppercase font-bold"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            {rate.eyebrow || "Best Flexible Rate"}
          </p>

          {/* Split headline */}
          <div className="flex items-end gap-2">
            <div
              style={{
                fontFamily:
                  "'Noto Serif Tibetan', var(--font-quattrocento), serif",
                fontWeight: 700,
                fontSize: 56,
                lineHeight: 0.88,
                color: "#343833",
                letterSpacing: -2,
                whiteSpace: "pre-line",
              }}
            >
              {"RIDE\nEASY"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-quattrocento)",
                fontWeight: 700,
                fontSize: 22,
                lineHeight: 1.1,
                color: "#343833",
                whiteSpace: "pre-line",
                paddingBottom: 4,
              }}
            >
              {"Keep\nYour\nOptions\nOpen."}
            </div>
          </div>

          {/* Price */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-quattrocento)",
                fontWeight: 700,
                fontSize: 28,
                color: "#343833",
                letterSpacing: -0.5,
              }}
            >
              ${rate.nightlyRate} Nightly
            </p>
            <p
              className="text-xs tracking-wide text-[#767470] text-right"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Excluding Taxes + Fees
            </p>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <button
              onClick={onBook}
              className="flex-1 py-3 border-[2px] border-[#343833] rounded-full text-[12px] tracking-[1.5px] uppercase text-[#343833] hover:bg-[#343833] hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-brothers)" }}
            >
              Book Rate
            </button>
            <button
              onClick={onExpand}
              className={`flex-1 py-3 border-[2px] rounded-full text-[12px] tracking-[1.5px] uppercase transition-colors ${
                expanded
                  ? "bg-[#343833] text-white border-[#343833]"
                  : "border-[#343833] text-[#343833] hover:bg-[#f5f5f5]"
              }`}
              style={{ fontFamily: "var(--font-brothers)" }}
            >
              {expanded ? "Hide Details" : "Learn More"}
            </button>
          </div>

          <p
            className="text-[11px] text-center tracking-wide text-[#767470]"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            {rate.cancellationPolicy || "Free Cancellation until May 31, 2027"}
          </p>
        </div>

        {/* Expandable details */}
        {expanded && <PricingDetail rate={rate} nights={nights} />}
      </div>
    </div>
  )
}

function SunupOverlay({
  rate,
  nights,
  expanded,
  onExpand,
  onBook,
}: OverlayCardProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ background: "#ebe8e0", borderRadius: 4 }}
    >
      <img
        src="/assets/sunup-decoration.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full"
        style={{ objectFit: "fill", opacity: 0.6 }}
      />
      <div className="relative z-10 px-6 pt-6 pb-4 flex flex-col gap-4">
        <p
          className="uppercase text-center tracking-[-0.5px] text-[15px] font-bold"
          style={{
            fontFamily: "'Noto Serif Tibetan', var(--font-quattrocento), serif",
            color: "#69253a",
          }}
        >
          {rate.eyebrow || "Room + Breakfast"}
        </p>
        <div
          className="text-center"
          style={{
            fontFamily: "var(--font-quattrocento)",
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 0.92,
            color: "#9a5636",
            letterSpacing: -3,
            whiteSpace: "pre-line",
          }}
        >
          {"SUNUP\nBEFORE THE TRAIL"}
        </div>
        <div>
          <p
            className="text-center"
            style={{
              fontFamily: "var(--font-quattrocento)",
              fontWeight: 700,
              fontSize: 26,
              color: "#9a5636",
              letterSpacing: -2,
            }}
          >
            ${rate.nightlyRate} Nightly
          </p>
          <p
            className="text-xs tracking-wide text-right"
            style={{ fontFamily: "var(--font-lato)", color: "#4e332d" }}
          >
            Excluding Taxes + Fees
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBook}
            className="flex-1 py-3 rounded-full text-[12px] tracking-[1.5px] uppercase text-[#ebe8e0] transition-opacity hover:opacity-80"
            style={{
              fontFamily: "var(--font-brothers)",
              background: "#9a5636",
            }}
          >
            Book Rate
          </button>
          <button
            onClick={onExpand}
            className="flex-1 py-3 rounded-full text-[12px] tracking-[1.5px] uppercase border-[2px] border-[#9a5636] text-[#9a5636] hover:bg-[#9a5636]/10 transition-colors"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            {expanded ? "Hide" : "Learn More"}
          </button>
        </div>
        <p
          className="text-[11px] text-center"
          style={{ fontFamily: "var(--font-lato)", color: "#69253a" }}
        >
          {rate.cancellationPolicy}
        </p>
      </div>
      {expanded && (
        <div className="relative z-10" style={{ color: "#4e332d" }}>
          <PricingDetail rate={rate} nights={nights} />
        </div>
      )}
    </div>
  )
}

function PlanAheadOverlay({
  rate,
  nights,
  expanded,
  onExpand,
  onBook,
}: OverlayCardProps) {
  return (
    <div
      className="w-full border-[4px] border-[#343833] overflow-hidden"
      style={{ background: "#f2f2f2", borderRadius: 32 }}
    >
      <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
        <div
          style={{
            fontFamily: "var(--font-league-spartan)",
            fontWeight: 700,
            fontSize: 44,
            color: "#000",
            letterSpacing: -1,
            lineHeight: 0.92,
            transform: "rotate(0.31deg)",
            whiteSpace: "pre-line",
          }}
        >
          {"plan ahead.\nsave a little."}
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-league-spartan)",
              fontWeight: 600,
              fontSize: 22,
              color: "#343833",
              letterSpacing: -0.5,
              textTransform: "uppercase",
            }}
          >
            ${rate.nightlyRate} Nightly
          </p>
          <p
            className="text-xs tracking-wide text-right text-[#767470]"
            style={{ fontFamily: "var(--font-lato)" }}
          >
            Excluding Taxes + Fees
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBook}
            className="flex-[2] py-3 rounded-full text-[12px] tracking-[1.5px] uppercase text-white hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "var(--font-brothers)",
              background: "#343833",
            }}
          >
            Commit to the Cowboy
          </button>
          <button
            onClick={onExpand}
            className="flex-1 py-3 rounded-full text-[12px] tracking-[1.5px] uppercase border-[2px] border-[#343833] text-[#343833] hover:bg-black/5 transition-colors"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
        <p
          className="text-[11px] text-center text-[#767470]"
          style={{ fontFamily: "var(--font-lato)" }}
        >
          Full Prepay. Non Refundable.
        </p>
      </div>
      {expanded && <PricingDetail rate={rate} nights={nights} />}
    </div>
  )
}

function StayAWhileOverlay({
  rate,
  nights,
  expanded,
  onExpand,
  onBook,
}: OverlayCardProps) {
  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: "#343833", color: "#ebe8e0" }}
    >
      <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
        <p
          className="uppercase tracking-[3px] text-[11px] font-bold text-center"
          style={{ fontFamily: "var(--font-bianco)", letterSpacing: 2 }}
        >
          {rate.eyebrow || "Stay 5+ Nights"}
        </p>
        <div className="h-[4px] w-full bg-[#ebe8e0]" />
        <div
          className="text-center"
          style={{
            fontFamily: "var(--font-quattrocento)",
            fontWeight: 700,
            fontSize: 44,
            color: "#fff",
            letterSpacing: -2,
            lineHeight: 0.9,
            whiteSpace: "pre-line",
          }}
        >
          {"STAY A\nWHILE &\nUNCLINCH"}
        </div>
        <div className="h-[4px] w-full bg-[#ebe8e0]" />
        <div>
          <p
            className="text-center"
            style={{
              fontFamily: "var(--font-quattrocento)",
              fontWeight: 700,
              fontSize: 24,
              color: "#ebe8e0",
              textTransform: "uppercase",
              letterSpacing: -1,
            }}
          >
            ${rate.nightlyRate} Nightly
          </p>
          <p
            className="text-xs tracking-wide text-right"
            style={{ fontFamily: "var(--font-lato)", color: "#ebe8e0" }}
          >
            Excluding Taxes + Fees
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBook}
            className="flex-1 py-3 rounded-full text-[12px] tracking-[1.5px] uppercase text-[#343833] hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "var(--font-brothers)",
              background: "#ebe8e0",
            }}
          >
            Book Rate
          </button>
          <button
            onClick={onExpand}
            className="flex-1 py-3 rounded-full text-[12px] tracking-[1.5px] uppercase border-[2px] border-[#ebe8e0] text-[#ebe8e0] hover:bg-white/10 transition-colors"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            {expanded ? "Hide" : "Learn More"}
          </button>
        </div>
        <p
          className="text-[11px] text-center text-[#ebe8e0]/60"
          style={{ fontFamily: "var(--font-lato)" }}
        >
          {rate.cancellationPolicy}
        </p>
      </div>
      {expanded && (
        <div style={{ color: "#ebe8e0" }}>
          <PricingDetail rate={rate} nights={nights} />
        </div>
      )}
    </div>
  )
}

function OutfitOverlay({
  rate,
  nights,
  expanded,
  onExpand,
  onBook,
}: OverlayCardProps) {
  return (
    <div className="w-full overflow-hidden" style={{ background: "#0e301a" }}>
      <div className="px-6 pt-6 pb-2 flex flex-col gap-4">
        <p
          className="text-center text-xl"
          style={{ fontFamily: "var(--font-fineday)", color: "#ebe8e0" }}
        >
          {rate.eyebrow || "book direct & save"}
        </p>
        <div
          className="text-center"
          style={{
            fontFamily: "var(--font-league-gothic)",
            fontWeight: 400,
            fontSize: 62,
            color: "#f2aaa9",
            letterSpacing: 5,
            lineHeight: 0.9,
            textTransform: "uppercase",
            whiteSpace: "pre-line",
          }}
        >
          {"OUTFIT\nYOUR TRIP"}
        </div>
        <p
          className="text-center text-lg"
          style={{ fontFamily: "var(--font-fineday)", color: "#ebe8e0" }}
        >
          member rate
        </p>
        <div>
          <p
            className="text-center"
            style={{
              fontFamily: "var(--font-league-gothic)",
              fontWeight: 400,
              fontSize: 28,
              color: "#f2aaa9",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            ${rate.nightlyRate} Nightly
          </p>
          <p
            className="text-xs tracking-wide text-right"
            style={{ fontFamily: "var(--font-lato)", color: "#ebe8e0" }}
          >
            Excluding Taxes + Fees
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBook}
            className="flex-1 py-3 rounded-full text-[12px] tracking-[1.5px] uppercase text-[#0e301a] hover:opacity-80 transition-opacity"
            style={{
              fontFamily: "var(--font-brothers)",
              background: "#f2aaa9",
            }}
          >
            Book Rate
          </button>
          <button
            onClick={onExpand}
            className="flex-1 py-3 rounded-full text-[12px] tracking-[1.5px] uppercase border-[2px] border-[#f2aaa9] text-[#f2aaa9] hover:bg-[#f2aaa9]/10 transition-colors"
            style={{ fontFamily: "var(--font-brothers)" }}
          >
            {expanded ? "Hide" : "Learn More"}
          </button>
        </div>
        <p
          className="text-[11px] text-center"
          style={{
            fontFamily: "var(--font-lato)",
            color: "#ebe8e0",
            opacity: 0.6,
          }}
        >
          {rate.cancellationPolicy}
        </p>
      </div>

      {/* Pink banner */}
      <div className="w-full px-6 py-3 mt-2" style={{ background: "#f2aaa9" }}>
        <p
          className="text-center text-[12px] font-bold"
          style={{
            fontFamily: "var(--font-dm-sans)",
            color: "#0e301a",
            fontVariationSettings: '"opsz" 14',
          }}
        >
          Members save 15% or more — every stay.
        </p>
      </div>

      {expanded && (
        <div style={{ color: "#ebe8e0" }}>
          <PricingDetail rate={rate} nights={nights} />
        </div>
      )}
    </div>
  )
}

function OverlayCard({
  rate,
  nights,
  expanded,
  onExpand,
  onBook,
}: OverlayCardProps) {
  const props = { rate, nights, expanded, onExpand, onBook }
  switch (rate.variant) {
    case "ride-easy":
      return <RideEasyOverlay {...props} />
    case "sunup":
      return <SunupOverlay {...props} />
    case "plan-ahead":
      return <PlanAheadOverlay {...props} />
    case "stay-a-while":
      return <StayAWhileOverlay {...props} />
    case "outfit":
      return <OutfitOverlay {...props} />
    default:
      return <RideEasyOverlay {...props} />
  }
}

// ── Main Overlay ──────────────────────────────────────────────────────────────

export type RoomDrawerProps = {
  room: RoomProduct | null;
  rates: RateOffer[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  onClose: () => void;
  onBook: (room: RoomProduct, rate: RateOffer) => void;
};

export default function RoomDrawer({
  room: drawerRoom,
  rates,
  checkIn,
  checkOut,
  adults,
  children,
  onClose,
  onBook,
}: RoomDrawerProps) {
  const [expandedRateId, setExpandedRateId] = useState<string | null>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (drawerRoom) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [drawerRoom, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = drawerRoom ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerRoom])

  if (!drawerRoom) return null

  const nights = calcNights(checkIn, checkOut)
  const photos = getPhotos(drawerRoom)
  const amenities = AMENITY_ICONS.filter(
    (a) => drawerRoom.features[a.key] === true,
  )

  // Static amenities present in every Urban Cowboy room
  const staticAmenities = [
    { label: "Pendleton Wool Robes", icon: "/assets/cowboy-robe-1.svg" },
    {
      label: "King Bed",
      icon: "/assets/king-bed-with-headboard-feature-1.svg",
    },
    { label: "Letter-Writing Desk", icon: "/assets/letter-writing-desk-1.svg" },
    { label: "WiFi Access", icon: "/assets/wifi-badge-1.svg" },
  ]
  const allAmenities = [...staticAmenities, ...amenities]

  function handleBook(rate: RateOffer) {
    onBook(drawerRoom, rate)
    onClose()
  }

  function toggleExpand(id: string) {
    setExpandedRateId((prev) => (prev === id ? null : id))
  }

  // Format date range display
  const dateDisplay =
    checkIn && checkOut
      ? (() => {
          const inD = new Date(checkIn)
          const outD = new Date(checkOut)
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ]
          return `${monthNames[inD.getMonth()]} ${inD.getDate()} – ${outD.getDate()}`
        })()
      : "Select Dates"

  const guestsDisplay = `${adults} Adult${adults !== 1 ? "s" : ""}${
    children
      ? ` · ${children} Child${children !== 1 ? "ren" : ""}`
      : ""
  }`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full-page overlay panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={drawerRoom.name}
        className="fixed inset-0 z-50 flex overflow-hidden"
        style={{ background: "#ebe8e0" }}
      >
        {/* ── LEFT: Room Detail ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="flex h-full md:flex-row flex-col">
            {/* Photo strip */}
            <div className="md:w-[220px] shrink-0 flex md:flex-col flex-row overflow-x-auto md:overflow-x-visible md:overflow-y-auto gap-1 p-1">
              {photos.map((src, i) => (
                <div
                  key={i}
                  className="shrink-0 md:w-full md:h-[200px] w-[140px] h-[100px] overflow-hidden"
                >
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = `/assets/room-photo-${i + 1}.png`
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Room content */}
            <div className="flex-1 min-w-0 px-8 py-10 md:py-12 flex flex-col gap-6 overflow-y-auto">
              {/* Experience badge */}
              <div className="flex items-center gap-3">
                <img
                  src={`/assets/room-icon-placeholder-1.svg`}
                  alt=""
                  aria-hidden="true"
                  className="h-10 w-10 opacity-70"
                />
                <p
                  className="text-sm tracking-[3px] uppercase text-[#4e332d]"
                  style={{ fontFamily: "var(--font-bianco)", fontWeight: 700 }}
                >
                  {drawerRoom.experience} Haus
                </p>
              </div>

              {/* Room name */}
              <h2
                className="leading-none"
                style={{
                  fontFamily: "var(--font-desert)",
                  fontWeight: 700,
                  fontSize: "clamp(32px, 4vw, 56px)",
                  color: "#4e332d",
                  letterSpacing: -1,
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                {drawerRoom.name}
              </h2>

              {/* Tagline */}
              <p
                className="text-lg leading-snug"
                style={{
                  fontFamily: "var(--font-bianco)",
                  fontWeight: 700,
                  color: "#4e332d",
                  maxWidth: 480,
                }}
              >
                {drawerRoom.tagline}
              </p>

              {/* Description */}
              <p
                className="text-[15px] leading-relaxed text-[#767470]"
                style={{ fontFamily: "var(--font-inter)", maxWidth: 520 }}
              >
                {drawerRoom.description}
              </p>

              {/* Room specs */}
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {drawerRoom.features.sqft && (
                  <span
                    className="text-xs tracking-widest uppercase text-[#9a5636]"
                    style={{
                      fontFamily: "var(--font-bianco)",
                      fontWeight: 700,
                    }}
                  >
                    {drawerRoom.features.sqft} sq ft
                  </span>
                )}
                {drawerRoom.features.beds && (
                  <span
                    className="text-xs tracking-widest uppercase text-[#9a5636]"
                    style={{
                      fontFamily: "var(--font-bianco)",
                      fontWeight: 700,
                    }}
                  >
                    {drawerRoom.features.beds}
                  </span>
                )}
                {drawerRoom.features.sleeps && (
                  <span
                    className="text-xs tracking-widest uppercase text-[#9a5636]"
                    style={{
                      fontFamily: "var(--font-bianco)",
                      fontWeight: 700,
                    }}
                  >
                    Sleeps {drawerRoom.features.sleeps}
                  </span>
                )}
              </div>

              {/* Amenity icon grid */}
              {allAmenities.length > 0 && (
                <div>
                  <p
                    className="text-xs tracking-[4px] uppercase text-[#4e332d] mb-4"
                    style={{ fontFamily: "var(--font-brothers)" }}
                  >
                    Top Room Amenities
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-6">
                    {allAmenities.map(({ label, icon }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-2"
                      >
                        <img
                          src={icon}
                          alt={label}
                          className="h-16 w-16 object-contain"
                        />
                        <p
                          className="text-[10px] text-center text-[#4e332d] leading-tight"
                          style={{ fontFamily: "var(--font-inter)" }}
                        >
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Rate Selection ──────────────────────────────────── */}
        <div
          ref={rightPanelRef}
          className="shrink-0 flex flex-col border-l border-[#d5cfc5] overflow-hidden"
          style={{ width: "clamp(320px, 38vw, 560px)", background: "#f5f2ed" }}
        >
          {/* Sticky header */}
          <div className="shrink-0 px-7 pt-8 pb-4 border-b border-[#d5cfc5]">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-xs tracking-[4px] uppercase text-[#4e332d] mb-1"
                  style={{ fontFamily: "var(--font-brothers)" }}
                >
                  Select a Rate
                </h3>
                <p
                  className="text-[15px] font-bold text-[#4e332d]"
                  style={{ fontFamily: "var(--font-league-spartan)" }}
                >
                  {dateDisplay}
                  {checkIn && (
                    <span className="font-normal text-[#767470] ml-2 text-[13px]">
                      · {guestsDisplay}
                    </span>
                  )}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#343833]/10 text-[#343833] hover:bg-[#343833]/20 transition-colors shrink-0 ml-4"
                aria-label="Close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1l12 12M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable rate cards */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
            {rates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <p
                  className="text-sm text-[#767470]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  No rates available for your selected dates.
                </p>
                <button
                  onClick={onClose}
                  className="text-xs tracking-widest uppercase text-[#9a5636]"
                  style={{ fontFamily: "var(--font-brothers)" }}
                >
                  Adjust Dates
                </button>
              </div>
            ) : (
              rates.map((rate) => (
                <OverlayCard
                  key={rate.id}
                  rate={rate}
                  nights={nights}
                  expanded={expandedRateId === rate.id}
                  onExpand={() => toggleExpand(rate.id)}
                  onBook={() => handleBook(rate)}
                />
              ))
            )}

            {/* Footer note */}
            <p
              className="text-[11px] text-center text-[#9a9590] px-4 pb-2"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              All rates are per night. Taxes and fees calculated at checkout.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
