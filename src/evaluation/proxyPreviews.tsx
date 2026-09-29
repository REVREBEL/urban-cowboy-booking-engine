import type { ReactNode } from "react";

const ink = "#4e332d";
const copper = "#9a5636";
const linen = "#ebe8e0";
const snow = "#faf9f9";
const muted = "#767470";

function Frame({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      className="min-h-[680px] p-6 md:p-10"
      style={{ background: dark ? ink : linen, color: dark ? linen : ink }}
    >
      {children}
    </div>
  );
}

function FakePhoto({ className = "h-72" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(78,51,45,.95), rgba(14,48,26,.75)), url('/img/properties/hotel.webp') center/cover",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 p-5 text-[#ebe8e0]">
        <p className="text-[10px] uppercase tracking-[0.22em] opacity-70">Image placeholder</p>
      </div>
    </div>
  );
}

function SmallButton({
  children,
  filled = false,
}: {
  children: ReactNode;
  filled?: boolean;
}) {
  return (
    <button
      type="button"
      className="rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em]"
      style={
        filled
          ? { background: ink, color: linen, borderColor: ink }
          : { borderColor: ink, color: ink, background: "transparent" }
      }
    >
      {children}
    </button>
  );
}

export function BookingProxy({ component }: { component: string }) {
  switch (component) {
    case "BookingShell.tsx":
      return (
        <Frame>
          <div className="mx-auto max-w-6xl border border-black/10 bg-[#faf9f9]">
            <header className="flex items-center justify-between border-b border-black/10 px-6 py-5">
              <strong className="text-2xl tracking-[0.16em]">COWBOY</strong>
              <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: copper }}>
                ★ Best price guaranteed, direct
              </span>
            </header>
            <ol className="flex flex-wrap gap-2 border-b border-black/10 px-6 py-3 text-xs">
              {["1 Stay", "2 Room", "3 Details", "4 Extras", "5 Pay"].map((x, i) => (
                <li
                  key={x}
                  className="rounded-full border px-3 py-1"
                  style={i === 1 ? { background: copper, color: linen, borderColor: copper } : { borderColor: "#d4cec4" }}
                >
                  {x}
                </li>
              ))}
            </ol>
            <div className="grid min-h-[470px] place-items-center p-10 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: copper }}>Booking shell</p>
                <h2 className="mt-3 text-4xl">Page content lives here</h2>
                <p className="mx-auto mt-4 max-w-xl text-sm" style={{ color: muted }}>
                  This preview shows the header, progress treatment and page frame from the imported Booking architecture.
                </p>
              </div>
            </div>
          </div>
        </Frame>
      );

    case "DogToggleButton.tsx":
      return (
        <Frame>
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-8 py-20">
            {[false, true].map((active) => (
              <button
                key={String(active)}
                type="button"
                className="grid h-40 w-40 place-items-center border p-1"
                style={{ borderColor: "#8e456a" }}
              >
                <span
                  className="grid h-full w-full place-items-center border text-center transition"
                  style={{
                    borderColor: active ? "#8e456a" : "rgba(78,51,45,.3)",
                    background: active ? "rgba(255,255,255,.72)" : "rgba(255,255,255,.25)",
                  }}
                >
                  <span>
                    <span className="block text-5xl leading-none">♢</span>
                    <span className="mt-3 block text-[11px] uppercase tracking-[0.16em]">Dog Friendly</span>
                    <span className="mt-1 block text-[10px] opacity-50">{active ? "selected" : "default"}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Frame>
      );

    case "MatchBenefitsCard.tsx":
      return (
        <Frame>
          <aside className="mx-auto flex min-h-[620px] max-w-sm flex-col border-[1.5px] bg-white/80 p-6" style={{ borderColor: "#8e456a", color: "#8e456a" }}>
            <div className="inline-flex w-fit -rotate-2 border-2 px-5 py-2 text-sm font-black uppercase tracking-[0.14em]" style={{ borderColor: "#8e456a" }}>
              Top Match
            </div>
            <p className="mx-auto mt-10 max-w-[20rem] text-base leading-tight">
              The Walden Sunrise Bathing Suite feels made for this stay, with a private outdoor soak and the forest right outside.
            </p>
            <div className="mt-9 border-t pt-7" style={{ borderColor: "#8e456a" }}>
              <h3 className="text-2xl leading-tight">You’ll love it because …</h3>
            </div>
            <div className="mt-7 space-y-7 text-sm">
              <section>
                <h4 className="font-semibold">Made for Your Stay</h4>
                <p className="mt-2">A strong fit for two, with enough privacy to disappear for the weekend.</p>
              </section>
              <section>
                <h4 className="font-semibold">The Details You Asked For</h4>
                <p className="mt-2">Private outdoor soaking and a quieter, more elemental side of the Cowboy.</p>
              </section>
            </div>
            <div className="mt-auto flex justify-end gap-3 pt-8">
              <SmallButton>Share</SmallButton>
              <SmallButton filled>Save</SmallButton>
            </div>
          </aside>
        </Frame>
      );

    case "PreferenceIconButton.tsx":
      return (
        <Frame>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-5 md:grid-cols-3">
            {["Iconic Tub", "Outdoor Soak", "My Own Place", "Scenic Views", "Simple + Cozy"].map((label, i) => (
              <button
                key={label}
                type="button"
                className="aspect-square border p-1"
                style={{ borderColor: "#8e456a" }}
              >
                <span
                  className="flex h-full flex-col items-center justify-center gap-5 border"
                  style={{
                    borderColor: i < 2 ? "#8e456a" : "rgba(78,51,45,.25)",
                    background: i < 2 ? "rgba(255,255,255,.72)" : "rgba(255,255,255,.25)",
                  }}
                >
                  <span className="text-5xl">{["◡", "≈", "⌂", "△", "✦"][i]}</span>
                  <span className="text-xs uppercase tracking-[0.16em]">{label}</span>
                </span>
              </button>
            ))}
          </div>
        </Frame>
      );

    case "RateList.tsx":
      return (
        <Frame>
          <div className="mx-auto max-w-2xl space-y-3">
            {[
              ["Ride Easy", "Flexible cancellation", "$425", "$850 total"],
              ["Plan Ahead. Save a Little.", "Prepay for the best value", "$389", "$778 total"],
              ["Stay Awhile and Uncinch.", "5+ night offer", "$365", "$1,825 total"],
            ].map(([name, pitch, nightly, total], i) => (
              <button
                key={name}
                type="button"
                className="w-full rounded-xl border bg-[#faf9f9] p-4 text-left"
                style={{ borderColor: i === 0 ? copper : "#d8d2c9", boxShadow: i === 0 ? `0 0 0 1px ${copper}` : "none" }}
              >
                <div className="flex justify-between gap-5">
                  <div>
                    <p className="text-lg">{name}</p>
                    <p className="mt-1 text-sm" style={{ color: muted }}>{pitch}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl">{nightly}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: muted }}>per night</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t pt-3 text-xs" style={{ borderColor: "#ddd7cf" }}>
                  <span style={{ color: muted }}>Terms in plain language</span>
                  <span>{total} for 2 nights</span>
                </div>
              </button>
            ))}
          </div>
        </Frame>
      );

    case "RoomCard.tsx":
      return (
        <Frame>
          <article className="mx-auto max-w-xl border-2 bg-[#ebe8e0] p-6" style={{ borderColor: copper }}>
            <div className="relative">
              <FakePhoto className="h-72" />
              <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em]" style={{ background: copper, color: linen }}>
                Top match
              </span>
            </div>
            <div className="mt-6">
              <h3 className="text-3xl">Walden Sunrise Bathing Suite</h3>
              <div className="mt-3 flex gap-6 text-sm">
                <span><b className="text-[10px] uppercase tracking-wider">People</b> 2</span>
                <span><b className="text-[10px] uppercase tracking-wider">Bed</b> King</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: muted }}>
                A private forest-facing suite with an outdoor cedar soaking tub and room to slow all the way down.
              </p>
              <div className="mt-5 border-l-2 pl-3 text-sm" style={{ borderColor: copper }}>
                Outdoor soak · Scenic forest setting
              </div>
              <div className="mt-6 flex items-end justify-between gap-4">
                <p className="text-sm" style={{ color: muted }}>From <span className="text-xl" style={{ color: ink }}>$425</span> per night</p>
                <div className="flex gap-2"><SmallButton>Details</SmallButton><SmallButton filled>Select room</SmallButton></div>
              </div>
            </div>
          </article>
        </Frame>
      );

    case "RoomDetailsFull.tsx":
      return (
        <Frame>
          <div className="mx-auto max-w-6xl overflow-hidden border border-black/10 bg-[#faf9f9]">
            <div className="flex items-center justify-between px-5 py-4 text-[#ebe8e0]" style={{ background: "#343833" }}>
              <strong className="tracking-[0.16em]">COWBOY</strong>
              <div className="flex gap-2"><SmallButton filled>Book now</SmallButton><button className="rounded-full border border-white/30 px-3">×</button></div>
            </div>
            <div className="px-5 py-4 text-xs opacity-60">All rooms / Walden Haus / Sunrise Bathing Suite</div>
            <FakePhoto className="h-[320px]" />
            <div className="grid gap-10 p-7 lg:grid-cols-[1.4fr_.8fr]">
              <section>
                <div className="flex gap-2 text-[10px] uppercase tracking-wider">
                  {["Wifi", "21+ only", "Outdoor soak"].map(x=><span key={x} className="rounded-full border px-3 py-1">{x}</span>)}
                </div>
                <h2 className="mt-6 text-4xl">Walden Sunrise Bathing Suite</h2>
                <p className="mt-2 text-xl" style={{ color: copper }}>Bathing outside among the trees.</p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: muted }}>
                  The imported component is a full-screen room detail treatment with gallery, editorial copy, amenity grid and sticky rate panel.
                </p>
                <h3 className="mt-8 text-sm uppercase tracking-wider">Room features</h3>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">{["Outdoor Soak","King Bed","Private Deck","Rain Shower","Forest View","Wifi"].map(x=><div key={x} className="border-t pt-3">{x}</div>)}</div>
              </section>
              <aside className="h-fit border p-5">
                <h3 className="uppercase tracking-wider text-sm">Check availability</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 border-b pb-4 text-sm"><span>People<br/><b>2 max</b></span><span>Nights<br/><b>2</b></span></div>
                <div className="mt-4 space-y-3">{["Ride Easy · $425","Plan Ahead · $389"].map(x=><div key={x} className="rounded-lg border p-3">{x}</div>)}</div>
              </aside>
            </div>
          </div>
        </Frame>
      );

    case "RoomGallery.tsx":
      return (
        <Frame>
          <div className="mx-auto max-w-5xl">
            <div className="relative">
              <FakePhoto className="h-[520px]" />
              <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[#faf9f9] px-4 py-3">‹</button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#faf9f9] px-4 py-3">›</button>
              <button className="absolute right-4 top-4 rounded-full bg-[#faf9f9] px-4 py-3">↗</button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-[#faf9f9]/90 px-3 py-2">
                <span className="h-1.5 w-5 rounded-full bg-[#4e332d]" /><span className="h-1.5 w-1.5 rounded-full bg-[#4e332d]/30" /><span className="h-1.5 w-1.5 rounded-full bg-[#4e332d]/30" />
              </div>
            </div>
          </div>
        </Frame>
      );

    case "SearchBar.tsx":
      return (
        <Frame>
          <div className="mx-auto max-w-6xl py-24">
            <div className="rounded-[2rem] border bg-[#faf9f9] p-1.5 shadow-lg md:rounded-full">
              <div className="flex flex-col md:flex-row md:items-stretch">
                {[
                  ["Property","Catskills, NY"],
                  ["Check-in","Oct 16"],
                  ["Check-out","Oct 18"],
                  ["Guests","2 guests"],
                  ["Promo","Add promo"],
                ].map(([label,value],i)=>(
                  <div key={label} className="flex min-w-0 flex-1 items-center">
                    <div className="w-full px-4 py-3">
                      <span className="block text-[10px] uppercase tracking-wider" style={{ color: muted }}>{label}</span>
                      <span className="text-sm">{value}</span>
                    </div>
                    {i<4 && <span className="hidden h-9 w-px bg-black/10 md:block"/>}
                  </div>
                ))}
                <button className="rounded-full px-7 py-4 text-sm text-[#ebe8e0]" style={{ background: ink }}>⌕ Search</button>
              </div>
              <p className="px-5 py-2 text-center text-xs" style={{ color: muted }}>2 nights, 2 guests</p>
            </div>
          </div>
        </Frame>
      );

    case "StaySummary.tsx":
      return (
        <Frame>
          <aside className="mx-auto max-w-sm rounded-2xl border bg-[#faf9f9] p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider" style={{ color: muted }}>Your stay</p>
            <p className="mt-2 text-2xl">Walden Sunrise Bathing Suite</p>
            <p className="text-sm" style={{ color: muted }}>Ride Easy</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div><dt className="text-[10px] uppercase tracking-wider" style={{ color: muted }}>Dates</dt><dd>Oct 16 → Oct 18 · 2 nights</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider" style={{ color: muted }}>Party</dt><dd>2 adults · 1 dog</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider" style={{ color: muted }}>Dog</dt><dd>Pet-friendly rooms only</dd></div>
            </dl>
            <div className="mt-6 border-t pt-4 text-sm">
              <div className="flex justify-between"><span style={{ color: muted }}>$425 × 2 nights</span><span>$850</span></div>
              <div className="mt-3 flex items-baseline justify-between"><span className="text-xs uppercase tracking-wider" style={{ color: muted }}>Total before tax</span><span className="text-2xl">$850</span></div>
            </div>
          </aside>
        </Frame>
      );

    default:
      return <Frame><div className="grid min-h-[560px] place-items-center">No booking preview available.</div></Frame>;
  }
}

function UITitle({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Frame>
      <div className="mx-auto max-w-4xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: copper }}>UI primitive</p>
        <h2 className="mt-2 text-2xl">{name.replace(".tsx", "")}</h2>
        <div className="mt-8 rounded-xl border border-black/10 bg-[#faf9f9] p-7 shadow-sm">{children}</div>
      </div>
    </Frame>
  );
}

const Box = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-lg border border-black/15 bg-white px-4 py-3 ${className}`}>{children}</div>
);

export function UIProxy({ component }: { component: string }) {
  const title = component;
  const menu = <div className="w-56 rounded-lg border bg-white p-1 shadow-xl">{["Profile","Billing","Settings","Log out"].map(x=><div key={x} className="rounded px-3 py-2 text-sm hover:bg-black/5">{x}</div>)}</div>;

  switch (component) {
    case "Accordion.tsx": return <UITitle name={title}><div>{["What is included?","Can I bring my dog?","What is the cancellation policy?"].map((x,i)=><div key={x} className="border-b py-4"><div className="flex justify-between"><b>{x}</b><span>⌄</span></div>{i===0&&<p className="mt-2 text-sm opacity-60">Breakfast, sauna access and a very good excuse to turn your phone off.</p>}</div>)}</div></UITitle>;
    case "Alert.tsx": return <UITitle name={title}><Box><b>Heads up.</b><p className="mt-1 text-sm opacity-65">Your room price was refreshed from Mews before checkout.</p></Box></UITitle>;
    case "AlertDialog.tsx": return <UITitle name={title}><div className="mx-auto max-w-md rounded-xl border bg-white p-6 shadow-2xl"><h3 className="text-xl">Leave this reservation?</h3><p className="mt-2 text-sm opacity-60">Your selections will remain available while you browse.</p><div className="mt-5 flex justify-end gap-2"><SmallButton>Cancel</SmallButton><SmallButton filled>Continue</SmallButton></div></div></UITitle>;
    case "AspectRatio.tsx": return <UITitle name={title}><div className="aspect-video overflow-hidden rounded-lg"><FakePhoto className="h-full"/></div></UITitle>;
    case "Avatar.tsx": return <UITitle name={title}><div className="flex gap-4">{["GS","UC","NY"].map(x=><div key={x} className="grid h-12 w-12 place-items-center rounded-full bg-[#4e332d] text-sm text-white">{x}</div>)}</div></UITitle>;
    case "Badge.tsx": return <UITitle name={title}><div className="flex flex-wrap gap-2">{["Default","Secondary","Outline","Sold out"].map((x,i)=><span key={x} className={`rounded-full border px-3 py-1 text-xs ${i===0?"bg-[#4e332d] text-white":i===1?"bg-[#ebe8e0]":""}`}>{x}</span>)}</div></UITitle>;
    case "Breadcrumb.tsx": return <UITitle name={title}><div className="flex gap-2 text-sm"><span className="opacity-50">All rooms</span><span>/</span><span className="opacity-50">Walden</span><span>/</span><b>Sunrise Bathing Suite</b></div></UITitle>;
    case "Button.tsx": return <UITitle name={title}><div className="flex flex-wrap gap-3"><SmallButton filled>Default</SmallButton><SmallButton>Outline</SmallButton><button className="px-4 py-2 text-sm underline">Link</button><button className="rounded-lg bg-red-700 px-4 py-2 text-sm text-white">Destructive</button></div></UITitle>;
    case "Calendar.tsx": return <UITitle name={title}><div className="mx-auto max-w-sm"><div className="flex justify-between"><button>‹</button><b>October 2026</b><button>›</button></div><div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">{["S","M","T","W","T","F","S",...Array.from({length:31},(_,i)=>String(i+1))].map((x,i)=><div key={i} className={`grid aspect-square place-items-center rounded-md ${x==="16"?"bg-[#4e332d] text-white":x==="17"?"bg-[#ebe8e0]":""}`}>{x}</div>)}</div></div></UITitle>;
    case "Card.tsx": return <UITitle name={title}><Box className="max-w-md"><p className="text-xs uppercase tracking-wider opacity-50">Card title</p><h3 className="mt-2 text-xl">A simple content card</h3><p className="mt-2 text-sm opacity-60">Header, content and footer slots.</p><div className="mt-5"><SmallButton filled>Action</SmallButton></div></Box></UITitle>;
    case "Carousel.tsx": return <UITitle name={title}><div className="relative mx-auto max-w-xl"><FakePhoto className="h-72"/><button className="absolute left-3 top-1/2 rounded-full bg-white px-3 py-2">‹</button><button className="absolute right-3 top-1/2 rounded-full bg-white px-3 py-2">›</button></div></UITitle>;
    case "Chart.tsx": return <UITitle name={title}><div className="flex h-64 items-end gap-4 border-b border-l p-5">{[42,70,55,90,64,82].map((h,i)=><div key={i} className="flex-1 rounded-t" style={{height:`${h}%`,background:i===3?copper:"#4e332d"}}/>)}</div></UITitle>;
    case "Checkbox.tsx": return <UITitle name={title}><div className="space-y-3">{[true,false].map((x,i)=><label key={i} className="flex items-center gap-3"><span className={`grid h-5 w-5 place-items-center rounded border ${x?"bg-[#4e332d] text-white":""}`}>{x?"✓":""}</span><span>{x?"Breakfast included":"Accessible room"}</span></label>)}</div></UITitle>;
    case "Collapsible.tsx": return <UITitle name={title}><Box><div className="flex justify-between"><b>Stay details</b><span>⌃</span></div><p className="mt-3 text-sm opacity-60">2 nights · 2 adults · Walden Sunrise Bathing Suite</p></Box></UITitle>;
    case "Command.tsx": return <UITitle name={title}><div className="mx-auto max-w-md overflow-hidden rounded-xl border bg-white shadow-xl"><div className="border-b px-4 py-3">⌕ Search commands…</div>{["Find a room","Change dates","Add a dog","Open reservation"].map(x=><div key={x} className="px-4 py-2 text-sm hover:bg-black/5">{x}</div>)}</div></UITitle>;
    case "ContextMenu.tsx": return <UITitle name={title}><div className="flex justify-center">{menu}</div></UITitle>;
    case "Dialog.tsx": return <UITitle name={title}><div className="mx-auto max-w-lg rounded-xl border bg-white p-6 shadow-2xl"><div className="flex justify-between"><h3 className="text-xl">Room details</h3><span>×</span></div><p className="mt-3 text-sm opacity-60">A centered modal dialog with focus management in the actual primitive.</p></div></UITitle>;
    case "Drawer.tsx": return <UITitle name={title}><div className="rounded-t-2xl border bg-white p-6 shadow-2xl"><div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-black/15"/><h3 className="text-xl">Mobile room summary</h3><p className="mt-2 text-sm opacity-60">Bottom-sheet treatment.</p></div></UITitle>;
    case "DropdownMenu.tsx": return <UITitle name={title}><div className="flex justify-center">{menu}</div></UITitle>;
    case "Form.tsx": return <UITitle name={title}><div className="mx-auto max-w-md space-y-4"><label className="block"><span className="text-sm">Email</span><input className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="gary@example.com"/></label><label className="block"><span className="text-sm">Special requests</span><textarea className="mt-1 w-full rounded-lg border px-3 py-2" rows={3}/></label><SmallButton filled>Continue</SmallButton></div></UITitle>;
    case "HoverCard.tsx": return <UITitle name={title}><div className="flex flex-col items-center gap-3"><span className="underline underline-offset-4">Hover over the rate</span><Box className="w-72 shadow-xl"><b>Ride Easy</b><p className="mt-1 text-sm opacity-60">Flexible rate details appear here.</p></Box></div></UITitle>;
    case "Input.tsx": return <UITitle name={title}><input className="w-full max-w-md rounded-lg border bg-white px-3 py-2" placeholder="Promo code"/></UITitle>;
    case "InputOtp.tsx": return <UITitle name={title}><div className="flex gap-2">{["4","7","2","5","1","8"].map((x,i)=><div key={i} className="grid h-12 w-10 place-items-center rounded-md border bg-white text-lg">{x}</div>)}</div></UITitle>;
    case "Label.tsx": return <UITitle name={title}><div><label className="text-sm font-medium">Guest name</label><input className="mt-2 block w-full max-w-md rounded-lg border px-3 py-2"/></div></UITitle>;
    case "Menubar.tsx": return <UITitle name={title}><div className="flex w-fit rounded-lg border bg-white p-1 text-sm">{["Stay","Room","Extras","Help"].map(x=><button key={x} className="rounded px-4 py-2 hover:bg-black/5">{x}</button>)}</div></UITitle>;
    case "NavigationMenu.tsx": return <UITitle name={title}><nav className="flex gap-7 text-sm"><b>Rooms</b><span>Dining</span><span>Happenings</span><span>Groups</span><span>About</span></nav></UITitle>;
    case "Pagination.tsx": return <UITitle name={title}><div className="flex items-center gap-1"><button className="rounded-md border px-3 py-2">‹</button>{[1,2,3,4].map(i=><button key={i} className={`rounded-md px-3 py-2 ${i===2?"bg-[#4e332d] text-white":"border"}`}>{i}</button>)}<button className="rounded-md border px-3 py-2">›</button></div></UITitle>;
    case "Popover.tsx": return <UITitle name={title}><div className="flex flex-col items-start gap-3"><SmallButton>Guests</SmallButton><Box className="w-72 shadow-xl"><b>Guests</b><p className="mt-2 text-sm">Adults 2 &nbsp; Children 0</p></Box></div></UITitle>;
    case "Progress.tsx": return <UITitle name={title}><div className="h-3 overflow-hidden rounded-full bg-black/10"><div className="h-full w-[62%]" style={{background:copper}}/></div></UITitle>;
    case "PropertyPropertyLabel.tsx": return <UITitle name={title}><div className="flex gap-6 text-xs font-bold uppercase tracking-[0.18em]"><span style={{color:ink}}>Catskills</span><span className="opacity-40">Nashville</span><span className="opacity-40">Denver</span></div></UITitle>;
    case "RadioGroup.tsx": return <UITitle name={title}><div className="space-y-3">{["Flexible","Advance purchase","Member rate"].map((x,i)=><label key={x} className="flex gap-3"><span className="grid h-5 w-5 place-items-center rounded-full border">{i===0&&<span className="h-2.5 w-2.5 rounded-full bg-[#4e332d]"/>}</span>{x}</label>)}</div></UITitle>;
    case "Resizable.tsx": return <UITitle name={title}><div className="flex h-56 overflow-hidden rounded-lg border"><div className="flex-1 bg-white p-5">Room list</div><div className="w-2 cursor-col-resize bg-black/10"/><div className="w-1/3 bg-[#ebe8e0] p-5">Summary</div></div></UITitle>;
    case "ScrollArea.tsx": return <UITitle name={title}><div className="h-56 overflow-y-scroll rounded-lg border bg-white p-4">{Array.from({length:10},(_,i)=><p key={i} className="border-b py-3 text-sm">Scrollable booking detail {i+1}</p>)}</div></UITitle>;
    case "Select.tsx": return <UITitle name={title}><select className="w-full max-w-xs rounded-lg border bg-white px-3 py-2"><option>2 guests</option><option>3 guests</option><option>4 guests</option></select></UITitle>;
    case "Separator.tsx": return <UITitle name={title}><div><p>Above</p><div className="my-5 h-px bg-black/15"/><p>Below</p></div></UITitle>;
    case "Sheet.tsx": return <UITitle name={title}><div className="ml-auto h-[480px] w-full max-w-sm border-l bg-white p-6 shadow-2xl"><div className="flex justify-between"><h3 className="text-xl">Booking summary</h3><span>×</span></div><p className="mt-4 text-sm opacity-60">Right-side overlay panel.</p></div></UITitle>;
    case "Sidebar.tsx": return <UITitle name={title}><div className="flex h-[500px] overflow-hidden rounded-xl border"><aside className="w-64 bg-[#343833] p-4 text-[#ebe8e0]"><strong className="tracking-wider">COWBOY</strong>{["Dashboard","Reservations","Rates","Settings"].map((x,i)=><div key={x} className={`mt-3 rounded px-3 py-2 text-sm ${i===0?"bg-white/10":""}`}>{x}</div>)}</aside><main className="flex-1 bg-white p-7">Main content</main></div></UITitle>;
    case "Skeleton.tsx": return <UITitle name={title}><div className="space-y-3"><div className="h-48 animate-pulse rounded-lg bg-black/10"/><div className="h-5 w-2/3 animate-pulse rounded bg-black/10"/><div className="h-4 w-1/2 animate-pulse rounded bg-black/10"/></div></UITitle>;
    case "Slider.tsx": return <UITitle name={title}><div className="relative h-2 max-w-xl rounded-full bg-black/10"><div className="h-full w-1/2 rounded-full" style={{background:copper}}/><div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" style={{borderColor:copper}}/></div></UITitle>;
    case "Sonner.tsx": return <UITitle name={title}><div className="ml-auto max-w-sm rounded-xl border bg-white p-4 shadow-xl"><b>Room added</b><p className="mt-1 text-sm opacity-60">Walden Sunrise Bathing Suite is in your reservation.</p></div></UITitle>;
    case "Switch.tsx": return <UITitle name={title}><div className="flex items-center gap-4"><div className="relative h-6 w-11 rounded-full bg-[#4e332d]"><span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"/></div><span>Accessible room only</span></div></UITitle>;
    case "Table.tsx": return <UITitle name={title}><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="py-3">Rate</th><th>Nightly</th><th>Total</th></tr></thead><tbody>{[["Ride Easy","$425","$850"],["Plan Ahead","$389","$778"],["Member","$405","$810"]].map(r=><tr key={r[0]} className="border-b"><td className="py-3">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table></UITitle>;
    case "Tabs.tsx": return <UITitle name={title}><div><div className="flex gap-1 border-b"><button className="border-b-2 px-4 py-2" style={{borderColor:copper}}>Details</button><button className="px-4 py-2 opacity-50">Amenities</button><button className="px-4 py-2 opacity-50">Policies</button></div><p className="py-5 text-sm opacity-65">Tab content appears here.</p></div></UITitle>;
    case "Textarea.tsx": return <UITitle name={title}><textarea className="w-full max-w-xl rounded-lg border bg-white px-3 py-2" rows={5} placeholder="Anything we should know before you arrive?"/></UITitle>;
    case "Toggle.tsx": return <UITitle name={title}><button className="rounded-lg border bg-[#ebe8e0] px-4 py-2 text-sm">Dog friendly</button></UITitle>;
    case "ToggleGroup.tsx": return <UITitle name={title}><div className="inline-flex overflow-hidden rounded-lg border">{["Partner","Friends","Family","Solo"].map((x,i)=><button key={x} className={`px-4 py-2 text-sm ${i===0?"bg-[#4e332d] text-white":""}`}>{x}</button>)}</div></UITitle>;
    case "Tooltip.tsx": return <UITitle name={title}><div className="flex flex-col items-center gap-2"><SmallButton>Best price</SmallButton><div className="rounded-md bg-[#343833] px-3 py-2 text-xs text-white shadow-lg">Book direct for the lowest available rate.</div></div></UITitle>;
    default: return <UITitle name={title}><p className="text-sm opacity-60">Preview not configured.</p></UITitle>;
  }
}
