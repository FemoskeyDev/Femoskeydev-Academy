import { siteConfig } from "../../data/siteConfig";
export function BrandMark({
  className = "academy-logo",
}: {
  className?: string;
}) {
  return (
    <img
      className={className}
      src={siteConfig.logo}
      alt=""
      aria-hidden="true"
    />
  );
}
