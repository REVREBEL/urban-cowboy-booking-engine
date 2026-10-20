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
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const webflowUrl = typeof imageUrl === "string" && /^https:\/\//i.test(imageUrl) ? imageUrl : null;
  const localUrl = cmsIconUrl(iconPath);
  const url = webflowUrl && !failedUrls.includes(webflowUrl) ? webflowUrl : localUrl && !failedUrls.includes(localUrl) ? localUrl : null;
  if (!url) return <TourIcon name={fallback} className={className} />;
  return <img key={url} src={url} alt="" aria-hidden="true" className={`j-cms-icon ${className}`} onError={() => setFailedUrls((current) => current.includes(url) ? current : [...current, url])} />;
}
