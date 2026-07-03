import "./index.css";
import { Composition } from "remotion";
import { SpidersilkPromo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SpidersilkPromo"
        component={SpidersilkPromo}
        durationInFrames={540}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
