import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
export function RevealOnScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced || !("IntersectionObserver" in window)) {
      node.classList.add("is-visible");
      return;
    }
    let observer: IntersectionObserver | undefined;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            node.classList.add("is-visible");
            observer?.disconnect();
          }
        },
        { threshold: 0.12 },
      );
      observer.observe(node);
    } catch {
      node.classList.add("is-visible");
    }
    return () => observer?.disconnect();
  }, [reduced]);
  return (
    <div
      ref={ref}
      className={`reveal${reduced ? " is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
