import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
  type FocusEvent,
} from "react";
import { Button } from "../../../components/ui/Button";
import { siteConfig } from "../../../data/siteConfig";
import styles from "./HeroSection.module.css";

const slides = [
  {
    src: "/images/hero-carousel/01-graphic-design.jpg",
    alt: "Designer arranging visual layouts on a laptop",
    label: "Graphic design",
    width: 1200,
    height: 1800,
  },
  {
    src: "/images/hero-carousel/02-design-software.jpg",
    alt: "Digital design software open on a laptop in a studio",
    label: "Digital design",
    width: 1200,
    height: 1799,
  },
  {
    src: "/images/hero-carousel/03-workspace.jpg",
    alt: "A modern workstation arranged for focused creative work",
    label: "Creative workspace",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/hero-carousel/04-visual-design.jpg",
    alt: "Designer working on visual content at a desktop computer",
    label: "Visual design",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/hero-carousel/05-product-design.jpg",
    alt: "A digital product design workspace with phone and monitor",
    label: "Product design",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/hero-carousel/06-creative-studio.jpg",
    alt: "Graphic artist working among printed posters and studio tools",
    label: "Studio practice",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/hero-carousel/07-design-practice.jpg",
    alt: "Creative professional working at a desk in a home studio",
    label: "Design practice",
    width: 1200,
    height: 1800,
  },
  {
    src: "/images/hero-carousel/08-creative-coding.jpg",
    alt: "Colorful code editor and screens in a creative technology workspace",
    label: "Creative coding",
    width: 1200,
    height: 675,
  },
  {
    src: "/images/hero-carousel/09-collaboration.jpg",
    alt: "Creative collaborators discussing a shared project",
    label: "Collaboration",
    width: 1200,
    height: 1800,
  },
  {
    src: "/images/hero-carousel/10-creative-community.jpg",
    alt: "A small group working together around a laptop",
    label: "Creative community",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/hero-carousel/11-minimal-workspace.jpg",
    alt: "Minimal workspace with a laptop and sketchbook",
    label: "Creative tools",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/hero-carousel/12-digital-illustration.jpg",
    alt: "Artist drawing digitally on a tablet with a stylus",
    label: "Digital illustration",
    width: 1200,
    height: 800,
  },
];

function getSlideOffset(slideIndex: number, activeIndex: number) {
  const offset = (slideIndex - activeIndex + slides.length) % slides.length;
  return offset > slides.length / 2 ? offset - slides.length : offset;
}

export function HeroSection() {
  const hero = siteConfig.home;
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const swipeStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      isCarouselPaused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const timer = window.setInterval(() => {
      if (!document.hidden)
        setActiveSlide((current) => (current + 1) % slides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [activeSlide, isCarouselPaused]);

  const showPrevious = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };
  const showNext = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch") return;
    swipeStartRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (swipeStartRef.current === null) return;
    const distance = event.clientX - swipeStartRef.current;
    if (Math.abs(distance) > 42) distance < 0 ? showNext() : showPrevious();
    swipeStartRef.current = null;
  };

  const handlePointerCancel = () => {
    swipeStartRef.current = null;
  };

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsCarouselPaused(false);
    }
  };

  return (
    <section className={styles.hero} aria-labelledby="home-hero-title">
      <div className={styles.intro}>
        <span className={styles.tag}>A COMMUNITY FOR AMBITIOUS CREATIVES</span>
        <h1
          id="home-hero-title"
          aria-label={`${hero.headline.before} ${hero.headline.emphasis}`}
        >
          <span>{hero.headline.before}</span>
          <em>{hero.headline.emphasis}</em>
        </h1>
        <p>{hero.support}</p>
      </div>

      <div className={styles.actions}>
        <Button to="/learning-paths">Explore Learning Paths</Button>
      </div>

      <div
        className={styles.carousel}
        role="region"
        aria-roledescription="carousel"
        aria-label="Creative practice image carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        onFocusCapture={() => setIsCarouselPaused(true)}
        onBlurCapture={handleBlurCapture}
      >
        <div className={styles.stage}>
          {slides.map((slide, slideIndex) => {
            const offset = getSlideOffset(slideIndex, activeSlide);
            const distance = Math.abs(offset);
            const isActive = offset === 0;

            return (
              <button
                className={styles.slide}
                type="button"
                data-offset={offset}
                data-distance={distance}
                key={slide.src}
                aria-label={`Show ${slide.label}, slide ${slideIndex + 1} of ${slides.length}`}
                aria-pressed={isActive}
                aria-hidden={distance > 3 || undefined}
                tabIndex={distance > 3 ? -1 : 0}
                onClick={() => setActiveSlide(slideIndex)}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  loading={distance <= 1 ? "eager" : "lazy"}
                  decoding="async"
                  draggable={false}
                  fetchPriority={isActive ? "high" : "auto"}
                />
              </button>
            );
          })}
        </div>

        <button
          className={`${styles.control} ${styles.previous}`}
          type="button"
          onClick={showPrevious}
          aria-label="Previous image"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          className={`${styles.control} ${styles.next}`}
          type="button"
          onClick={showNext}
          aria-label="Next image"
        >
          <span aria-hidden="true">→</span>
        </button>
        <span className={styles.visuallyHidden} aria-live="polite">
          Slide {activeSlide + 1} of {slides.length}:{" "}
          {slides[activeSlide].label}
        </span>
      </div>
    </section>
  );
}
