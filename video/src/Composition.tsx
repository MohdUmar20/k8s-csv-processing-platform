import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  ink: "#111111",
  paper: "#fffdf3",
  yellow: "#fff1a8",
  pink: "#ff4fa3",
  cyan: "#73e8ff",
  green: "#7ef29a",
  red: "#ff665a",
  blue: "#2f6bff",
  white: "#ffffff",
};

const products = [
  ["211627629", "Purple Safi Kaftan", "4900.0000"],
  ["211627628", "Multi-coloured Gilet Abaya", "4900.0000"],
  ["211624698", "Black Embroidered Tulle Ball Gown", "9600.0000"],
  ["211621978", "Black Corset Dress", "13900.0000"],
];

const stack = [
  "FastAPI upload UI",
  "CSV parser + validation",
  "S3 processed file archive",
  "Docker + Helm workload",
  "kOps reference cluster",
];

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easePunch = Easing.bezier(0.34, 1.56, 0.64, 1);

const enter = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: easeOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const exit = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const stage: React.CSSProperties = {
  backgroundColor: palette.yellow,
  backgroundImage: `linear-gradient(90deg, rgba(17,17,17,.10) 2px, transparent 2px), linear-gradient(rgba(17,17,17,.10) 2px, transparent 2px)`,
  backgroundSize: "42px 42px",
  color: palette.ink,
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  overflow: "hidden",
};

const shadow = (size = 14) => `${size}px ${size}px 0 ${palette.ink}`;

const Badge: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, color = palette.cyan, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      border: `6px solid ${palette.ink}`,
      background: color,
      boxShadow: shadow(10),
      color: palette.ink,
      fontSize: 30,
      fontWeight: 950,
      lineHeight: 1,
      padding: "18px 22px",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

const BigTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontSize: 116,
      fontWeight: 1000,
      letterSpacing: 0,
      lineHeight: 0.9,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

const ScreenshotCard: React.FC<{
  src: string;
  label: string;
  frame: number;
  start: number;
  rotate?: number;
  x?: number;
  y?: number;
  w?: number;
}> = ({ src, label, frame, start, rotate = 0, x = 0, y = 0, w = 1040 }) => {
  const p = enter(frame, start, 24);
  const bob = Math.sin((frame - start) / 18) * 5;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        border: `8px solid ${palette.ink}`,
        background: palette.white,
        boxShadow: shadow(18),
        transform: `translate(${interpolate(p, [0, 1], [90, 0])}px, ${interpolate(
          p,
          [0, 1],
          [60, bob],
        )}px) rotate(${rotate}deg)`,
        opacity: p,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          height: 54,
          padding: "0 16px",
          borderBottom: `6px solid ${palette.ink}`,
          background: palette.green,
          fontSize: 22,
          fontWeight: 950,
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: 18, height: 18, borderRadius: 99, background: palette.red, border: `4px solid ${palette.ink}` }} />
        <span style={{ width: 18, height: 18, borderRadius: 99, background: palette.yellow, border: `4px solid ${palette.ink}` }} />
        <span style={{ width: 18, height: 18, borderRadius: 99, background: palette.cyan, border: `4px solid ${palette.ink}` }} />
        <span style={{ marginLeft: 12 }}>{label}</span>
      </div>
      <Img src={staticFile(src)} style={{ display: "block", width: "100%" }} />
    </div>
  );
};

const ProductRows: React.FC<{ frame: number; start: number }> = ({ frame, start }) => {
  return (
    <div
      style={{
        position: "absolute",
        right: 112,
        top: 270,
        width: 650,
      }}
    >
      {products.map((product, index) => {
        const p = enter(frame, start + index * 8, 18);
        return (
          <div
            key={product[0]}
            style={{
              display: "grid",
              gridTemplateColumns: "145px 1fr 150px",
              gap: 12,
              alignItems: "center",
              marginBottom: 18,
              padding: "18px 20px",
              border: `6px solid ${palette.ink}`,
              background: index % 2 === 0 ? palette.white : palette.cyan,
              boxShadow: shadow(10),
              fontSize: 24,
              fontWeight: 900,
              opacity: p,
              transform: `translateX(${interpolate(p, [0, 1], [120, 0])}px) rotate(${interpolate(
                p,
                [0, 1],
                [3, 0],
              )}deg)`,
            }}
          >
            <span>{product[0]}</span>
            <span>{product[1]}</span>
            <span style={{ textAlign: "right", background: palette.green, border: `4px solid ${palette.ink}`, padding: "8px" }}>
              {product[2]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const CalloutStack: React.FC<{ frame: number; start: number }> = ({ frame, start }) => (
  <div style={{ position: "absolute", left: 110, top: 230, width: 590 }}>
    {stack.map((item, index) => {
      const p = enter(frame, start + index * 10, 20);
      return (
        <div
          key={item}
          style={{
            marginBottom: 22,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: p,
            transform: `translateX(${interpolate(p, [0, 1], [-80, 0])}px)`,
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              border: `6px solid ${palette.ink}`,
              background: [palette.pink, palette.cyan, palette.green, palette.red, palette.blue][index],
              boxShadow: shadow(8),
              fontSize: 28,
              fontWeight: 1000,
              display: "grid",
              placeItems: "center",
            }}
          >
            {index + 1}
          </div>
          <div
            style={{
              flex: 1,
              border: `6px solid ${palette.ink}`,
              background: palette.paper,
              boxShadow: shadow(8),
              padding: "16px 20px",
              fontSize: 32,
              fontWeight: 950,
              textTransform: "uppercase",
            }}
          >
            {item}
          </div>
        </div>
      );
    })}
  </div>
);

const SceneOne = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 36) - exit(frame, 126, 20);
  const punch = interpolate(frame, [18, 45], [0, 1], {
    easing: easePunch,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ ...stage, opacity: p }}>
      <div
        style={{
          position: "absolute",
          left: 95,
          top: 92,
          transform: `translateY(${interpolate(p, [0, 1], [70, 0])}px)`,
        }}
      >
        <Badge color={palette.green}>SpiderSilk project reel</Badge>
        <BigTitle style={{ width: 960, marginTop: 48 }}>
          K8s CSV
          <br />
          Processing
          <br />
          Platform
        </BigTitle>
        <div
          style={{
            width: 760,
            marginTop: 30,
            fontSize: 42,
            fontWeight: 850,
            lineHeight: 1.1,
          }}
        >
          Upload fashion product CSVs, validate rows, archive source files to S3, and ship it as a Kubernetes-ready workload.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 95,
          top: 150,
          width: 640,
          height: 640,
          border: `9px solid ${palette.ink}`,
          background: palette.pink,
          boxShadow: shadow(22),
          transform: `rotate(${interpolate(punch, [0, 1], [9, -4])}deg) scale(${interpolate(
            punch,
            [0, 1],
            [0.85, 1],
          )})`,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile("project-banner-candidate.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "saturate(1.15) contrast(1.05)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const SceneTwo = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 22) - exit(frame, 126, 22);
  return (
    <AbsoluteFill style={{ ...stage, opacity: p }}>
      <Badge color={palette.pink} style={{ position: "absolute", left: 96, top: 82 }}>
        Step 01 / Upload
      </Badge>
      <BigTitle style={{ position: "absolute", left: 96, top: 170, fontSize: 88, width: 660 }}>
        CSV input, built for review
      </BigTitle>
      <ScreenshotCard src="app-upload-dashboard.png" label="upload dashboard" frame={frame} start={12} x={720} y={135} w={1045} rotate={-2} />
      <div
        style={{
          position: "absolute",
          left: 112,
          bottom: 120,
          width: 590,
          border: `8px solid ${palette.ink}`,
          background: palette.white,
          boxShadow: shadow(16),
          padding: 32,
          fontSize: 38,
          fontWeight: 900,
          lineHeight: 1.08,
          transform: `translateY(${interpolate(enter(frame, 48, 20), [0, 1], [90, 0])}px)`,
          opacity: enter(frame, 48, 20),
        }}
      >
        Three columns only: product ID, product name, numeric value. Clear errors before anything reaches storage.
      </div>
    </AbsoluteFill>
  );
};

const SceneThree = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 22) - exit(frame, 126, 22);
  return (
    <AbsoluteFill style={{ ...stage, opacity: p }}>
      <ScreenshotCard src="app-processed-result.png" label="processed result" frame={frame} start={5} x={95} y={120} w={1000} rotate={1.5} />
      <Badge color={palette.green} style={{ position: "absolute", right: 112, top: 90 }}>
        Product details
      </Badge>
      <BigTitle style={{ position: "absolute", right: 112, top: 165, width: 650, fontSize: 82 }}>
        Parsed rows, visible proof
      </BigTitle>
      <ProductRows frame={frame} start={34} />
    </AbsoluteFill>
  );
};

const SceneFour = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 22) - exit(frame, 126, 22);
  return (
    <AbsoluteFill style={{ ...stage, opacity: p }}>
      <CalloutStack frame={frame} start={14} />
      <ScreenshotCard src="spidersilk-architecture.png" label="architecture" frame={frame} start={20} x={800} y={115} w={970} rotate={-1.2} />
      <Badge color={palette.red} style={{ position: "absolute", left: 120, bottom: 94 }}>
        S3 + Docker + Helm + kOps
      </Badge>
    </AbsoluteFill>
  );
};

const SceneFive = () => {
  const frame = useCurrentFrame();
  const p = enter(frame, 0, 22);
  const pulse = Math.sin(frame / 8) * 8;
  return (
    <AbsoluteFill style={{ ...stage, opacity: p }}>
      <div
        style={{
          position: "absolute",
          inset: 86,
          border: `10px solid ${palette.ink}`,
          background: palette.paper,
          boxShadow: shadow(24),
          padding: 68,
        }}
      >
        <Badge color={palette.cyan}>Final frame</Badge>
        <BigTitle style={{ marginTop: 42, fontSize: 122 }}>
          From CSV
          <br />
          to cloud-ready
          <br />
          evidence.
        </BigTitle>
        <div
          style={{
            position: "absolute",
            right: 76,
            bottom: 76,
            border: `8px solid ${palette.ink}`,
            background: palette.pink,
            boxShadow: shadow(16),
            padding: "30px 36px",
            fontSize: 42,
            fontWeight: 1000,
            textTransform: "uppercase",
            transform: `rotate(-2deg) translateY(${pulse}px)`,
          }}
        >
            K8s CSV Platform
          </div>
        <div
          style={{
            position: "absolute",
            right: 100,
            top: 118,
            width: 420,
            height: 420,
            border: `8px solid ${palette.ink}`,
            background: palette.green,
            boxShadow: shadow(18),
            transform: "rotate(5deg)",
            display: "grid",
            placeItems: "center",
            fontSize: 112,
            fontWeight: 1000,
          }}
        >
          CSV
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SpidersilkPromo = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={5 * fps}>
        <SceneOne />
      </Sequence>
      <Sequence from={4 * fps} durationInFrames={5 * fps}>
        <SceneTwo />
      </Sequence>
      <Sequence from={8 * fps} durationInFrames={5 * fps}>
        <SceneThree />
      </Sequence>
      <Sequence from={12 * fps} durationInFrames={5 * fps}>
        <SceneFour />
      </Sequence>
      <Sequence from={16 * fps} durationInFrames={2 * fps}>
        <SceneFive />
      </Sequence>
    </AbsoluteFill>
  );
};
