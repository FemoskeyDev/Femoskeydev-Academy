import { Link } from "react-router-dom";
export function CommunitySection() {
  return (
    <section className="community section-pad" id="community">
      <div className="community-shape" aria-hidden="true">
        <span>MAKE</span>
        <span>TOGETHER</span>
        <div className="community-star">✳</div>
        <i className="community-orbit" />
      </div>
      <div className="community-copy">
        <h2>
          You don't have to
          <br />
          figure it all out <em>alone.</em>
        </h2>
        <p>
          Connect with other creatives, share what you're learning, and keep
          moving forward together.
        </p>
        <Link className="button button-lime" to="/community">
          Discover Our Community <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
