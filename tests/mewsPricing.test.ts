import assert from "node:assert/strict";
import test from "node:test";
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
