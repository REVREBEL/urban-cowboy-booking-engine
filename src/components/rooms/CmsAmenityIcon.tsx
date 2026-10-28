import { useState } from "react";
import { cmsIconUrl } from "@/lib/cmsPhotoHotspots";
import type { TourIcon as TourIconName } from "@/journey/tour";
import { TourIcon } from "./TourIcon";

/** Webflow supplies paths/filenames, while SVG bytes remain in the public assets folder. */
export function CmsAmenityIcon({ iconPath, fallback, className = "size-10", monochrome = false }: {
  iconPath?: string | null;
  fallback: TourIconName;
  className?: string;
  monochrome?: boolean;
}) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const url = cmsIconUrl(iconPath);
  if (!url || failedPath === url) return <TourIcon name={fallback} className={className} />;
  if (monochrome) return (
    <span aria-hidden="true" className={`inline-block bg-current transition-colors duration-200 motion-reduce:transition-none ${className}`}
      style={{ maskImage: `url("${url}")`, maskSize: "contain", maskPosition: "center", maskRepeat: "no-repeat" }}>
      <img src={url} alt="" className="size-full opacity-0" onError={() => setFailedPath(url)} />
    </span>
  );
  return <img src={url} alt="" aria-hidden="true" className={`j-cms-icon ${className}`} onError={() => setFailedPath(url)} />;
}
