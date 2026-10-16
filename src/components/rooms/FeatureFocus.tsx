import type { TourIcon as TourIconName } from '@/journey/tour';
import { CmsAmenityIcon } from './CmsAmenityIcon';
import { Button } from '@/components/ui/Button';

/** Photo hotspot uses bundled Cowboy amenity SVGs, never Lovable-hosted images. */
export function FeatureFocus({ count, icon, iconPath, title, active, onSelect }: {
  count: number; icon: TourIconName; iconPath?: string | null; title: string; active: boolean; onSelect: () => void;
}) {
  return (
    <Button type="button" variant="transparent" colorScheme="lake-forest" size="xsmall" style={{padding:0,backgroundColor:"transparent",borderRadius:0,display:"block",width:"calc(var(--ff-size) + var(--ff-sq) * 0.6)",height:"var(--ff-size)",fontWeight:400}} className={`j-focus ${active ? 'is-active' : ''}`} aria-pressed={active}
      aria-label={`${String(count).padStart(2, '0')} ${title}`} title={title} onClick={onSelect}>
      <span className="j-focus-medallion" aria-hidden="true"><CmsAmenityIcon iconPath={iconPath} fallback={icon} className="size-10" /></span>
      <span className="j-focus-actions" aria-hidden="true">
        <span className="j-focus-square j-focus-count">{String(count).padStart(2, '0')}</span>
        <span className="j-focus-square">{active ? '−' : '+'}</span>
      </span>
    </Button>
  );
}
