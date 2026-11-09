import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { HeroSection } from "./HeroSection";
import { ManifestoSection } from "./ManifestoSection";
import styles from "./AcademyIntro.module.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Keeps the Hero and Manifesto on one shared canvas so their background can
 * transition as the Manifesto approaches, without changing either layout.
 */
export function AcademyIntro() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    const manifesto = stage?.querySelector<HTMLElement>("#academy-manifesto");

    if (!stage || !manifesto || reducedMotion) return;

    let cancelled = false;
    let context: gsap.Context | undefined;

    const setup = () => {
      if (cancelled) return;

      const darkCanvas =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-ink")
          .trim() || "#151515";

      context = gsap.context(() => {
        gsap.to(stage, {
          backgroundColor: darkCanvas,
          ease: "none",
          scrollTrigger: {
            trigger: manifesto,
            start: "top 28%",
            end: "top top",
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        });
      }, stage);

      ScrollTrigger.refresh();
    };

    // Wait for web fonts so the trigger position is measured against the
    // final typography, not a temporary fallback font.
    if ("fonts" in document) {
      void document.fonts.ready.then(setup).catch(setup);
    } else {
      setup();
    }

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [reducedMotion]);

  return (
    <div ref={stageRef} className={styles.stage}>
      <HeroSection />
      <ManifestoSection />
    </div>
  );
}
