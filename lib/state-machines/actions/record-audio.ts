import { fromCallback } from "xstate";

export const recordAudio = fromCallback<
  | { type: "audio.recoded"; blob: Blob }
  | { type: "audio.permissionGranted" }
  | { type: "audio.error"; error: unknown }
  | { type: "audio.stream"; stream: MediaStream | null }
  | { type: "audio.elapsedMs"; elapsedMs: number }
  | { type: "STOP" },
  { mimeType?: string },
  { type: "STOP" }
>(({ sendBack, receive, input }) => {
  let stream: MediaStream | null = null;
  let recorder: MediaRecorder | null = null;
  let canceled = false;

  const chunks: Blob[] = [];

  const stopTracks = () => {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  };

  const readMicPermission = async (): Promise<PermissionState | "unknown"> => {
    try {
      const status = await navigator.permissions.query({ name: "microphone" });
      return status.state;
    } catch {
      return "unknown";
    }
  };

  async function start() {
    try {
      const permissionBefore = await readMicPermission();

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const permissionAfter = await readMicPermission();

      if (canceled) {
        stopTracks();
        return;
      }

      if (permissionBefore !== "granted" && permissionAfter === "granted") {
        stopTracks();
        return sendBack({ type: "audio.permissionGranted" });
      }

      sendBack({ type: "audio.stream", stream });

      recorder = new MediaRecorder(
        stream,
        input.mimeType
          ? {
              mimeType: input.mimeType,
            }
          : undefined,
      );

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        stream?.getTracks().forEach((track) => track.stop());

        if (!canceled) {
          sendBack({
            type: "audio.recoded",
            blob: new Blob(chunks, { type: recorder?.mimeType }),
          });
        }
      };

      recorder.onerror = (event) => {
        sendBack({
          type: "audio.error",
          error: event.error?.message ?? "Something went wrong! Try Again",
        });
      };

      recorder.start();
    } catch (err) {
      console.error(err);
      sendBack({
        type: "audio.error",
        error: "Microphone permission denied or unavailable",
      });
    }
  }

  const calculateElapsedTime = () => {
    const startTime = +new Date();
    const id = window.setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      sendBack({ type: "audio.elapsedMs", elapsedMs: elapsedMs });
    }, 250);
    return id;
  };

  receive((event) => {
    if (event.type === "STOP" && recorder?.state === "recording")
      recorder?.stop();
  });

  start();
  const intervalId = calculateElapsedTime();

  return () => {
    clearInterval(intervalId);
    canceled = true;
    if (recorder && recorder?.state === "recording") recorder.stop();
    stream?.getTracks().forEach((track) => track.stop());
  };
});
