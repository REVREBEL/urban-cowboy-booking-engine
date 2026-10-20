import { useState } from "react";
import { cmsIconUrl } from "@/lib/cmsPhotoHotspots";
import type { TourIcon as TourIconName } from "@/journey/tour";
import { TourIcon } from "./TourIcon";

/** Webflow Image first; local public SVG second; generic TourIcon last. */
export function CmsAmenityIcon({ imageUrl, iconPath, fallback, className = "size-10" }: {
  imageUrl?: string | null;
  iconPath?: string | null;
  fallback: TourIconName;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const webflowUrl = typeof imageUrl === "string" && /^https:\/\//i.test(imageUrl) ? imageUrl : null;
  const localUrl = cmsIconUrl(iconPath);
  const url = webflowUrl && failedUrl !== webflowUrl ? webflowUrl : localUrl && failedUrl !== localUrl ? localUrl : null;
  if (!url) return <TourIcon name={fallback} className={className} />;
  return <img key={url} src={url} alt="" aria-hidden="true" className={`j-cms-icon ${className}`} onError={() => setFailedUrl(url)} />;
}
