import { useState } from "react";
import { cmsIconUrl } from "@/lib/cmsPhotoHotspots";
import type { TourIcon as TourIconName } from "@/journey/tour";
import { TourIcon } from "./TourIcon";

/** Webflow Image first, checked-in SVG second, generic TourIcon last. */
export function CmsAmenityIcon({ imageUrl, iconPath, fallback, className = "size-10", monochrome = false }: {
  imageUrl?: string | null;
  iconPath?: string | null;
  fallback: TourIconName;
  className?: string;
  monochrome?: boolean;
}) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const primary = typeof imageUrl === "string" && /^https:\/\//i.test(imageUrl) ? imageUrl : null;
  const local = cmsIconUrl(iconPath);
  const url = [primary, local].find((candidate): candidate is string =>
    Boolean(candidate && !failedUrls.includes(candidate))) ?? null;
  if (!url) return <TourIcon name={fallback} className={className} />;

  const onError = () => setFailedUrls((current) =>
    current.includes(url) ? current : [...current, url]);

  if (monochrome) return (
    <span aria-hidden="true"
      className={`inline-block bg-current transition-colors duration-200 motion-reduce:transition-none ${className}`}
      style={{
        maskImage: `url("${url}")`,
        WebkitMaskImage: `url("${url}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}>
      <img key={url} src={url} alt="" className="size-full opacity-0" onError={onError} />
    </span>
  );
  return <img key={url} src={url} alt="" aria-hidden="true"
    className={`j-cms-icon ${className}`} onError={onError} />;
}
