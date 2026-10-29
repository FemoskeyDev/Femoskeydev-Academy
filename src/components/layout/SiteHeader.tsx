import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, NavLink } from "react-router-dom";
import { BrandMark } from "../ui/BrandMark";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { AnimatedAcademyLogo } from "../ui/AnimatedAcademyLogo";
import { navigation } from "../../data/navigation";
import styles from "./SiteHeader.module.css";

function RollingLabel({ label }: { label: string }) {
  return (
    <span className={styles.rollingLabel} aria-hidden="true">
      {Array.from(label, (character, index) => (
        <span
          className={styles.rollChar}
          key={`${character}-${index}`}
          style={{ "--roll-index": index } as CSSProperties}
        >
          <span>{character === " " ? "\u00a0" : character}</span>
          <span aria-hidden="true">
            {character === " " ? "\u00a0" : character}
          </span>
        </span>
      ))}
    </span>
  );
}

export function SiteHeader({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [open]);
  useEffect(() => {
    if (open) firstLinkRef.current?.focus();
  }, [open]);
  const close = () => setOpen(false);

  if (variant === "hero")
    return (
      <header className={styles.heroHeader} data-home-hero-header>
        <div className={styles.heroHeaderInner}>
          <Link
            to="/"
            className={styles.heroBrand}
            aria-label="Femoskeydev Academy home"
            onClick={close}
          >
            <AnimatedAcademyLogo
              className={styles.heroLogo}
              size={36}
              reducedMotion
            />
            <span>
              Femoskeydev
              <br />
              <b>Academy</b>
            </span>
          </Link>
          <button
            ref={toggleRef}
            className={styles.heroMenuToggle}
            type="button"
            aria-expanded={open}
            aria-controls="home-hero-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className={styles.menuBars} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>{open ? "Close" : "Menu"}</span>
          </button>
          <Link className={styles.heroNavCta} to="/learning-paths">
            Explore Learning Paths <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <nav
          id="home-hero-menu"
          className={`${styles.heroMenuPanel} ${open ? styles.heroMenuPanelOpen : ""}`}
          aria-label="Main navigation"
          aria-hidden={!open}
        >
          <div className={styles.heroMenuLinks}>
            {navigation.map((item, index) => (
              <Link
                key={item.to}
                ref={index === 0 ? firstLinkRef : undefined}
                to={item.to}
                tabIndex={open ? 0 : -1}
                className={styles.heroMenuLink}
                style={{ "--menu-index": index } as CSSProperties}
                onClick={close}
                aria-label={item.label}
              >
                <RollingLabel label={item.label} />
                <span className={styles.menuArrow} aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
          <p className={styles.menuFoot}>
            FEMOSKEYDEV ACADEMY <span>LEARN · MAKE · GROW</span>
          </p>
        </nav>
      </header>
    );

  return (
    <header className="header">
      <NavLink
        to="/"
        className="brand"
        aria-label="Femoskeydev Academy home"
        onClick={close}
      >
        <BrandMark />
        <span>
          Femoskeydev
          <br />
          <b>Academy</b>
        </span>
      </NavLink>
      <DesktopNavigation />
      <MobileNavigation
        open={open}
        onToggle={() => setOpen((value) => !value)}
        onNavigate={close}
      />
    </header>
  );
}
