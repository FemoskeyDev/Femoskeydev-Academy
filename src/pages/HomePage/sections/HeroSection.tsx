import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { siteConfig } from "../../../data/siteConfig";
import CircularCarousel, { type CircularCarouselItem } from "./CircularCarousel";
import styles from "./HeroSection.module.css";

const slides: CircularCarouselItem[] = [
  {
    src: "/images/hero-carousel/01-graphic-design.jpg",
    alt: "Designer arranging visual layouts on a laptop",
    title: "Graphic design",
    subtitle: "Visual communication",
  },
  {
    src: "/images/hero-carousel/02-design-software.jpg",
    alt: "Digital design software open on a laptop in a studio",
    title: "Digital design",
    subtitle: "Creative tools",
  },
  {
    src: "/images/hero-carousel/03-workspace.jpg",
    alt: "A modern workstation arranged for focused creative work",
    title: "Creative workspace",
    subtitle: "Daily practice",
  },
  {
    src: "/images/hero-carousel/04-visual-design.jpg",
    alt: "Designer working on visual content at a desktop computer",
    title: "Visual design",
    subtitle: "Art direction",
  },
  {
    src: "/images/hero-carousel/05-product-design.jpg",
    alt: "A digital product design workspace with phone and monitor",
    title: "Product design",
    subtitle: "Digital experiences",
  },
  {
    src: "/images/hero-carousel/06-creative-studio.jpg",
    alt: "Graphic artist working among printed posters and studio tools",
    title: "Studio practice",
    subtitle: "Make and experiment",
  },
  {
    src: "/images/hero-carousel/07-design-practice.jpg",
    alt: "Creative professional working at a desk in a home studio",
    title: "Design practice",
    subtitle: "Keep building",
  },
  {
    src: "/images/hero-carousel/08-creative-coding.jpg",
    alt: "Colorful code editor and screens in a creative technology workspace",
    title: "Creative coding",
    subtitle: "Design meets technology",
  },
  {
    src: "/images/hero-carousel/09-collaboration.jpg",
    alt: "Creative collaborators discussing a shared project",
    title: "Collaboration",
    subtitle: "Learn together",
  },
  {
    src: "/images/hero-carousel/10-creative-community.jpg",
    alt: "A small group working together around a laptop",
    title: "Creative community",
    subtitle: "Grow together",
  },
  {
    src: "/images/hero-carousel/11-minimal-workspace.jpg",
    alt: "Minimal workspace with a laptop and sketchbook",
    title: "Creative tools",
    subtitle: "Your creative setup",
  },
  {
    src: "/images/hero-carousel/12-digital-illustration.jpg",
    alt: "Artist drawing digitally on a tablet with a stylus",
    title: "Digital illustration",
    subtitle: "Explore ideas",
  },
];

export function HeroSection() {
  const hero = siteConfig.home;
  const [viewportWidth, setViewportWidth] = useState(1280);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth, { passive: true });
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  const cardWidth =
    viewportWidth <= 390 ? 190 : viewportWidth <= 760 ? 280 : 400;

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

      <div className={styles.carouselFrame} aria-label="Creative practice gallery">
        <CircularCarousel
          items={slides}
          preset="panorama"
          intro="rise"
          cardWidth={cardWidth}
          aspectRatio={4/2.5}
          gap={8}
          autoplay="drift"
          speed={6.5}
          direction="left"
          draggable
          momentum={0.58}
          snap
          pauseOnHover
          focusOnClick
          parallax={0.12}
          stretch={0.12}
          depthFade={0}
          fadeColor="var(--color-canvas)"
          innerShade={0.15}
          cornerRadius={8}
          captions={false}
          className={styles.panorama}
        />
      </div>
    </section>
  );
}
