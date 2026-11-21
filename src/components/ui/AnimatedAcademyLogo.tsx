import type { CSSProperties } from "react";
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

/**
 * The star reads as a hole in the mint tile: it is painted in the surface colour behind the logo
 * (`--logo-cutout`, the ink of the loader by default). It lives in its own HTML layer, so its burst
 * and spin are plain transforms the browser composites off the main thread, staying smooth while
 * the page loads underneath. The layer is drawn at 3× and scaled down, so the burst stays sharp.
 */
export function AnimatedAcademyLogo({
  size = "clamp(150px, 32vw, 280px)",
  className,
  onIntroComplete,
  reducedMotion = false,
}: AnimatedAcademyLogoProps) {
  const style = { width: size, height: size } as CSSProperties;

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLSpanElement>) => {
    if ((event.target as HTMLElement).classList.contains(styles.starEntry)) {
      onIntroComplete?.();
    }
  };

  return (
    <span
      className={[
        styles.logo,
        reducedMotion ? styles.reducedMotion : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="img"
      aria-label="Femoskeydev Academy"
      onAnimationEnd={handleAnimationEnd}
    >
      {/* The mint silhouette itself never moves. */}
      <svg className={styles.tile} viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path className={styles.background} d={backgroundPath} />
      </svg>
      {/* Runs once: rise, burst past the edges, snap into place */}
      <span className={styles.starEntry} aria-hidden="true">
        {/* Spins only after the entrance has settled */}
        <span className={styles.starSpin}>
          <svg viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className={styles.cutout} d={starPath} />
          </svg>
        </span>
      </span>
    </span>
  );
}
