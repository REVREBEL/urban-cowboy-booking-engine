"use client";

import { useState } from "react";
import { DateRangePicker } from "../../src/components/forms/date-range-picker";
import { PhoneInput } from "../../src/components/forms/phone-input";
import { defineStory } from "../lib/story";

interface DateDemoProps {
  checkIn: string;
  checkOut: string;
}

function DateDemo({ checkIn, checkOut }: DateDemoProps) {
  const [range, setRange] = useState({ checkIn, checkOut });
  return (
    <div className="w-full max-w-2xl space-y-2 py-4">
      <DateRangePicker
        checkIn={range.checkIn}
        checkOut={range.checkOut}
        minDate="2026-10-01"
        onChange={(nextIn, nextOut) => setRange({ checkIn: nextIn, checkOut: nextOut })}
      />
      <p className="text-sm text-muted-foreground" role="status">
        Selected: {range.checkIn || "—"} → {range.checkOut || "—"}
      </p>
    </div>
  );
}

export const dateRangePickerStory = defineStory({
  Component: DateDemo,
  args: { initial: { checkIn: "2026-10-14", checkOut: "2026-10-17" } },
});

interface PhoneDemoProps {
  value: string;
  defaultCountry: string;
  invalid: boolean;
  required: boolean;
}

function PhoneDemo({ value, defaultCountry, invalid, required }: PhoneDemoProps) {
  const [current, setCurrent] = useState(value);
  const [valid, setValid] = useState(true);
  return (
    <div className="w-full max-w-sm space-y-2">
      <PhoneInput
        value={current}
        defaultCountry={defaultCountry}
        invalid={invalid}
        required={required}
        onChange={(e164, isValid) => { setCurrent(e164); setValid(isValid); }}
      />
      <p className="text-sm text-muted-foreground" role="status">
        {current || "—"} · {valid ? "valid E.164" : "invalid"}
      </p>
    </div>
  );
}

export const phoneInputStory = defineStory({
  Component: PhoneDemo,
  args: { initial: { value: "+12015550123", defaultCountry: "US", invalid: false, required: true } },
});

export const phoneInputInvalidStory = defineStory({
  Component: PhoneDemo,
  args: { initial: { value: "", defaultCountry: "US", invalid: true, required: true } },
});
