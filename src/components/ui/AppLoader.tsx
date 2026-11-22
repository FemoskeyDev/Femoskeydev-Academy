
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { AnimatedAcademyLogo } from "./AnimatedAcademyLogo";
import styles from "./AppLoader.module.css";

const MAX_READY_WAIT_MS = 4000;
const INTRO_FALLBACK_MS = 2900;
// The settle and the pathway take about 1.3 seconds; never wait on them longer than this.
const FINISH_FALLBACK_MS = 2200;
const MIN_SPIN_TIME_MS = 1230;
// The first image on the homepage: the hero film's poster.
const HERO_IMAGE = "/images/portfolio/showreel-poster.webp";

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    const finish = () => resolve();

    image.onload = () => {
      void image
        .decode()
        .catch(() => undefined)
        .finally(finish);
    };

    image.onerror = finish;
    image.src = src;
  });
}

function waitForAppAssets() {
  const fontReady =
    document.fonts
      ?.load('500 16px "Tomato Grotesk"')
      .then(() => undefined)
      .catch(() => undefined) ?? Promise.resolve();

  const assetsReady = Promise.all([
    fontReady,
    preloadImage(HERO_IMAGE),
  ]);

  return new Promise<void>((resolve) => {
    const finish = () => {
      window.clearTimeout(fallback);
      resolve();
    };

    const fallback = window.setTimeout(
      finish,
      MAX_READY_WAIT_MS
    );

    void assetsReady.then(finish, finish);
  });
}

export function AppLoader({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const reducedMotion = useReducedMotion();

  const [introComplete, setIntroComplete] = useState(reducedMotion);
  const [appReady, setAppReady] = useState(false);

  const [finished, setFinished] = useState(false);

  // Once the page is ready and the star has spun for long enough, the logo finishes: the star settles
  // and the pathway draws up to it. Only then does the loader fade.
  const finishing = appReady && introComplete;
  const leaving = finishing && finished;

  const notified = useRef(false);
  const introCompletionTimer = useRef<number | null>(null);

  // The spring animation has finished.
  // Allow the star to spin for at least 1.2 seconds before
  // marking the intro complete.
  const completeIntro = useCallback(() => {
    if (reducedMotion) {
      setIntroComplete(true);
      return;
    }

    if (introCompletionTimer.current !== null) {
      window.clearTimeout(introCompletionTimer.current);
    }

    introCompletionTimer.current = window.setTimeout(() => {
      setIntroComplete(true);
      introCompletionTimer.current = null;
    }, MIN_SPIN_TIME_MS);
  }, [reducedMotion]);

  const dismiss = useCallback(() => {
    if (notified.current) return;

    notified.current = true;

    document.documentElement.classList.remove("app-starting");
    onDismiss();
  }, [onDismiss]);

  // Check the font and the hero image, with a bounded wait.
  useEffect(() => {
    let active = true;

    void waitForAppAssets().then(() => {
      if (active) {
        setAppReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  // Dismiss after the fade-out transition finishes.
  const handleFadeEnd = (
    event: TransitionEvent<HTMLDivElement>
  ) => {
    if (
      event.target !== event.currentTarget ||
      event.propertyName !== "opacity" ||
      !leaving
    ) {
      return;
    }

    dismiss();
  };

  // The page behind is painted black while the loader is up (html.app-starting). Give it its own
  // background back as soon as the fade starts, or a black strip shows around the header mid-fade.
  useEffect(() => {
    if (leaving) document.documentElement.classList.remove("app-starting");
  }, [leaving]);

  // Keep the existing dismissal fallback.
  useEffect(() => {
    if (!leaving) return;

    const fallback = window.setTimeout(dismiss, 700);

    return () => window.clearTimeout(fallback);
  }, [dismiss, leaving]);

  // Safety fallback if the SVG entrance animation event
  // never fires. Do not add another spin delay here.
  useEffect(() => {
    if (introComplete) return;

    const fallback = window.setTimeout(() => {
      setIntroComplete(true);
    }, INTRO_FALLBACK_MS);

    return () => window.clearTimeout(fallback);
  }, [introComplete]);

  // Safety fallback if the finishing animation never reports back.
  useEffect(() => {
    if (!finishing || finished) return;

    const fallback = window.setTimeout(() => setFinished(true), FINISH_FALLBACK_MS);

    return () => window.clearTimeout(fallback);
  }, [finishing, finished]);

  // Prevent pending timers from surviving an unmount.
  useEffect(() => {
    return () => {
      if (introCompletionTimer.current !== null) {
        window.clearTimeout(introCompletionTimer.current);
        introCompletionTimer.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`${styles.loader} ${leaving ? styles.leaving : ""}`}
      aria-hidden="true"
      onTransitionEnd={handleFadeEnd}
    >
      <AnimatedAcademyLogo
        reducedMotion={reducedMotion}
        onIntroComplete={completeIntro}
        finish={finishing}
        onFinished={() => setFinished(true)}
      />
    </div>
  );
}
