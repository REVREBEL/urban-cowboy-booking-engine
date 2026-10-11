import React, { useEffect, useRef, useState } from "react";

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = "w-10 h-6",
  ...props
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path d="M50.86 78.01l36.41-26.06c.66-.48 1.04-1.24 1.05-2.05 0-.01 0-.01 0-.01-.01-.82-.4-1.58-1.06-2.05L50.83 21.95c-.77-.55-1.78-.62-2.62-.19-.84.42-1.37 1.29-1.37 2.23v12.18l-32.71-.01c-1.39 0-2.52 1.12-2.52 2.51v22.54c-.01 1.38 1.12 2.51 2.51 2.51h32.7V75.9c0 .94.53 1.8 1.36 2.23.83.43 1.84.35 2.61-.2Z" />
  </svg>
);

export const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className = "w-5 h-5",
  ...props
}) => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm-.75 3a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 9.75z"
      clipRule="evenodd"
    />
  </svg>
);

export interface MilestoneDate {
  daysPrior: string | number;
  day: string | number;
  month: string;
}

export interface PolicyDisplayProps {
  title?: string;
  initialAmount?: string;
  remainingAmount?: string;
  freeCancelDate?: MilestoneDate;
  nonRefundableDate?: MilestoneDate;
  initialDepositTooltip?: {
    title: string;
    description: string;
  };
  remainingBalanceTooltip?: {
    title: string;
    description: string;
  };
  textColor?: string;
  accentColor?: string;
  size?: "default" | "compact";
  className?: string;
}

export const PolicyDisplay: React.FC<PolicyDisplayProps> = ({
  title = "POLICY INFORMATION",
  initialAmount = "$000.00",
  remainingAmount = "$000.00",
  freeCancelDate,
  nonRefundableDate,
  initialDepositTooltip = {
    title: "INITIAL DEPOSIT",
    description:
      "This is the amount due at booking. Once your reservation is confirmed, the hotel will charge this amount to the payment method provided.",
  },
  remainingBalanceTooltip = {
    title: "REMAINING BALANCE",
    description:
      "This is the remaining amount due for your stay. It will be charged automatically to your payment method on the applicable due date.",
  },
  textColor = "var(--foreground)",
  accentColor = "var(--color-bandana-red)",
  size = "default",
  className = "",
}) => {
  const [activeTooltip, setActiveTooltip] = useState<"initial" | "remaining" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const compact = size === "compact";

  const style = {
    "--policy-fg": textColor,
    "--policy-accent": accentColor,
  } as React.CSSProperties;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTooltip = (type: "initial" | "remaining") => {
    setActiveTooltip((current) => (current === type ? null : type));
  };

  const milestoneTile = (
    milestone: MilestoneDate | undefined,
    tone: "primary" | "accent",
    label: string,
    sublabel: string,
  ) => {
    const colorClass = tone === "accent" ? "text-(--policy-accent)" : "text-(--policy-fg)";
    const badgeClass = tone === "accent" ? "bg-(--policy-accent)" : "bg-(--policy-fg)";

    return (
      <div className="flex min-w-0 flex-col items-center">
        <div className="relative">
          <div
            className={[
              "absolute z-10 flex flex-col items-center justify-center rounded-full text-paper shadow-sm",
              badgeClass,
              compact ? "-left-4 -top-1 size-10" : "-left-6 -top-2 size-13",
            ].join(" ")}
          >
            <span className={compact ? "text-sm font-bold leading-none" : "text-xl font-bold leading-none"}>
              {milestone?.daysPrior ?? "--"}
            </span>
            <span className={compact ? "mt-0.5 text-[7px] font-bold leading-none" : "mt-0.5 text-[9px] font-bold leading-none"}>
              DAYS
            </span>
          </div>

          <div
            className={[
              "flex flex-col items-center justify-center rounded-md bg-paper shadow-sm",
              compact ? "h-15 w-16 pl-1" : "h-20 w-20 pl-2",
            ].join(" ")}
          >
            <span className={[colorClass, compact ? "text-xl" : "text-3xl", "font-bold leading-none"].join(" ")}>
              {milestone?.day ?? "--"}
            </span>
            <span className={[colorClass, compact ? "mt-1 text-xs" : "mt-1 text-lg", "font-bold uppercase leading-none"].join(" ")}>
              {milestone?.month ?? "---"}
            </span>
          </div>
        </div>

        <div className={compact ? "mt-2 text-center" : "mt-3 text-center"}>
          <p className={[colorClass, compact ? "text-[9px]" : "text-xs", "font-label font-bold uppercase leading-tight"].join(" ")}>
            {milestone ? label : "SEE TERMS"}
          </p>
          <p className={[colorClass, compact ? "text-[8px]" : "text-[10px]", "font-body leading-tight"].join(" ")}>
            {milestone ? sublabel : "Policy details below"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={containerRef}
      className={[
        "relative w-full select-none text-(--policy-fg)",
        compact ? "px-2 py-3" : "px-3 py-4 sm:px-4",
        className,
      ].join(" ")}
      style={style}
      aria-label={title}
    >
      <h2 className={[compact ? "mb-4 text-[10px]" : "mb-6 text-xs", "font-label font-bold uppercase tracking-wider"].join(" ")}>
        {title}
      </h2>

      <div className={["grid grid-cols-3 items-start text-center", compact ? "gap-1" : "gap-3"].join(" ")}>
        <div className="flex flex-col items-center">
          <div className={["flex flex-col items-center justify-center rounded-md bg-paper shadow-sm", compact ? "h-15 w-16" : "h-20 w-20"].join(" ")}>
            <span className={compact ? "font-label text-base font-bold leading-none" : "font-label text-xl font-bold leading-none"}>
              DUE
            </span>
            <span className={compact ? "mt-1 font-label text-[9px] font-bold leading-none" : "mt-1 font-label text-xs font-bold leading-none"}>
              TODAY
            </span>
          </div>
          <div className={compact ? "mt-2 text-center" : "mt-3 text-center"}>
            <p className={compact ? "font-label text-[9px] font-bold uppercase leading-tight" : "font-label text-xs font-bold uppercase leading-tight"}>
              AFTER
            </p>
            <p className={compact ? "font-label text-[9px] font-bold uppercase leading-tight" : "font-label text-xs font-bold uppercase leading-tight"}>
              CONFIRMING
            </p>
          </div>
        </div>

        {milestoneTile(freeCancelDate, "primary", "FREE CANCEL", "100% Refundable")}
        {milestoneTile(nonRefundableDate, "accent", "NON-REFUNDABLE", "Stay Locked")}
      </div>

      <div className={["h-px w-full bg-(--policy-fg)/25", compact ? "my-4" : "my-6"].join(" ")} />

      <div className={["flex items-center justify-between", compact ? "px-1" : "px-3 sm:px-5"].join(" ")}>
        <div className="relative flex min-w-0 flex-1 flex-col items-center text-center">
          <div className="flex items-center justify-center gap-1">
            <span className={compact ? "font-number text-sm font-bold" : "font-number text-base font-bold"}>
              {initialAmount}
            </span>
            <button
              type="button"
              aria-label="Initial deposit information"
              onClick={() => toggleTooltip("initial")}
              onMouseEnter={() => setActiveTooltip("initial")}
              onMouseLeave={() => setActiveTooltip(null)}
              className="inline-flex items-center justify-center rounded-full text-(--policy-fg) transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--policy-fg)/30"
            >
              <InfoIcon className={compact ? "size-3" : "size-3.5"} />
            </button>
          </div>
          <p className={compact ? "mt-1 font-label text-[8px] font-bold leading-tight" : "mt-1 font-label text-[10px] font-bold leading-tight"}>
            Initial<br />Deposit Due
          </p>

          {activeTooltip === "initial" && (
            <div className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-md border border-ash bg-paper p-3 text-left shadow-xl">
              <h3 className="font-label text-[10px] font-bold uppercase tracking-wider">
                {initialDepositTooltip.title}
              </h3>
              <p className="mt-1 font-body text-[10px] leading-relaxed">
                {initialDepositTooltip.description}
              </p>
            </div>
          )}
        </div>

        <ArrowRightIcon className={compact ? "mx-2 h-5 w-8 shrink-0" : "mx-3 h-6 w-10 shrink-0"} />

        <div className="relative flex min-w-0 flex-1 flex-col items-center text-center text-(--policy-accent)">
          <div className="flex items-center justify-center gap-1">
            <span className={compact ? "font-number text-sm font-bold" : "font-number text-base font-bold"}>
              {remainingAmount}
            </span>
            <button
              type="button"
              aria-label="Remaining balance information"
              onClick={() => toggleTooltip("remaining")}
              onMouseEnter={() => setActiveTooltip("remaining")}
              onMouseLeave={() => setActiveTooltip(null)}
              className="inline-flex items-center justify-center rounded-full transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--policy-accent)/30"
            >
              <InfoIcon className={compact ? "size-3" : "size-3.5"} />
            </button>
          </div>
          <p className={compact ? "mt-1 font-label text-[8px] font-bold leading-tight" : "mt-1 font-label text-[10px] font-bold leading-tight"}>
            Remaining<br />Deposit Due
          </p>

          {activeTooltip === "remaining" && (
            <div className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-md border border-ash bg-paper p-3 text-left text-(--policy-fg) shadow-xl">
              <h3 className="font-label text-[10px] font-bold uppercase tracking-wider">
                {remainingBalanceTooltip.title}
              </h3>
              <p className="mt-1 font-body text-[10px] leading-relaxed">
                {remainingBalanceTooltip.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PolicyDisplay;
