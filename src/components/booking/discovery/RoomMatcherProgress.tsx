type MatcherProgressProps = {
  step: 1 | 2 | 3;
};

const STEPS = [
  { step: 1 as const, label: "The Travelers" },
  { step: 2 as const, label: "The Focus" },
  { step: 3 as const, label: "Your Curated Matches" },
];

export function MatcherProgress({ step }: MatcherProgressProps) {
  return (
    <div className="border-b border-alpine-linen bg-alpine-linen/40 px-4 py-3.5">
      <div
        className="mx-auto flex max-w-[1000px] items-center justify-between text-xs font-mono text-smoke-fade"
        aria-label={"Step " + step + " of 3"}
      >
        {STEPS.map((item, index) => {
          const complete = step >= item.step;
          const active = step === item.step;
          const resultStep = item.step === 3;

          return (
            <div key={item.step} className="contents">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    complete
                      ? resultStep && active
                        ? "bg-lake-forest text-white"
                        : "bg-cowboy-umber text-white"
                      : "bg-alpine-linen text-smoke-fade",
                  ].join(" ")}
                >
                  {item.step}
                </span>
                <span
                  className={[
                    "hidden whitespace-nowrap sm:inline",
                    active
                      ? resultStep
                        ? "font-bold text-lake-forest"
                        : "font-bold text-smoke"
                      : "",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </div>

              {index < STEPS.length - 1 ? (
                <div className="mx-2 h-px w-10 bg-alpine-linen sm:mx-4 sm:w-24" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
