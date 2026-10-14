import type { TourIcon as TourIconName } from '@/journey/tour';
import { TourIcon } from './TourIcon';
import { Button } from '@/components/ui/button';

/** Photo hotspot uses bundled Cowboy amenity SVGs, never Lovable-hosted images. */
export function FeatureFocus({ count, icon, title, active, onSelect }: {
  count: number; icon: TourIconName; title: string; active: boolean; onSelect: () => void;
}) {
  return (
    <Button type="button" variant="transparent" colorScheme="lake-forest" size="xsmall" style={{padding:0,backgroundColor:"transparent",borderRadius:0,display:"block",width:"calc(var(--ff-size) + var(--ff-sq) * 0.6)",height:"var(--ff-size)",fontWeight:400}} className={`j-focus ${active ? 'is-active' : ''}`} aria-pressed={active}
      aria-label={`${String(count).padStart(2, '0')} ${title}`} title={title} onClick={onSelect}>
      <span className="j-focus-medallion" aria-hidden="true"><TourIcon name={icon} className="size-10" /></span>
      <span className="j-focus-actions" aria-hidden="true">
        <span className="j-focus-square j-focus-count">{String(count).padStart(2, '0')}</span>
        <span className="j-focus-square">{active ? '−' : '+'}</span>
      </span>
    </Button>
  );
}
