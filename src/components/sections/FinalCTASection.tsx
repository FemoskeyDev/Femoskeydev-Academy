import { Button } from "../ui/Button";
export function FinalCTASection({
  title,
  support,
  primary = "Explore learning paths",
  primaryTo = "/learning-paths",
  secondary = "Get in touch",
  secondaryTo = "/contact",
}: {
  title: string;
  support: string;
  primary?: string;
  primaryTo?: string;
  secondary?: string;
  secondaryTo?: string;
}) {
  return (
    <section className="closing section-pad">
      <div className="closing-orb" aria-hidden="true">
        ✳
      </div>
      <h2>{title}</h2>
      <p>{support}</p>
      <div className="closing-actions">
        <Button to={primaryTo} variant="lime">
          {primary}
        </Button>
        <Button to={secondaryTo} variant="outline">
          {secondary}
        </Button>
      </div>
    </section>
  );
}
