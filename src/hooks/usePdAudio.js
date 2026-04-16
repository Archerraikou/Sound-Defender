import { useRef } from "react";
import { Browser as WebPdRuntime } from "webpd";

const JUDGEMENT_FREQS = {
  perfect: 880,
  great: 660,
  good: 440,
  bad: 294,
  miss: 185,
};

const NOTE_DURATION_MS = 160;

export function usePdAudio() {
  const audioCtxRef = useRef(null);
  const pdNodeRef = useRef(null);
  const patchRef = useRef(null);
  const gateTimeoutRef = useRef(null);

  const init = async () => {
    if (audioCtxRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    await WebPdRuntime.initialize(audioCtx);

    const response = await fetch("/hit-sounds.wasm");
    patchRef.current = await response.arrayBuffer();
  };

  const ensureStarted = async () => {
    if (pdNodeRef.current) return;

    const audioCtx = audioCtxRef.current;
    if (!audioCtx || !patchRef.current) return;

    if (audioCtx.state === "suspended") await audioCtx.resume();

    const node = await WebPdRuntime.run(
      audioCtx,
      patchRef.current,
      WebPdRuntime.defaultSettingsForRun("/hit-sounds.wasm"),
    );
    node.connect(audioCtx.destination);
    pdNodeRef.current = node;
  };

  const send = (nodeId, value) => {
    pdNodeRef.current?.port.postMessage({
      type: "io:messageReceiver",
      payload: { nodeId, portletId: "0", message: [value] },
    });
  };

  const playJudgement = async (type) => {
    await ensureStarted();
    if (!pdNodeRef.current) return;

    const freq = JUDGEMENT_FREQS[type.toLowerCase()] ?? 440;

    // Clear any previous gate-off timeout so overlapping hits don't cut each other
    if (gateTimeoutRef.current) clearTimeout(gateTimeoutRef.current);

    send("n_0_0", freq); // set frequency
    send("n_0_1", 1);    // open gate

    gateTimeoutRef.current = setTimeout(() => {
      send("n_0_1", 0);  // close gate
    }, NOTE_DURATION_MS);
  };

  return { init, playJudgement };
}