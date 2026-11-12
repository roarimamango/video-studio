import { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type Caption, type TikTokPage } from "@remotion/captions";

// How many ms of words are grouped onto one caption "page"
const COMBINE_MS = 1200;

export const Captions: React.FC<{ src: string }> = ({ src }) => {
  const { fps } = useVideoConfig();
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender("Loading captions"));

  useEffect(() => {
    fetch(src)
      .then((r) => r.json())
      .then((data: Caption[]) => {
        setCaptions(data);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [src, handle]);

  const pages = useMemo(
    () => (captions ? createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: COMBINE_MS }).pages : []),
    [captions],
  );

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = Math.round((page.startMs / 1000) * fps);
        const endMs = next ? Math.min(next.startMs, page.startMs + COMBINE_MS * 2) : page.startMs + COMBINE_MS * 2;
        const duration = Math.max(1, Math.round(((endMs - page.startMs) / 1000) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={duration} layout="none">
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame(); // relative to the Sequence start
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 120 }}>
      <div
        style={{
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 72,
          whiteSpace: "pre",
          textShadow: "0 4px 16px rgba(0,0,0,0.8)",
          WebkitTextStroke: "3px black",
          paintOrder: "stroke",
        }}
      >
        {page.tokens.map((t, i) => {
          const active = nowMs >= t.fromMs && nowMs < t.toMs;
          return (
            <span key={i} style={{ color: active ? "#ffd400" : "white" }}>
              {t.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
