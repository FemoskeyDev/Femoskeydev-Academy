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
  const clipId = `academy-logo-clip-${useId().replace(/:/g, "")}`;
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
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={backgroundPath} />
        </clipPath>
      </defs>

      {/* Static mint silhouette */}
      <path className={styles.background} d={backgroundPath} fill="#b6ff39" />

      {/* Everything here remains clipped to the mint silhouette */}
      <g clipPath={`url(#${clipId})`} fill="#000000">
        {/* Runs once: enter, stretch, fall, squash and settle */}
        <g className={styles.starEntry}>
          {/* Starts spinning only after the entrance finishes */}
          <g className={styles.starSpin}>
            <path d={starPath} />
          </g>
        </g>
      </g>
    </svg>
  );
}
