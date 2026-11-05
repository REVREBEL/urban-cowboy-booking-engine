import assert from "node:assert/strict";
import test from "node:test";
import { violations } from "../scripts/check-control-contract.mjs";

const check = (source: string) => violations("src/journey/example.tsx", source);

test("shared Button allows behavior props and placement utilities", () => {
  const source = `import { Button } from "@/components/ui/Button";
export function Example() {
  return <Button type="button" variant="outline" colorScheme="alpine-linen" size="small"
    className="w-full shrink-0 self-end" disabled onClick={() => {}}>Continue</Button>;
}`;
  assert.deepEqual(check(source), []);
});

test("shared Button rejects local visual styles and arbitrary presentation classes", () => {
  const source = `import { Button } from "@/components/ui/Button";
export function Example() {
  return <Button className="rounded-full tracking-[0.2em] w-full bg-red-500" style={{ opacity: 1 }}>Continue</Button>;
}`;
  const result = check(source);
  assert.deepEqual(result.map(x => [x.kind, x.value]), [
    ["class", "rounded-full"],
    ["class", "tracking-[0.2em]"],
    ["class", "bg-red-500"],
    ["style", "{ opacity: 1 }"],
  ]);
});

test("PillButton and Pill also reject opaque prop spreads and dynamic style classes", () => {
  const source = `import { PillButton, Pill } from "@/components/ui/Pill";
export function Example(props) {
  return <><PillButton {...props}>Book</PillButton><Pill className={props.classes}>Label</Pill></>;
}`;
  assert.deepEqual(check(source).map(x => x.kind), ["spread", "dynamic-class"]);
});

test("Button imported under a local alias is protected", () => {
  const source = `import { Button as Control } from "@/components/ui/Button";
export const Example = () => <Control className="rounded-full">Book</Control>;`;
  assert.deepEqual(check(source).map(x => x.value), ["rounded-full"]);
});

test("appearance rules do not prohibit wrappers or noncontrol icon styling", () => {
  const source = `import { Button } from "@/components/ui/Button";
export const Example = () => <div className="rounded-full p-2">
  <Button icon={<span className="size-4" style={{ opacity: 1 }} />} size="small">Book</Button>
</div>;`;
  assert.deepEqual(check(source), []);
});
