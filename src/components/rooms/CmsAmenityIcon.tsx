import { useState } from "react";
import { cmsIconUrl } from "@/lib/cmsPhotoHotspots";
import type { TourIcon as TourIconName } from "@/journey/tour";
import { TourIcon } from "./TourIcon";

/** Webflow supplies paths/filenames, while SVG bytes remain in the public assets folder. */
export function CmsAmenityIcon({ iconPath, fallback, className = "size-10" }: {
  iconPath?: string | null;
  fallback: TourIconName;
  className?: string;
}) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const url = cmsIconUrl(iconPath);
  if (!url || failedPath === url) return <TourIcon name={fallback} className={className} />;
  return <img src={url} alt="" aria-hidden="true" className={`j-cms-icon ${className}`} onError={() => setFailedPath(url)} />;
}
