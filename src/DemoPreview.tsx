import "./demo-preview.css";

type DemoPreviewProps = {
  progress?: number;
  cursor?: boolean;
  cursorSize?: number;
};

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12 12 4M4 4h8v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunDoodle() {
  return (
    <svg
      className="demo-sun"
      viewBox="0 0 140 140"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M72 35c21-4 42 17 37 39-3 21-22 34-41 28-20-4-29-22-24-40 3-13 13-24 28-27Z" />
        <path d="m73 9-1 13M111 18l-9 13M132 49l-14 5M130 87l-12-4M110 118l-10-12M74 133l1-18M34 116l12-11M12 82l17-3M17 43l17 7M39 14l9 14" />
        <path d="M62 61v6M88 59v6" strokeWidth="4.5" />
        <path d="M62 79c8 9 19 9 27-1" strokeWidth="3.5" />
      </g>
    </svg>
  );
}

function WorkCards() {
  return (
    <div className="demo-work-grid">
      <div className="demo-work-card demo-work-mint">
        <div className="demo-project-wordmark">
          a little
          <br />
          <span>good.</span>
          <i>®</i>
        </div>
        <div className="demo-good-shape" />
        <svg
          className="demo-good-flower"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <g fill="#f9f095">
            <ellipse cx="50" cy="30" rx="14" ry="27" />
            <ellipse cx="50" cy="70" rx="14" ry="27" />
            <ellipse cx="30" cy="50" rx="27" ry="14" />
            <ellipse cx="70" cy="50" rx="27" ry="14" />
            <ellipse
              cx="35"
              cy="35"
              rx="14"
              ry="24"
              transform="rotate(-45 35 35)"
            />
            <ellipse
              cx="65"
              cy="65"
              rx="14"
              ry="24"
              transform="rotate(-45 65 65)"
            />
            <ellipse
              cx="65"
              cy="35"
              rx="14"
              ry="24"
              transform="rotate(45 65 35)"
            />
            <ellipse
              cx="35"
              cy="65"
              rx="14"
              ry="24"
              transform="rotate(45 35 65)"
            />
          </g>
          <circle cx="50" cy="50" r="17" fill="#ed683f" />
        </svg>
        <span className="demo-project-caption">
          A fresh perspective on feeling good.
        </span>
      </div>
      <div className="demo-work-card demo-work-peach">
        <span className="demo-noma-wordmark">
          noma<span>®</span>
        </span>
        <svg
          className="demo-noma-art"
          viewBox="0 0 220 130"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M48 128V80C48 32 127 29 127 80v48"
            stroke="#ea6545"
            strokeWidth="30"
          />
          <path
            d="M123 130V79c0-30 50-30 50 0v51"
            stroke="#773e36"
            strokeWidth="27"
          />
          <circle cx="179" cy="25" r="16" fill="#e8ac43" />
        </svg>
        <span className="demo-project-caption">
          Objects for a life well lived.
        </span>
      </div>
    </div>
  );
}

export default function DemoPreview({
  progress = 0,
  cursor = true,
  cursorSize = 24,
}: DemoPreviewProps) {
  const phase = Math.max(0, Math.min(progress, 1));

  return (
    <div
      className="demo-browser"
      aria-label="Sample recording of a creative studio website"
    >
      <div className="demo-browser-bar" aria-hidden="true">
        <div className="demo-traffic-lights">
          <i />
          <i />
          <i />
        </div>
        <div className="demo-browser-arrows">
          <span>‹</span>
          <span>›</span>
        </div>
        <div className="demo-browser-address">
          <svg viewBox="0 0 12 12" fill="none">
            <rect
              x="3"
              y="5"
              width="6"
              height="5"
              rx="1"
              stroke="currentColor"
            />
            <path d="M4 5V3a2 2 0 0 1 4 0v2" stroke="currentColor" />
          </svg>
          madeby.studio
          <svg className="demo-refresh" viewBox="0 0 12 12" fill="none">
            <path
              d="M9.5 4a4 4 0 1 0 .4 3M9.5 1v3h-3"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="demo-browser-plus">+</span>
      </div>

      <div className="demo-website" aria-hidden="true">
        <div className="demo-site-nav">
          <div className="demo-logo">
            Studio
            <svg
              className="demo-logo-star"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5"
                stroke="currentColor"
                strokeWidth="3.3"
              />
            </svg>
          </div>
          <div className="demo-nav-links">
            <span>Work</span>
            <span>About</span>
            <span>
              Contact <ArrowUpRight className="demo-nav-arrow" />
            </span>
          </div>
        </div>
        <div className="demo-hero">
          <div className="demo-eyebrow">
            <i /> A small studio. A big imagination.
          </div>
          <h2>
            Good ideas deserve
            <br />a little spotlight<span className="demo-title-dot">.</span>
          </h2>
          <p>
            We turn bold ideas into brands and digital experiences
            <br />
            that feel a little different. In a good way.
          </p>
          <div className="demo-cta">
            Explore our work <ArrowUpRight />
          </div>
          <SunDoodle />
          <svg className="demo-squiggle" viewBox="0 0 90 55" fill="none">
            <path
              d="M7 16c17 1 38 10 26 18-15 10-24-9-5-10 20-2 35 15 45 18m-10-3 12 4-2-12"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <WorkCards />
      </div>
      {cursor && (
        <svg
          className="demo-sample-cursor"
          style={{
            left: `${24 + phase * 8}%`,
            top: `${61 + phase * 2}%`,
            width: cursorSize,
            height: cursorSize * 1.2,
          }}
          viewBox="0 0 24 29"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 2 21.5 16.3l-9.2 1.1-5 8.4L3 2Z"
            fill="white"
            stroke="#27272a"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
