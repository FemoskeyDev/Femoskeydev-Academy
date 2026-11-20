import { useId, type CSSProperties } from "react";
import styles from "./AnimatedAcademyLogo.module.css";

const backgroundPath =
  "M102.677 19H35.3226C26.3226 19 19 26.3226 19 35.3226V119H41.9677L96.5832 119.032L96.6129 119.032H119V35.3226C119 26.2903 111.677 19 102.677 19Z";

const starPath =
  "M69.0001 35.9668C69.0001 53.8761 54.7539 68.4644 36.978 69.0152C54.7539 69.566 69.0001 84.1543 69.0001 102.064C69.0001 84.1543 83.2463 69.566 101.022 69.0152C83.2463 68.4644 69.0001 53.8761 69.0001 35.9668Z";

type AnimatedAcademyLogoProps = {
  size?: number | string;
  className?: string;
  onIntroComplete?: () => void;
  reducedMotion?: boolean;
};

export function AnimatedAcademyLogo({
  size = "clamp(150px, 32vw, 280px)",
  className,
  onIntroComplete,
  reducedMotion = false,
}: AnimatedAcademyLogoProps) {
  const maskId = `academy-logo-mask-${useId().replace(/:/g, "")}`;
  const style = { width: size, height: size } as CSSProperties;

  const handleAnimationEnd = (event: React.AnimationEvent<SVGSVGElement>) => {
    const entry = event.currentTarget.querySelector(`.${styles.starEntry}`);

    if (event.target === entry) {
      onIntroComplete?.();
    }
  };

  return (
    <svg
      className={[
        styles.logo,
        reducedMotion ? styles.reducedMotion : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      viewBox="0 0 138 138"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Femoskeydev Academy"
      onAnimationEnd={handleAnimationEnd}
    >
      <defs>
        {/* The star is cut out of the tile, so whatever sits behind the logo shows through it. */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="138" height="138">
          <rect width="138" height="138" fill="#fff" />
          {/* Runs once: rise, burst past the edges, snap into place */}
          <g className={styles.starEntry}>
            {/* Spins only after the entrance has settled */}
            <g className={styles.starSpin}>
              <path d={starPath} fill="#000" />
            </g>
          </g>
        </mask>
      </defs>

      {/* The mint silhouette itself never moves. */}
      <path className={styles.background} d={backgroundPath} mask={`url(#${maskId})`} />
    </svg>
  );
}
