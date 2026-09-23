import BrandLogo from "@/Components/common/BrandLogo";

export default function LoadingSpinner({
  fullScreen = true,
  title = "Loading NEXA",
  subtitle = "Connecting knowledge, community, and recovery.",
}) {
  return (
    <div
      className={`nexa-loader-screen ${fullScreen ? "nexa-loader-fullscreen" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className="nexa-loader-wrap">
        <div className="nexa-loader" aria-hidden="true">
          <div className="nexa-loader-glow" />
          <div className="nexa-loader-dashes" />
          <div className="nexa-loader-ring nexa-loader-ring-one" />
          <div className="nexa-loader-ring nexa-loader-ring-two" />
          <div className="nexa-loader-ring nexa-loader-ring-three" />
          <div className="nexa-loader-orbit" />
          <div className="nexa-loader-core">
            <BrandLogo alt="" />
          </div>
        </div>

        <div className="nexa-loader-text">
          <strong className="nexa-loader-title">
            {title}
            <span className="nexa-loader-dots" aria-hidden="true">
              <i /><i /><i />
            </span>
          </strong>
          <span className="nexa-loader-subtitle">{subtitle}</span>
        </div>

        <div className="nexa-loader-progress" aria-hidden="true">
          <span className="nexa-loader-progress-bar" />
        </div>
      </div>
    </div>
  );
}
