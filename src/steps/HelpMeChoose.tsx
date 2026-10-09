import type { RecommendationPreferences } from "@/types/find-your-stay";
import { HelpMeChooseModal } from "@/components/booking/discovery/HelpMeChooseModal";

export type HelpMeChooseProps = {
  initialPreferences?: RecommendationPreferences;
  onBack: () => void;
  onSubmit: (preferences: RecommendationPreferences) => void;
};

export default function HelpMeChoose({
  initialPreferences,
  onBack,
  onSubmit,
}: HelpMeChooseProps) {
  return (
    <HelpMeChooseModal
      isOpen
      initialPreferences={initialPreferences}
      onClose={onBack}
      onSubmit={onSubmit}
    />
  );
}
