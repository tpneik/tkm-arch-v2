"use client";

/**
 * ArchitectAvatar
 * Animated geometric SVG avatar — blueprint / architectural style.
 * Works as a drop-in replacement for <img> inside the team card.
 */
export default function ArchitectAvatar({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full flex items-center justify-center bg-[#0d1117] relative overflow-hidden ${className}`}>
      {/* Blueprint grid background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#2F7FB3" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Main SVG avatar */}
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4/5 h-4/5 relative z-10"
        style={{ overflow: "visible" }}
      >
        <style>{`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes spin-rev {
            from { transform: rotate(0deg); }
            to   { transform: rotate(-360deg); }
          }
          @keyframes pulse-ring {
            0%, 100% { opacity: 0.15; r: 60; }
            50%       { opacity: 0.35; r: 65; }
          }
          @keyframes dash-anim {
            to { stroke-dashoffset: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px);  }
            50%       { transform: translateY(-6px); }
          }
          @keyframes blink {
            0%, 90%, 100% { opacity: 1; }
            95%            { opacity: 0; }
          }

          .ring-outer {
            transform-origin: 100px 100px;
            animation: spin-slow 18s linear infinite;
          }
          .ring-inner {
            transform-origin: 100px 100px;
            animation: spin-rev 12s linear infinite;
          }
          .avatar-body {
            transform-origin: 100px 100px;
            animation: float 4s ease-in-out infinite;
          }
          .dot-blink { animation: blink 3s ease-in-out infinite; }
          .dot-blink-2 { animation: blink 3s ease-in-out infinite 1s; }
        `}</style>

        {/* Pulsing background circle */}
        <circle cx="100" cy="100" r="62" fill="none" stroke="#2F7FB3" strokeWidth="0.5" opacity="0.2">
          <animate attributeName="r" values="60;66;60" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.35;0.15" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Outer rotating ring — dashed */}
        <g className="ring-outer">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#2F7FB3" strokeWidth="0.8"
            strokeDasharray="6 4" opacity="0.4" />
          {/* Corner markers */}
          {[0, 90, 180, 270].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 100 + 80 * Math.cos(rad);
            const y = 100 + 80 * Math.sin(rad);
            return <circle key={i} cx={x} cy={y} r="2.5" fill="#2F7FB3" opacity="0.7" />;
          })}
        </g>

        {/* Inner rotating ring — solid thin */}
        <g className="ring-inner">
          <circle cx="100" cy="100" r="68" fill="none" stroke="#2F7FB3" strokeWidth="0.4"
            strokeDasharray="3 8" opacity="0.25" />
        </g>

        {/* Floating avatar body */}
        <g className="avatar-body">
          {/* Head circle */}
          <circle cx="100" cy="78" r="22" fill="#1a2535" stroke="#2F7FB3" strokeWidth="1.2" />

          {/* Face features */}
          {/* Eyes */}
          <rect x="91" y="72" width="5" height="5" rx="1" fill="#2F7FB3" opacity="0.9" className="dot-blink" />
          <rect x="104" y="72" width="5" height="5" rx="1" fill="#2F7FB3" opacity="0.9" className="dot-blink-2" />
          {/* Nose line */}
          <line x1="100" y1="80" x2="100" y2="86" stroke="#2F7FB3" strokeWidth="0.8" opacity="0.5" />
          {/* Mouth arc */}
          <path d="M 93 90 Q 100 95 107 90" fill="none" stroke="#2F7FB3" strokeWidth="1" opacity="0.6" />

          {/* Shoulders / body trapezoid */}
          <path
            d="M 72 118 L 80 104 Q 100 100 120 104 L 128 118 Z"
            fill="#1a2535" stroke="#2F7FB3" strokeWidth="1.2"
          />

          {/* Tie / detail line */}
          <line x1="100" y1="104" x2="100" y2="116" stroke="#2F7FB3" strokeWidth="1.5" opacity="0.7" />
          <polygon points="96,104 104,104 101,112 99,112" fill="#2F7FB3" opacity="0.5" />

          {/* Blueprint detail — collar lines */}
          <line x1="88" y1="104" x2="84" y2="114" stroke="#2F7FB3" strokeWidth="0.6" opacity="0.4" />
          <line x1="112" y1="104" x2="116" y2="114" stroke="#2F7FB3" strokeWidth="0.6" opacity="0.4" />
        </g>

        {/* Corner crosshairs — static */}
        {[
          [26, 26], [174, 26], [26, 174], [174, 174]
        ].map(([cx, cy], i) => (
          <g key={i} opacity="0.3">
            <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke="#2F7FB3" strokeWidth="0.8" />
            <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke="#2F7FB3" strokeWidth="0.8" />
          </g>
        ))}

        {/* Scanning line animation */}
        <line x1="30" y1="100" x2="170" y2="100" stroke="#2F7FB3" strokeWidth="0.5" opacity="0.15">
          <animate attributeName="y1" values="30;170;30" dur="6s" repeatCount="indefinite" />
          <animate attributeName="y2" values="30;170;30" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.3;0" dur="6s" repeatCount="indefinite" />
        </line>

        {/* Small decorative dots */}
        <circle cx="42" cy="100" r="2" fill="#2F7FB3" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="158" cy="100" r="2" fill="#2F7FB3" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1s" />
        </circle>
      </svg>

      {/* Bottom label */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <span className="text-[8px] uppercase tracking-[0.3em] text-[#2F7FB3] opacity-50 font-mono">
          ARCH-002
        </span>
      </div>
    </div>
  );
}
