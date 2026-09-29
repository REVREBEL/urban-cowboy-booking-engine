import { IconCheck } from "./icons";
import { t } from "../i18n";

export type ProgressStep = {
  key: string;
  label: string;
};

export function StepProgress({
  steps,
  currentKey,
  onStepSelect,
}: {
  steps: ProgressStep[];
  currentKey: string | null;
  onStepSelect?: (key: string) => void;
}) {
  const found = currentKey == null ? -1 : steps.findIndex((s) => s.key === currentKey);
  const current = currentKey == null ? steps.length : Math.max(0, found);
  const isConfirmation = current >= steps.length;
  const currentLabel = isConfirmation ? t("stepProgress.confirmation") : (steps[current]?.label ?? "");

  return (
    <nav aria-label={t("stepProgress.navLabel")} className="w-full">
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate font-display text-xl leading-tight text-marine">{currentLabel}</p>
          <p className="shrink-0 text-xs font-semibold tabular-nums text-marine/45">
            {isConfirmation ? t("stepProgress.done") : `${current + 1} / ${steps.length}`}
          </p>
        </div>
        <ol className="mt-2.5 flex items-center gap-1.5">
          {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            const clickable = done && !!onStepSelect;
            return (
              <li key={s.key} className="flex-1">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onStepSelect?.(s.key)}
                  aria-current={active ? "step" : undefined}
                  aria-label={t("stepProgress.stepAria", {
                    index: i + 1,
                    total: steps.length,
                    label: s.label,
                    status: done ? "done" : active ? "active" : "",
                  })}
                  className={`flex w-full items-center py-2 ${clickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      active ? "bg-corail" : done ? "bg-marine" : "bg-marine/15"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <ol className="hidden items-center gap-2 sm:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = done && !!onStepSelect;
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepSelect?.(s.key)}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-semibold transition ${
                  active
                    ? "bg-marine text-cream"
                    : done
                      ? "text-marine hover:bg-corail/10"
                      : "text-ink/35"
                } ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${
                    active
                      ? "bg-corail text-marine"
                      : done
                        ? "bg-marine text-white"
                        : "border border-ink/20 text-ink/40"
                  }`}
                >
                  {done ? <IconCheck aria-hidden="true" className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <span className={`h-px flex-1 ${i < current ? "bg-marine/50" : "bg-ink/10"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
