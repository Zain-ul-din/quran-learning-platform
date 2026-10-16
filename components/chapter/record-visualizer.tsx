"use client";

import { useEffect, useRef } from "react";
import { cn } from "cn";
import { getAudioContext, isAudioSupported } from "voice-glow";

type RecordVisualizerProps = {
  /** The microphone stream to analyse. */
  stream: MediaStream | null;
  /** Bars track the voice while true; they settle into a rest pose otherwise. */
  active?: boolean;
  /** How many bars to draw. */
  bars?: number;
  className?: string;
};

/** Height of a bar in silence, as a fraction of the container. */
const REST_LEVEL = 0.16;

/**
 * A small equalizer for the record button.
 *
 * It reads the live spectrum through an `AnalyserNode` and writes bar
 * transforms straight to the DOM on every animation frame, so the visualizer
 * never re-renders React while the user is speaking.
 */
export function RecordVisualizer({
  stream,
  active = true,
  bars = 7,
  className,
}: RecordVisualizerProps) {
  const nodesRef = useRef<Array<HTMLSpanElement | null>>([]);
  const levelsRef = useRef<number[]>([]);

  useEffect(() => {
    const nodes = nodesRef.current.filter(
      (node): node is HTMLSpanElement => node !== null,
    );
    if (nodes.length === 0) return;

    const levels = levelsRef.current;
    levels.length = nodes.length;

    const paint = (index: number, level: number) => {
      nodes[index].style.transform = `scaleY(${level.toFixed(3)})`;
    };

    // Rest pose — a soft, even ridge so the control never looks dead.
    if (!active || !stream || !isAudioSupported()) {
      nodes.forEach((_, index) =>
        paint(index, REST_LEVEL + (index % 2 === 0 ? 0 : 0.07)),
      );
      return;
    }

    const context = getAudioContext();
    if (!context) return;
    void context.resume();

    let source: MediaStreamAudioSourceNode;
    let analyser: AnalyserNode;
    try {
      source = context.createMediaStreamSource(stream);
      analyser = context.createAnalyser();
    } catch (err) {
      console.error("record-visualizer: could not analyse the stream", err);
      return;
    }

    // Never connected to the destination — analysed, never played back.
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);

    const spectrum = new Uint8Array(analyser.frequencyBinCount);
    // Voice lives in the low bins; only use the first half of the spectrum.
    const usable = Math.max(1, Math.floor(spectrum.length * 0.5));

    let frame = 0;
    let tick = 0;

    const render = () => {
      tick += 1;
      analyser.getByteFrequencyData(spectrum);

      // Slow sine breathing under the voice, so silence still moves a little.
      const breathe = REST_LEVEL + 0.05 * Math.sin(tick / 26);

      for (let index = 0; index < nodes.length; index += 1) {
        const from = Math.floor((index / nodes.length) * usable);
        const to = Math.max(
          from + 1,
          Math.min(usable, Math.floor(((index + 1) / nodes.length) * usable)),
        );

        let sum = 0;
        for (let bin = from; bin < to; bin += 1) sum += spectrum[bin];

        const raw = sum / (to - from) / 255;
        const target = Math.max(
          breathe * (1 + 0.2 * Math.sin(tick / 19 + index)),
          Math.min(1, Math.pow(raw, 1.15) * 1.9),
        );

        // Fast attack, slow release — bars snap up and fall back smoothly.
        const previous = levels[index] ?? REST_LEVEL;
        const next =
          previous + (target - previous) * (target > previous ? 0.5 : 0.14);
        levels[index] = next;
        paint(index, next);
      }

      frame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      analyser.disconnect();
    };
  }, [stream, active, bars]);

  return (
    <span
      aria-hidden
      className={cn(
        "flex h-5 items-center justify-center gap-[3px] will-change-transform",
        className,
      )}
    >
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          ref={(node) => {
            nodesRef.current[index] = node;
          }}
          style={{ transform: `scaleY(${REST_LEVEL})` }}
          className="h-full w-[3px] origin-center rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.55)]"
        />
      ))}
    </span>
  );
}
