import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./AnimatedAcademyLogo.module.css";

const backgroundPath =
  "M102.677 19H35.3226C26.3226 19 19 26.3226 19 35.3226V119H41.9677L96.5832 119.032L96.6129 119.032H119V35.3226C119 26.2903 111.677 19 102.677 19Z";

const starPath =
  "M69.0001 35.9668C69.0001 53.8761 54.7539 68.4644 36.978 69.0152C54.7539 69.566 69.0001 84.1543 69.0001 102.064C69.0001 84.1543 83.2463 69.566 101.022 69.0152C83.2463 68.4644 69.0001 53.8761 69.0001 35.9668Z";

// The Femoskeydev mark and the gap between its legs (the pathway), drawn on a 32-unit grid. Placed at
// translate(19 19) scale(3.125) they line up with the tile and star above. The pathway runs a unit past
// the tile's bottom edge (invisible against the backdrop), so the two edges never meet and leave a hairline.
const markPath =
  "M26.7767 0H5.22325C2.34326 0 0 2.34322 0 5.2232V31.9999H7.3497C11.6026 31.9999 15.0503 28.5521 15.0503 24.2993C15.0503 22.6373 14.5342 20.9754 13.4503 19.716C11.5097 17.4451 8.62969 16.0103 5.41938 16.0103C11.2619 16.0103 16 11.2722 16 5.42966C16 11.2722 20.738 16.0103 26.5806 16.0103C23.298 16.0103 20.3767 17.507 18.4361 19.8606C17.4451 21.058 16.9497 22.5754 16.9497 24.1238C16.9497 28.4799 20.48 32.0102 24.8361 32.0102H31.9999V5.2232C31.9999 2.33289 29.6567 0 26.7767 0Z";

const pathwayPath =
  "M5.41938 16.0103C8.62969 16.0103 11.5097 17.4451 13.4503 19.716C14.5342 20.9754 15.0503 22.6373 15.0503 24.2993C15.0503 28.5521 11.6026 31.9999 7.3497 31.9999V33H24.8361V32.0102C20.48 32.0102 16.9497 28.4799 16.9497 24.1238C16.9497 22.5754 17.4451 21.058 18.4361 19.8606C20.3767 17.507 23.298 16.0103 26.5806 16.0103Z";

const onGrid = "translate(19 19) scale(3.125)";

type AnimatedAcademyLogoProps = {
  size?: number | string;
  className?: string;
  onIntroComplete?: () => void;
  /** Ends the spin: the star settles upright, the pathway draws up to it, and the mark is complete. */
  finish?: boolean;
  onFinished?: () => void;
  reducedMotion?: boolean;
};

/** The spin's current angle, read from its running CSS animation. */
function currentAngle(element: HTMLElement) {
  const transform = getComputedStyle(element).transform;
  const match = /^matrix\(([^,]+),\s*([^,]+)/.exec(transform);
  if (!match) return 0;
  const angle = (Math.atan2(Number(match[2]), Number(match[1])) * 180) / Math.PI;
  return angle < 0 ? angle + 360 : angle;
}

/**
 * The star reads as a hole in the mint tile: it is painted in the surface colour behind the logo
 * (`--logo-cutout`, the ink of the loader by default). It lives in its own HTML layer, so its burst
 * and spin are plain transforms the browser composites off the main thread, staying smooth while
 * the page loads underneath. The layer is drawn at 3× and scaled down, so the burst stays sharp.
 *
 * When `finish` turns on, the star eases to a stop upright and the pathway between the legs grows out
 * of it, from the star's side points down to the bottom edge: the pathway to becoming awesome, ending
 * on the Femoskeydev mark.
 */
export function AnimatedAcademyLogo({
  size = "clamp(150px, 32vw, 280px)",
  className,
  onIntroComplete,
  finish = false,
  onFinished,
  reducedMotion = false,
}: AnimatedAcademyLogoProps) {
  const style = { width: size, height: size } as CSSProperties;
  const logoRef = useRef<HTMLSpanElement>(null);
  const spinRef = useRef<HTMLSpanElement>(null);
  const pathwayRef = useRef<HTMLSpanElement>(null);
  const [complete, setComplete] = useState(reducedMotion);
  const finishedRef = useRef(onFinished);
  useEffect(() => { finishedRef.current = onFinished; }, [onFinished]);

  useEffect(() => {
    if (!finish) return;
    const spin = spinRef.current;
    const pathway = pathwayRef.current;
    const done = () => { setComplete(true); finishedRef.current?.(); };
    if (reducedMotion || !spin || !pathway || typeof spin.animate !== "function") { done(); return; }

    let cancelled = false;
    const angle = currentAngle(spin);
    // Every quarter turn looks the same, so stop on the next one after a little more travel.
    const target = Math.ceil(angle / 90) * 90 + 90;
    spin.style.animation = "none";
    spin.style.transform = `rotate(${angle}deg)`;
    const settle = spin.animate(
      [{ transform: `rotate(${angle}deg)` }, { transform: `rotate(${target}deg)` }],
      { duration: 620, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" },
    );
    const animations: Animation[] = [settle];
    settle.finished
      .then(() => {
        if (cancelled) return;
        const pave = pathway.animate(
          [{ clipPath: "inset(0 0 50% 0)" }, { clipPath: "inset(0 0 0 0)" }],
          { duration: 750, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" },
        );
        animations.push(pave);
        return pave.finished;
      })
      .then(() => {
        if (cancelled) return;
        logoRef.current?.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.035)", offset: 0.4 }, { transform: "scale(1)" }],
          { duration: 520, easing: "cubic-bezier(.22,1,.36,1)" },
        );
        done();
      })
      .catch(() => { if (!cancelled) done(); });

    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [finish, reducedMotion]);

  const handleAnimationEnd = (event: React.AnimationEvent<HTMLSpanElement>) => {
    if ((event.target as HTMLElement).classList.contains(styles.starEntry)) {
      onIntroComplete?.();
    }
  };

  return (
    <span
      ref={logoRef}
      className={[
        styles.logo,
        reducedMotion ? styles.reducedMotion : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="img"
      aria-label="Femoskeydev"
      onAnimationEnd={handleAnimationEnd}
    >
      {/* The mint silhouette never moves; once the pathway is drawn it becomes the finished mark. */}
      <svg className={styles.tile} viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {complete
          ? <path className={styles.background} d={markPath} transform={onGrid} />
          : <path className={styles.background} d={backgroundPath} />}
      </svg>
      {!complete && <>
        <span ref={pathwayRef} className={styles.road} aria-hidden="true">
          <svg viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className={styles.cutout} d={pathwayPath} transform={onGrid} />
          </svg>
        </span>
        {/* Runs once: rise, burst past the edges, quiver, snap into place */}
        <span className={styles.starEntry} aria-hidden="true">
          {/* Spins only after the entrance has settled */}
          <span ref={spinRef} className={styles.starSpin}>
            <svg viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className={styles.cutout} d={starPath} />
            </svg>
          </span>
        </span>
      </>}
    </span>
  );
}
