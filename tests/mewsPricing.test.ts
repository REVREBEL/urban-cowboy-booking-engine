import assert from "node:assert/strict";
import test from "node:test";
import { money } from "../src/lib/format.ts";
import { buildRooms } from "../src/lib/shaping.ts";
import type { AvailabilityResponse, HotelConfig } from "../src/types/mews.ts";
import { normalizeAmount } from "../worker/mews/_lib.ts";
import { shapeReservationPriceResponse } from "../worker/mews/reservation-price.ts";

test("normalizes Mews gross, net, and tax amounts without counting zero-tax net lines as tax", () => {
  const amount = normalizeAmount(
    {
      Currency: "USD",
      GrossValue: 411.54,
      NetValue: 380,
      Breakdown: {
        Items: [
          { TaxRateCode: "NY-SALES", NetValue: 350, TaxValue: 31.54 },
          { TaxRateCode: null, NetValue: 30, TaxValue: 0 },
        ],
      },
    },
    "USD",
  );

  assert.deepEqual(amount, {
    currency: "USD",
    gross: 411.54,
    net: 380,
    taxTotal: 31.54,
    taxes: [{ taxRateCode: "NY-SALES", value: 31.54 }],
  });
});

test("shapes reservations/price and aggregates repeated product rows", () => {
  const result = shapeReservationPriceResponse(
    {
      ReservationPrice: [
        {
          Identifier: "selected",
          TotalAmount: {
            Currency: "USD",
            GrossValue: 823.08,
            NetValue: 760,
            Breakdown: {
              Items: [{ TaxRateCode: "NY", NetValue: 760, TaxValue: 63.08 }],
            },
          },
          AmountToChargeOnConfirmation: {
            Currency: "USD",
            GrossValue: 411.54,
            NetValue: 380,
            Breakdown: {
              Items: [{ TaxRateCode: "NY", NetValue: 380, TaxValue: 31.54 }],
            },
          },
          ProductOrderPrices: [
            {
              ProductId: "breakfast",
              TotalAmount: {
                Currency: "USD",
                GrossValue: 25,
                NetValue: 23,
                Breakdown: {
                  Items: [{ TaxRateCode: "NY", NetValue: 23, TaxValue: 2 }],
                },
              },
            },
            {
              ProductId: "breakfast",
              TotalAmount: {
                Currency: "USD",
                GrossValue: 25,
                NetValue: 23,
                Breakdown: {
                  Items: [{ TaxRateCode: "NY", NetValue: 23, TaxValue: 2 }],
                },
              },
            },
          ],
        },
      ],
    },
    "USD",
  );

  assert.equal(result?.total?.gross, 823.08);
  assert.equal(result?.amountToChargeOnConfirmation?.gross, 411.54);
  assert.deepEqual(result?.productOrderPrices, [
    {
      productId: "breakfast",
      total: {
        currency: "USD",
        gross: 50,
        net: 46,
        taxTotal: 4,
        taxes: [{ taxRateCode: "NY", value: 4 }],
      },
    },
  ]);
});

test("accepts a valid final quote when Mews has no confirmation charge", () => {
  const result = shapeReservationPriceResponse(
    {
      ReservationPrice: [
        {
          TotalAmount: {
            Currency: "USD",
            GrossValue: 500,
            NetValue: 450,
            Breakdown: {
              Items: [{ TaxRateCode: "NY", NetValue: 450, TaxValue: 50 }],
            },
          },
          AmountToChargeOnConfirmation: null,
          ProductOrderPrices: [],
        },
      ],
    },
    "USD",
  );

  assert.equal(result?.total?.gross, 500);
  assert.equal(result?.amountToChargeOnConfirmation, null);
});

test("buildRooms preserves USD net, tax, and settlement metadata", () => {
  const availability: AvailabilityResponse = {
    RateGroups: [
      {
        Id: "group-1",
        SettlementType: "Automatic",
        SettlementAction: "ChargeCreditCard",
        SettlementTrigger: "Confirmation",
        SettlementOffset: "P0M0DT0H0M0S",
        SettlementValue: 0.5,
        SettlementFlatValue: null,
        SettlementCurrencyCode: "USD",
        SettlementMaximumTimeUnits: null,
      },
    ],
    Rates: [
      {
        Id: "rate-1",
        RateGroupId: "group-1",
        Name: { "en-US": "Best Available Rate" },
        Description: { "en-US": "Flexible rate" },
        IsPrivate: false,
      },
    ],
    RoomCategoryAvailabilities: [
      {
        RoomCategoryId: "room-1",
        AvailableRoomCount: 2,
        RoomOccupancyAvailabilities: [
          {
            AdultCount: 2,
            ChildCount: 0,
            OccupancyData: [],
            Pricing: [
              {
                RateId: "rate-1",
                Price: {
                  TotalAmount: {
                    USD: {
                      GrossValue: 823.08,
                      NetValue: 760,
                      TaxValues: [{ TaxRateCode: "NY", Value: 63.08 }],
                    },
                  },
                  AverageAmountPerTimeUnit: {
                    USD: {
                      GrossValue: 411.54,
                      NetValue: 380,
                      TaxValues: [{ TaxRateCode: "NY", Value: 31.54 }],
                    },
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  };

  const hotel: HotelConfig = {
    ImageBaseUrl: "",
    Id: "hotel-1",
    Name: { "en-US": "Urban Cowboy" },
    Description: null,
    DefaultCurrencyCode: "USD",
    RoomCategories: [
      {
        Id: "room-1",
        Name: { "en-US": "Alpine Suite" },
        Description: null,
        ImageIds: [],
        NormalBedCount: 1,
        ExtraBedCount: 0,
        SpaceType: "Room",
      },
    ],
    Products: [],
    PaymentGateway: null,
  };

  const [room] = buildRooms(availability, hotel, "en-US");
  const [rate] = room.rates;

  assert.equal(rate.currency, "USD");
  assert.equal(rate.totalGross, 823.08);
  assert.equal(rate.totalNet, 760);
  assert.equal(rate.totalTax, 63.08);
  assert.equal(rate.perNightGross, 411.54);
  assert.equal(rate.settlement.trigger, "Confirmation");
  assert.equal(rate.settlement.value, 0.5);
});

test("money formatter uses the requested currency instead of EUR", () => {
  const formatted = money(411.54, "USD");
  assert.match(formatted, /411[.,]54/);
  assert.doesNotMatch(formatted, /€/);
});
