import { useEffect, useMemo } from "react";
import { useBooking } from "@/state/booking";
import { imgUrl, money } from "@/lib/format";
import {
  groupProducts,
  upgradeRooms,
  isHotelIncludedMeal,
  mandatoryReveillon,
  isReveillonProduct,
} from "@/lib/shaping";

export function StudioExtras() {
  const {
    products,
    productIds,
    toggleProduct,
    airportTransfer,
    setAirportTransfer,
    imageBaseUrl,
    nightsCount,
    guestsCount,
    checkIn,
    checkOut,
    selectedRoom,
    selectedRate,
    availableRooms,
    grandTotal,
    currency,
    goTo,
  } = useBooking();

  useEffect(() => {
    if (!selectedRoom || !selectedRate) goTo("results");
  }, [selectedRoom, selectedRate, goTo]);

  const forcedReveillonIds = useMemo(() => {
    const property = selectedRoom?.property ?? null;
    return new Set(
      [
        mandatoryReveillon(products, property, "noel", checkIn, checkOut),
        mandatoryReveillon(products, property, "sylvestre", checkIn, checkOut),
      ]
        .filter((product): product is NonNullable<typeof product> => Boolean(product))
        .map((product) => product.id),
    );
  }, [products, selectedRoom, checkIn, checkOut]);

  const groups = useMemo(() => {
    const isHotel = selectedRoom?.property === "hotel";
    const visible = products.filter(
      (product) =>
        (!product.property || product.property === selectedRoom?.property) &&
        !(isHotel && isHotelIncludedMeal(product)) &&
        (!isReveillonProduct(product) || forcedReveillonIds.has(product.id)),
    );
    return groupProducts(visible);
  }, [products, selectedRoom, forcedReveillonIds]);

  if (!selectedRoom || !selectedRate) return null;

  const currentTotal = selectedRate.totalGross ?? selectedRoom.fromGross ?? 0;
  const back = upgradeRooms(availableRooms, selectedRoom, currentTotal).length > 0 ? "upgrade" : "guest";

  return (
    <section className="texture-linen min-h-screen pb-28 pt-10">
      <div className="booking-shell">
        <button type="button" onClick={() => goTo(back)} className="mb-7 font-woodblock text-xs uppercase tracking-widest text-[#73716D] hover:text-[#4E332D]">
          ← Back
        </button>

        <header className="mb-8 max-w-4xl">
          <p className="font-bianco text-xs font-bold uppercase tracking-[5px] text-[#9A5636]">Make It Yours</p>
          <h1 className="mt-3 font-desert text-5xl font-bold uppercase leading-none text-[#4E332D] md:text-6xl">A Little Extra Cowboy</h1>
          <p className="mt-4 font-editorial text-sm leading-6 text-[#6B6259]">
            Add the things that make arrival easier, the room sweeter, or the stay harder to leave. Only products valid for your selected property are shown.
          </p>
        </header>

        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-bianco text-[10px] font-bold uppercase tracking-[3px] text-[#9A5636]">House Service</p>
              <h2 className="mt-1 font-brothers text-2xl font-bold uppercase text-[#4E332D]">Airport Transfer Interest</h2>
            </div>
            <span className="rounded-full border border-[#4E332D]/25 px-3 py-1 font-bianco text-[9px] font-bold uppercase tracking-wider text-[#4E332D]">Requested after booking</span>
          </div>
          <button
            type="button"
            onClick={() => setAirportTransfer(!airportTransfer)}
            aria-pressed={airportTransfer}
            className={"flex w-full items-start gap-4 rounded-[20px] border-2 p-5 text-left transition " + (airportTransfer ? "border-[#0E301A] bg-[#0E301A] text-[#FAF9F9]" : "border-[#4E332D]/35 bg-[#FAF9F9] text-[#4E332D] hover:border-[#4E332D]")}
          >
            <span className={"grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs " + (airportTransfer ? "border-[#F2AAA9] bg-[#F2AAA9] text-[#0E301A]" : "border-[#4E332D]")}>
              {airportTransfer ? "✓" : ""}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block font-brothers text-lg font-bold uppercase">Tell Me About Airport Transfer</strong>
              <span className={"mt-1 block font-editorial text-xs leading-5 " + (airportTransfer ? "text-[#FAF9F9]/70" : "text-[#6B6259]")}>
                This is an interest flag, not a charge. It stays outside the Mews reservation total and can trigger the follow-up workflow after booking.
              </span>
            </span>
          </button>
        </section>

        {groups.length > 0 ? (
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.key}>
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#4E332D]/15 pb-3">
                  <h2 className="font-desert text-3xl font-bold uppercase text-[#4E332D]">{group.label}</h2>
                  <span className="font-bianco text-[10px] font-bold uppercase tracking-wider text-[#73716D]">
                    {group.items.length} option{group.items.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((product, index) => {
                    const selected = productIds.includes(product.id) || forcedReveillonIds.has(product.id);
                    const locked = forcedReveillonIds.has(product.id);
                    const image = product.imageId ? imgUrl(imageBaseUrl, product.imageId, 700) : null;
                    const themes = [
                      "border-[#4E332D] bg-[#FAF9F9] text-[#4E332D]",
                      "border-[#0E301A] bg-[#0E301A] text-[#FAF9F9]",
                      "border-[#9A5636] bg-[#9A5636] text-[#F4E1C7]",
                    ];
                    const theme = themes[index % themes.length];

                    return (
                      <article key={product.id} className={"flex min-h-[390px] flex-col overflow-hidden rounded-[24px] border-2 shadow-sm " + theme + (selected ? " ring-2 ring-[#F2AAA9] ring-offset-2 ring-offset-[#EBE8E0]" : "")}>
                        <div className="relative h-40 bg-black/5">
                          {image ? (
                            <img src={image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center font-desert text-5xl font-bold uppercase opacity-20">Cowboy</div>
                          )}
                          {locked && <span className="absolute left-3 top-3 rounded-full bg-[#F2AAA9] px-3 py-1 font-bianco text-[9px] font-bold uppercase tracking-wider text-[#0E301A]">Required for these dates</span>}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <p className="font-bianco text-[9px] font-bold uppercase tracking-[2px] opacity-55">{product.chargingMode || "Add-on"}</p>
                          <h3 className="mt-2 font-brothers text-xl font-bold uppercase leading-tight">{product.name}</h3>
                          <p className="mt-3 line-clamp-4 font-editorial text-xs leading-5 opacity-70">{product.description}</p>
                          <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                            <strong className="font-brothers text-xl">{money(product.price, product.currency)}</strong>
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => toggleProduct(product.id)}
                              className={"rounded-full px-5 py-2.5 font-bianco text-[10px] font-bold uppercase tracking-wider transition " + (selected ? "bg-[#F2AAA9] text-[#0E301A]" : "border border-current") + (locked ? " cursor-default" : " hover:-translate-y-0.5")}
                            >
                              {locked ? "Included" : selected ? "Added ✓" : "Add"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-[#4E332D] bg-[#FAF9F9] p-8 text-center">
            <h2 className="font-desert text-3xl font-bold uppercase text-[#4E332D]">Nothing extra needed</h2>
            <p className="mt-2 font-editorial text-sm text-[#6B6259]">There are no optional Mews products available for this room and these dates.</p>
          </div>
        )}

        <div className="sticky bottom-0 z-20 mt-10 flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#4E332D] bg-[#EBE8E0]/95 py-4 backdrop-blur">
          <div>
            <span className="block font-bianco text-[10px] font-bold uppercase tracking-wider text-[#73716D]">
              {productIds.length} selected · {nightsCount} night{nightsCount === 1 ? "" : "s"} · {guestsCount} guest{guestsCount === 1 ? "" : "s"}
            </span>
            <strong className="font-brothers text-2xl text-[#4E332D]">{money(grandTotal, currency)}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => goTo("payment")} className="font-bianco text-xs font-bold uppercase tracking-wider text-[#4E332D] underline underline-offset-4">Skip Extras</button>
            <button type="button" onClick={() => goTo("payment")} className="rounded-full bg-[#9A5636] px-8 py-3 font-bianco text-xs font-bold uppercase tracking-[2px] text-[#EBE8E0] hover:bg-[#783224]">
              Continue to Payment →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
