"use client";

/**
 * RemotionHeroPlayer — lazy-loaded Remotion Player for the hero.
 *
 * Separated into its own file so the Remotion Player bundle is
 * only loaded when the animation is actually rendered (not SSR).
 */

import { Player } from "@remotion/player";
import {
  KitchenTransformation,
  type KitchenTransformationProps,
} from "./remotion/KitchenTransformation";

const FPS = 30;
const DURATION_SECONDS = 6;

interface RemotionHeroPlayerProps {
  inputProps: KitchenTransformationProps;
}

export default function RemotionHeroPlayer({ inputProps }: RemotionHeroPlayerProps) {
  return (
    <Player
      component={KitchenTransformation}
      inputProps={inputProps}
      durationInFrames={DURATION_SECONDS * FPS}
      fps={FPS}
      compositionWidth={1280}
      compositionHeight={720}
      loop
      autoPlay
      controls={false}
      style={{
        width: "100%",
        height: "100%",
      }}
      // No click-to-play — it's a background hero
      clickToPlay={false}
      // Accessibility: muted, no audio
      spaceKeyToPlayOrPause={false}
    />
  );
}
