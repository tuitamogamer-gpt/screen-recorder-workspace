import { useCallback, useEffect, useRef, useState } from "react";

export interface ScreenRecording {
  url: string;
  blob: Blob;
  duration: number;
  name: string;
}

export interface RecordingOptions {
  microphone?: boolean;
  camera?: boolean;
}

const recorderMimeType = () =>
  [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));

function recordingError(error: unknown): string {
  if (error instanceof DOMException) {
    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    ) {
      return "Screen sharing was cancelled or permission was denied. Try again and choose a screen, window, or tab.";
    }
    if (error.name === "NotFoundError")
      return "No screen or microphone was available to record.";
    if (error.name === "NotReadableError") {
      return "Your screen or microphone could not be accessed. Check your browser and system permissions, then try again.";
    }
    if (error.name === "AbortError")
      return "Screen recording was interrupted. Please try again.";
  }
  return error instanceof Error
    ? error.message
    : "Recording could not start. Please try again.";
}

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<ScreenRecording | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamsRef = useRef<MediaStream[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);
  const recordingUrlRef = useRef<string | null>(null);

  const durationNow = useCallback(() => {
    return (
      accumulatedRef.current +
      (startedAtRef.current
        ? (performance.now() - startedAtRef.current) / 1000
        : 0)
    );
  }, []);

  const releaseDevices = useCallback(() => {
    const streams = streamsRef.current;
    streamsRef.current = [];
    for (const stream of streams) {
      for (const track of stream.getTracks()) {
        track.onended = null;
        track.stop();
      }
    }
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed")
      void audioContext.close().catch(() => {});
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    accumulatedRef.current = durationNow();
    startedAtRef.current = 0;
    recorder.stop();
    releaseDevices();
    if (mountedRef.current) {
      setElapsed(accumulatedRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [durationNow, releaseDevices]);

  const startRecording = useCallback(
    async (options: RecordingOptions = {}) => {
      if (startingRef.current || recorderRef.current) return;
      setError(null);
      if (
        !navigator.mediaDevices?.getDisplayMedia ||
        typeof MediaRecorder === "undefined"
      ) {
        setError(
          "Screen recording is not available in this browser. Open this app in a desktop version of Chrome, Edge, or Firefox.",
        );
        return;
      }

      startingRef.current = true;
      try {
        const display = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 30, max: 60 } },
          audio: true,
        });
        streamsRef.current.push(display);
        if (!mountedRef.current) {
          releaseDevices();
          return;
        }

        let microphone: MediaStream | undefined;
        if (options.microphone) {
          microphone = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          });
          streamsRef.current.push(microphone);
        }
        if (!mountedRef.current) {
          releaseDevices();
          return;
        }
        if (
          display.getVideoTracks().every((track) => track.readyState !== "live")
        ) {
          throw new Error(
            "Screen sharing ended before recording could start. Please try again.",
          );
        }

        const audioStreams = [display, microphone].filter(
          (stream): stream is MediaStream => !!stream?.getAudioTracks().length,
        );
        const output = new MediaStream(display.getVideoTracks());
        if (audioStreams.length > 1) {
          const context = new AudioContext();
          audioContextRef.current = context;
          const destination = context.createMediaStreamDestination();
          for (const stream of audioStreams)
            context.createMediaStreamSource(stream).connect(destination);
          await context.resume();
          if (!mountedRef.current) {
            releaseDevices();
            return;
          }
          for (const track of destination.stream.getAudioTracks())
            output.addTrack(track);
        } else if (audioStreams.length === 1) {
          for (const track of audioStreams[0].getAudioTracks())
            output.addTrack(track);
        }
        streamsRef.current.push(output);
        const mimeType = recorderMimeType();
        const recorder = new MediaRecorder(output, {
          ...(mimeType ? { mimeType } : {}),
          videoBitsPerSecond: 8_000_000,
        });
        const chunks: BlobPart[] = [];
        recorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => {
          const duration = durationNow();
          accumulatedRef.current = duration;
          startedAtRef.current = 0;
          releaseDevices();
          recorderRef.current = null;
          if (!mountedRef.current) return;
          setIsRecording(false);
          setIsPaused(false);
          if (!chunks.length) {
            setError("The recording was empty. Please try recording again.");
            return;
          }
          const blob = new Blob(chunks, {
            type: recorder.mimeType || "video/webm",
          });
          const url = URL.createObjectURL(blob);
          if (recordingUrlRef.current)
            URL.revokeObjectURL(recordingUrlRef.current);
          recordingUrlRef.current = url;
          setRecording({
            url,
            blob,
            duration: Math.max(0.1, duration),
            name: "Screen recording",
          });
        };
        recorder.onerror = () => {
          if (mountedRef.current)
            setError(
              "The browser encountered a recording error. Your captured footage will be saved if available.",
            );
          stopRecording();
        };
        for (const track of display.getVideoTracks())
          track.onended = stopRecording;
        accumulatedRef.current = 0;
        startedAtRef.current = performance.now();
        recorder.start(1000);
        setElapsed(0);
        setIsPaused(false);
        setIsRecording(true);
      } catch (cause) {
        releaseDevices();
        recorderRef.current = null;
        if (mountedRef.current) setError(recordingError(cause));
      } finally {
        startingRef.current = false;
      }
    },
    [durationNow, releaseDevices, stopRecording],
  );

  const togglePause = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") {
      accumulatedRef.current = durationNow();
      startedAtRef.current = 0;
      recorder.pause();
      setElapsed(accumulatedRef.current);
      setIsPaused(true);
    } else if (recorder?.state === "paused") {
      startedAtRef.current = performance.now();
      recorder.resume();
      setIsPaused(false);
    }
  }, [durationNow]);

  useEffect(() => {
    if (!isRecording || isPaused) return;
    const timer = window.setInterval(() => setElapsed(durationNow()), 100);
    return () => window.clearInterval(timer);
  }, [durationNow, isRecording, isPaused]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const recorder = recorderRef.current;
      if (recorder) {
        recorder.onstop = null;
        recorder.ondataavailable = null;
        recorder.onerror = null;
        if (recorder.state !== "inactive") recorder.stop();
        recorderRef.current = null;
      }
      releaseDevices();
      if (recordingUrlRef.current) URL.revokeObjectURL(recordingUrlRef.current);
    };
  }, [releaseDevices]);

  const clearError = useCallback(() => setError(null), []);
  return {
    isRecording,
    isPaused,
    elapsed,
    error,
    startRecording,
    stopRecording,
    togglePause,
    clearError,
    recording,
  };
}
