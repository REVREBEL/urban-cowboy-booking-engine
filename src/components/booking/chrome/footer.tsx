import { Fragment, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getLang, setLangAndReload, type Lang } from "@/lib/lang";
import { useBooking } from "@/state/booking";
import type {
  BookingLocationCms,
  BookingLocationCmsMap,
} from "@/types/location-cms";

type LegalLink = {
  label: string;
  url: string;
};

function resolveBookingLocation(
  locations: BookingLocationCmsMap,
  selectedRoomProperty: string | null | undefined,
  activePropertyKeys: readonly string[],
  configuredPropertyKeys: readonly string[],
): BookingLocationCms | null {
  const candidates = [
    selectedRoomProperty,
    ...activePropertyKeys,
    ...configuredPropertyKeys,
  ].filter((key): key is string => Boolean(key));

  for (const key of candidates) {
    const location = locations[key];
    if (location) return location;
  }

  const configuredLocations = Object.values(locations);
  return configuredLocations.length === 1 ? configuredLocations[0] : null;
}

export function BookingFooter() {
  const active = getLang();
  const { selectedRoom, properties, hotel } = useBooking();
  const [locations, setLocations] = useState<BookingLocationCmsMap>({});

  const languages: Array<{ code: Lang; label: string }> = [
    { code: "fr", label: "FR" },
    { code: "en", label: "EN" },
  ];

  useEffect(() => {
    let alive = true;

    api.locations().then((nextLocations) => {
      if (alive) setLocations(nextLocations);
    });

    return () => {
      alive = false;
    };
  }, []);

  const location = useMemo(
    () =>
      resolveBookingLocation(
        locations,
        selectedRoom?.property,
        properties,
        hotel?.Properties?.map((property) => property.key) ?? [],
      ),
    [locations, selectedRoom?.property, properties, hotel?.Properties],
  );

  const cityState = [location?.city, location?.state].filter(Boolean).join(", ");
  const locationName = location?.fullLocationName ?? "Urban Cowboy";

  const legalLinks = useMemo<LegalLink[]>(
    () =>
      [
        location?.privacyPolicyUrl
          ? { label: "Privacy Policy", url: location.privacyPolicyUrl }
          : null,
        location?.termsConditionsUrl
          ? { label: "Terms & Conditions", url: location.termsConditionsUrl }
          : null,
        location?.accessibilityUrl
          ? { label: "Accessibility", url: location.accessibilityUrl }
          : null,
      ].filter((link): link is LegalLink => link !== null),
    [
      location?.privacyPolicyUrl,
      location?.termsConditionsUrl,
      location?.accessibilityUrl,
    ],
  );

  return (
    <footer className="mt-20 w-full border-t-4 border-smoke bg-cowboy-umber pb-12 pt-14 text-alpine-linen">
      <div className="booking-shell">
        <div className="flex flex-col items-center justify-between gap-8 border-b border-alpine-linen/15 pb-10 text-center md:flex-row md:text-left">
          <img
            src="./assets/brand/logos/urban-cowboy.svg"
            alt="Urban Cowboy"
            className="mx-auto h-18 w-auto text-foreground select-none object-contain sm:h-28 md:mx-0"
          />

          {location ? (
            <div className="flex flex-col items-center gap-1 font-label uppercase tracking-widest text-alpine-linen/80 md:items-end">
              <span className="text-xs">{location.fullLocationName}</span>
              {cityState ? (
                <span className="text-[10px] tracking-[0.18em] text-alpine-linen/55">
                  {cityState}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center justify-between gap-5 pt-8 text-[11px] text-alpine-linen/60 sm:flex-row">
          <span>
            © <span className="font-number">{new Date().getFullYear()}</span>{" "}
            {locationName}. All rights reserved.
          </span>

          <div className="flex items-center gap-2">
            <span className="font-label text-[10px] uppercase tracking-wider">
              Language
            </span>
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => setLangAndReload(language.code)}
                aria-pressed={active === language.code}
                className={
                  "rounded-full border px-2.5 py-1 font-button text-[10px] font-bold transition " +
                  (active === language.code
                    ? "border-alpine-linen bg-alpine-linen text-cowboy-umber"
                    : "border-alpine-linen/30 text-alpine-linen/70 hover:border-alpine-linen hover:text-alpine-linen")
                }
              >
                {language.label}
              </button>
            ))}
          </div>

          {legalLinks.length > 0 ? (
            <nav
              aria-label="Legal"
              className="flex flex-wrap items-center justify-center gap-4 font-label text-[10px] uppercase tracking-wider sm:justify-end"
            >
              {legalLinks.map((link, index) => (
                <Fragment key={link.label}>
                  {index > 0 ? <span aria-hidden="true">·</span> : null}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-alpine-linen"
                  >
                    {link.label}
                  </a>
                </Fragment>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
