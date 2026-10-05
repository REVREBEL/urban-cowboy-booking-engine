import { useEffect, useMemo, useState } from "react";
import { useBooking } from "../state/booking";
import { api } from "../lib/api";
import { mergeAddOnMerchandising } from "../lib/addOnMerchandising";
import {
  isHotelIncludedMeal,
  mandatoryReveillon,
  isReveillonProduct,
} from "../lib/shaping";
import { ExtrasStep } from "@/components/booking/extras/ExtrasStep";
import {
  defaultAddOnPreference,
  normalizeAddOnPreference,
} from "@/components/booking/extras/addon-smart-logic";
import type { AddonSchedulePreference } from "@/components/booking/extras/addon-types";
import type { AddOnCmsItem, MerchandisedAddOn } from "@/types/add-on-cms";
import { BOOKING_FEATURES } from "@/config/bookingFeatures";

export function Extras() {
  const [cmsAddOns, setCmsAddOns] = useState<AddOnCmsItem[]>([]);
  const {
    products,
    productIds,
    toggleProduct,
    setProductPresentation,
    addonPreferences,
    selectedAddOnDisplayByProduct,
    setAddonPreference,
    setSelectedAddOnDisplay,
    airportTransfer,
    setAirportTransfer,
    imageBaseUrl,
    nightsCount,
    guestsCount,
    checkIn,
    checkOut,
    selectedRoom,
    selectedRate,
    productsTotal,
    currency,
    goTo,
  } = useBooking();

  useEffect(() => {
    if (!selectedRoom || !selectedRate) goTo("results");
  }, [selectedRoom, selectedRate, goTo]);

  useEffect(() => {
    let alive = true;
    void api.addOns().then((items) => {
      if (alive) setCmsAddOns(items);
    });
    return () => {
      alive = false;
    };
  }, []);

  const merchandisedProducts = useMemo(
    () => mergeAddOnMerchandising(products, cmsAddOns),
    [products, cmsAddOns],
  );

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

  const visibleProducts = useMemo(() => {
    const isHotel = selectedRoom?.property === "hotel";
    return merchandisedProducts.filter(
      (product) =>
        (!product.property || product.property === selectedRoom?.property) &&
        !(isHotel && isHotelIncludedMeal(product)) &&
        (!isReveillonProduct(product) || forcedReveillonIds.has(product.id)),
    );
  }, [merchandisedProducts, selectedRoom, forcedReveillonIds]);

  const firstDisplayForProduct = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of visibleProducts) {
      if (!map.has(product.id)) map.set(product.id, product.displayId);
    }
    return map;
  }, [visibleProducts]);

  const toggleDisplayProduct = (product: MerchandisedAddOn) => {
    const selected = productIds.includes(product.id);
    const selectedDisplay =
      selectedAddOnDisplayByProduct[product.id] ??
      firstDisplayForProduct.get(product.id);

    if (selected && selectedDisplay === product.displayId) {
      toggleProduct(product.id);
      setProductPresentation(product.id, null);
      setSelectedAddOnDisplay(product.id, null);
      return;
    }

    setSelectedAddOnDisplay(product.id, product.displayId);
    setProductPresentation(product.id, {
      name: product.name,
      description: product.description,
    });

    if (!addonPreferences[product.displayId]) {
      setAddonPreference(
        product.displayId,
        defaultAddOnPreference(product, {
          checkIn,
          checkOut,
          nights: nightsCount,
        }),
      );
    }

    // Multiple Webflow cards may intentionally share one Mews Product ID for
    // demo merchandising. Changing aliases changes presentation only; the Mews
    // product remains selected exactly once.
    if (!selected) toggleProduct(product.id);
  };

  const savePreference = (
    product: MerchandisedAddOn,
    preference: AddonSchedulePreference,
  ) => {
    setAddonPreference(
      product.displayId,
      normalizeAddOnPreference(
        product,
        { checkIn, checkOut, nights: nightsCount },
        preference,
      ),
    );
    setSelectedAddOnDisplay(product.id, product.displayId);
    setProductPresentation(product.id, {
      name: product.name,
      description: product.description,
    });
    if (!productIds.includes(product.id)) toggleProduct(product.id);
  };

  if (!selectedRoom || !selectedRate) return null;

  return (
    <ExtrasStep
      products={visibleProducts}
      imageBaseUrl={imageBaseUrl}
      selectedProductIds={productIds}
      selectedDisplayByProduct={selectedAddOnDisplayByProduct}
      preferences={addonPreferences}
      lockedProductIds={forcedReveillonIds}
      nightsCount={nightsCount}
      guestsCount={guestsCount}
      checkIn={checkIn}
      checkOut={checkOut}
      roomName={selectedRoom.name}
      rateName={selectedRate.name}
      extrasTotal={productsTotal}
      currency={currency}
      airportTransfer={airportTransfer}
      showAirportTransfer={BOOKING_FEATURES.airportTransfer}
      onToggleAirportTransfer={() => setAirportTransfer(!airportTransfer)}
      onToggle={toggleDisplayProduct}
      onSavePreference={savePreference}
      onProceedToPay={() => goTo("payment")}
      onBack={() => goTo("guest")}
    />
  );
}
