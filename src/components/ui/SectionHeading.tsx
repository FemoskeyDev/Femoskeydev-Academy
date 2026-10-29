import { Eyebrow } from "./Eyebrow";
type Props = {
  eyebrow?: string;
  title: string;
  support?: string;
  light?: boolean;
  align?: "left" | "center";
  level?: 1 | 2;
};
export function SectionHeading({
  eyebrow,
  title,
  support,
  light = false,
  align = "left",
  level = 2,
}: Props) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div
      className={`section-heading${light ? " eyebrow-light" : ""}`}
      style={{ textAlign: align }}
    >
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <Heading>{title}</Heading>
      {support && <p>{support}</p>}
    </div>
  );
}
