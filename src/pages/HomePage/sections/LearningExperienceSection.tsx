import { RevealOnScroll } from "../../../components/ui/RevealOnScroll";
const steps = [
  [
    "01",
    "Learn the fundamentals",
    "Build an understanding of the tools, principles, and methods in your chosen discipline.",
  ],
  [
    "02",
    "Practise with intention",
    "Apply what you learn to challenges and guided exercises.",
  ],
  [
    "03",
    "Build real projects",
    "Turn ideas into practical work that develops your problem-solving and portfolio.",
  ],
  [
    "04",
    "Grow with guidance",
    "Learn through feedback, mentorship, and the perspectives of other creatives.",
  ],
];
export function LearningExperienceSection() {
  return (
    <section className="approach section-pad">
      <RevealOnScroll className="approach-header">
        <div>
          <h2>
            Build skills through
            <br />
            <em>practice, not theory alone.</em>
          </h2>
        </div>
        <p>
          A repeatable way to move from a first question to work you are proud
          to share.
        </p>
      </RevealOnScroll>
      <div className="steps">
        {steps.map(([number, title, description], index) => (
          <RevealOnScroll className="step" key={number}>
            <span className="step-number">{number}</span>
            <div className="step-symbol" aria-hidden="true">
              {["◌", "↗", "✳", "↗"][index]}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}
