/**
 * Purely decorative -- a fixed layer sitting behind the real UI: soft
 * sun rays streaming down, a dense tree-line of rippled-edge seaweed
 * rooted behind a rocky ground band. Never intercepts clicks
 * (pointer-events: none) and never affects page layout (position:
 * fixed, taken out of normal flow entirely).
 */

interface BladeConfig {
  offsetX: number;
  height: number;
  baseWidth: number;
  lean: number;
  rippleAmplitude: number;
  rippleFrequency: number;
  fill: string;
  vein: string;
}

const GROUND_Y = 150;

function buildBladePath(config: BladeConfig): string {
  const { height, baseWidth, lean, rippleAmplitude, rippleFrequency } = config;
  const steps = 20;
  const rightPoints: string[] = [];
  const leftPoints: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -t * height;
    const taper = 1 - t * 0.8;
    const ripple = 1 + rippleAmplitude * Math.sin(t * rippleFrequency * Math.PI);
    const halfWidth = (baseWidth / 2) * taper * ripple;
    const centerX = lean * Math.sin(t * Math.PI);

    rightPoints.push(`${(centerX + halfWidth).toFixed(1)} ${y.toFixed(1)}`);
    leftPoints.push(`${(centerX - halfWidth).toFixed(1)} ${y.toFixed(1)}`);
  }

  return `M ${rightPoints.join(" L ")} L ${[...leftPoints].reverse().join(" L ")} Z`;
}

function buildVeinPath(config: BladeConfig): string {
  const { height, lean } = config;
  const steps = 20;
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = -t * height;
    const centerX = lean * Math.sin(t * Math.PI);
    points.push(`${centerX.toFixed(1)} ${y.toFixed(1)}`);
  }

  return `M ${points.join(" L ")}`;
}

function buildRockyEdgePath(width: number, height: number): string {
  const steps = 80;
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * width;
    const y =
      height * 0.4 +
      Math.sin(t * 14 * Math.PI) * height * 0.18 +
      Math.sin(t * 37 * Math.PI + 1.3) * height * 0.08;
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }

  return `M 0 ${height} L ${points.join(" L ")} L ${width} ${height} Z`;
}

function RockGround() {
  const path = buildRockyEdgePath(400, 100);

  return (
    <svg className="rock-ground" viewBox="0 0 400 100" preserveAspectRatio="none">
      <path d={path} fill="#8a8a7d" stroke="#5c5c52" strokeWidth="1.5" />
    </svg>
  );
}

function SeaweedClump({ index, total }: { index: number; total: number }) {
  const left = (index / total) * 96 + 2;
  const scale = 0.8 + ((index * 3) % 5) / 10;
  const swayDuration = 5 + (index % 4);
  const swayDelay = (index * 0.5) % 3;

  const blades: BladeConfig[] = [
    {
      offsetX: 45,
      height: 100,
      baseWidth: 24,
      lean: -16,
      rippleAmplitude: 0.16,
      rippleFrequency: 3,
      fill: "#3f9142",
      vein: "#2b6b2f",
    },
    {
      offsetX: 70,
      height: 120,
      baseWidth: 28,
      lean: 5,
      rippleAmplitude: 0.14,
      rippleFrequency: 3.5,
      fill: "#8fd66b",
      vein: "#5fae4a",
    },
    {
      offsetX: 95,
      height: 100,
      baseWidth: 24,
      lean: 18,
      rippleAmplitude: 0.18,
      rippleFrequency: 2.5,
      fill: "#5aa84a",
      vein: "#3d7a34",
    },
  ];

  return (
    <div
      className="seaweed-clump-outer"
      style={{ left: `${left}%`, transform: `translateX(-50%) scale(${scale})` }}
    >
      <div
        className="seaweed-clump-inner"
        style={{ animationDuration: `${swayDuration}s`, animationDelay: `${swayDelay}s` }}
      >
        <svg className="seaweed-svg" viewBox="0 0 140 170">
          {blades.map((blade, i) => (
            <g key={i} transform={`translate(${blade.offsetX}, ${GROUND_Y})`}>
              <path
                d={buildBladePath(blade)}
                fill={blade.fill}
                stroke="#1a2e1a"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path d={buildVeinPath(blade)} fill="none" stroke={blade.vein} strokeWidth="1.5" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

interface RayConfig {
  width: number;
  rotate: number;
  duration: number;
  delay: number;
}

function SunRay({ config }: { config: RayConfig }) {
  return (
    <div
      className="sun-ray"
      style={{
        width: `${config.width}px`,
        transform: `translateX(-50%) rotate(${config.rotate}deg)`,
        animationDuration: `${config.duration}s`,
        animationDelay: `${config.delay}s`,
      }}
    />
  );
}

function SunRays() {
  const rayCount = 5;
  const spread = 70; // total degrees the whole fan covers, tip to tip

  const rays: RayConfig[] = Array.from({ length: rayCount }, (_, i) => ({
    width: 90 + ((i * 23) % 60),
    rotate: -spread / 2 + (spread / (rayCount - 1)) * i,
    duration: 6 + (i % 3) * 2,
    delay: i * 0.8,
  }));

  return (
    <div className="sun-rays">
      {rays.map((ray, i) => (
        <SunRay key={i} config={ray} />
      ))}
    </div>
  );
}

interface FishConfig {
  top: number;
  left: number;
  size: number;
  flip: boolean;
  color: string;
}

/** A simple fish silhouette: an oval body, a triangular tail, and an
 * eye. Deliberately static -- no animation -- unlike the seaweed and
 * sun rays, which is exactly what makes it feel like a still, ambient
 * background detail rather than something competing for attention. */
function Fish({ config }: { config: FishConfig }) {
  return (
    <svg
      className="fish"
      style={{
        top: `${config.top}%`,
        left: `${config.left}%`,
        width: `${config.size}px`,
        transform: config.flip ? "scaleX(-1)" : undefined,
      }}
      viewBox="0 0 60 30"
    >
      <path d="M20 15 L5 6 Q-2 15 5 24 Z" fill={config.color} />
      <ellipse cx="35" cy="15" rx="20" ry="10" fill={config.color} />
      <circle cx="48" cy="12" r="2" fill="#0a2e1a" />
    </svg>
  );
}

function FishSchool() {
  const fishCount = 12;

  const fishList: FishConfig[] = Array.from({ length: fishCount }, (_, i) => ({
    top: 10 + ((i * 16) % 55), // scattered through the upper/mid water, above the kelp
    left: (i / fishCount) * 110 + ((i * 7) % 8),
    size: 26 + ((i * 14) % 20),
    flip: i % 2 === 0,
    color: ["#40efff", "#e8846b", "#4cffd5", "#9191ff", "#fff475"][i % 5],
  }));

  return (
    <div className="fish-school">
      {fishList.map((fish, i) => (
        <Fish key={i} config={fish} />
      ))}
    </div>
  );
}

export function OceanBackground() {
  const clumpCount = 22;

  return (
    <div className="ocean-background" aria-hidden="true">
      <div className="ocean-glow" />
      <SunRays />
      <FishSchool />

      <div className="seaweed-row">
        {Array.from({ length: clumpCount }, (_, i) => (
          <SeaweedClump key={i} index={i} total={clumpCount} />
        ))}
      </div>

      <RockGround />
    </div>
  );
}