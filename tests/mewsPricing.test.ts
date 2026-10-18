import assert from "node:assert/strict";
import test from "node:test";
import { stayCoversNight } from "../src/lib/shaping.ts";
import {
  currencyAmount,
  normalizeAmount,
  shapeReservationPriceResponse,
} from "../worker/mews/_lib.ts";

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

test("selects the requested currency from a Mews multi-currency amount", () => {
  const amount = currencyAmount(
    {
      EUR: { GrossValue: 100, NetValue: 90 },
      USD: { GrossValue: 110, NetValue: 100 },
    },
    "USD",
  );

  assert.equal(amount?.currency, "USD");
  assert.equal(amount?.gross, 110);
  assert.equal(amount?.net, 100);
  assert.equal(amount?.taxTotal, 10);
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

test("rejects a final quote that lacks a usable total", () => {
  const result = shapeReservationPriceResponse(
    {
      ReservationPrice: [
        {
          TotalAmount: null,
          AmountToChargeOnConfirmation: null,
          ProductOrderPrices: [],
        },
      ],
    },
    "USD",
  );

  assert.equal(result, null);
});

test("stayCoversNight correctly evaluates night coverage and edge cases", () => {
  // Single night stay
  assert.equal(stayCoversNight("2025-12-24", "2025-12-25", 12, 24), true);
  assert.equal(stayCoversNight("2025-12-24", "2025-12-25", 12, 25), false);

  // Multi-night stay
  assert.equal(stayCoversNight("2025-12-20", "2025-12-26", 12, 24), true);
  assert.equal(stayCoversNight("2025-12-20", "2025-12-26", 12, 25), true);
  assert.equal(stayCoversNight("2025-12-20", "2025-12-26", 12, 31), false);

  // Cross-year stay
  assert.equal(stayCoversNight("2025-12-30", "2026-01-02", 12, 31), true);
  assert.equal(stayCoversNight("2025-12-30", "2026-01-02", 1, 1), true);
  assert.equal(stayCoversNight("2025-12-30", "2026-01-02", 1, 2), false);

  // Leap year Feb 29
  assert.equal(stayCoversNight("2025-02-28", "2025-03-02", 2, 29), false);
  assert.equal(stayCoversNight("2024-02-28", "2024-03-02", 2, 29), true);

  // Invalid or reverse date boundaries
  assert.equal(stayCoversNight("invalid", "2025-12-25", 12, 24), false);
  assert.equal(stayCoversNight("2025-12-25", "2025-12-24", 12, 24), false);
});
