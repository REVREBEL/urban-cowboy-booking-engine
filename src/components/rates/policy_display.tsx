import React from "react";

/** Reusable display for a rate's already-resolved cancellation policy.
 * Pass the authoritative Mews-derived text where available.
 */
export interface PolicyDisplayProps {
  text: string;
  className?: string;
  label?: string;
}

export const PolicyDisplay: React.FC<PolicyDisplayProps> = ({
  text,
  className = "",
  label = "Cancellation policy",
}) => {
  if (!text.trim()) return null;
  return (
    <div className={className} aria-label={label} data-policy-display>
      {text}
    </div>
  );
};

export default PolicyDisplay;
