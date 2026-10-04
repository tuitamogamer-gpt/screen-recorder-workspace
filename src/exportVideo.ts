export interface RenderVideoOptions {
  sourceUrl?: string | null;
  demoImageUrl?: string;
  duration: number;
  background: string;
  /** Editor slider value; frame inset is padding / 12 percent of output width. */
  padding: number;
  /** Pixels measured against a 700px-wide editor preview. */
  borderRadius: number;
  shadow: boolean | number;
  aspectRatio: string | number;
  /** Longest output dimension; defaults to 1280, up to 1920. */
  resolution?: number;
  /** Audio gain from 0 (silent) to 1 (original volume). */
  volume?: number;
  /** Apply the preview's smooth 1.12× zoom between one third and 56% of the clip. */
  autoZoom?: boolean;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

type CapturableVideo = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

function aborted() {
  return new DOMException("Video export was cancelled.", "AbortError");
}

function checkAbort(signal?: AbortSignal) {
  if (signal?.aborted) throw aborted();
}

function loadMedia(
  element: HTMLVideoElement | HTMLImageElement,
  url: string,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const successEvent =
      element instanceof HTMLVideoElement ? "loadeddata" : "load";
    const cleanup = () => {
      element.removeEventListener(successEvent, loaded);
      element.removeEventListener("error", failed);
      signal?.removeEventListener("abort", cancelled);
      window.clearTimeout(timeout);
    };
    const loaded = () => {
      cleanup();
      resolve();
    };
    const failed = () => {
      cleanup();
      reject(
        new Error(
          "The source recording could not be loaded. Try importing the video again.",
        ),
      );
    };
    const cancelled = () => {
      cleanup();
      reject(aborted());
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("The video took too long to load. Please try again."));
    }, 20_000);
    element.addEventListener(successEvent, loaded, { once: true });
    element.addEventListener("error", failed, { once: true });
    signal?.addEventListener("abort", cancelled, { once: true });
    element.src = url;
    if (signal?.aborted) cancelled();
  });
}

function gradientParts(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let from = 0;
  for (let index = 0; index < value.length; index++) {
    if (value[index] === "(") depth++;
    if (value[index] === ")") depth--;
    if (value[index] === "," && depth === 0) {
      parts.push(value.slice(from, index).trim());
      from = index + 1;
    }
  }
  parts.push(value.slice(from).trim());
  return parts;
}

function paintBackground(
  context: CanvasRenderingContext2D,
  value: string,
  width: number,
  height: number,
) {
  const gradientMatch = value.match(/^(linear|radial)-gradient\((.*)\)$/s);
  if (!gradientMatch) {
    context.fillStyle = "#d9b7ed";
    if (CSS.supports("color", value)) context.fillStyle = value;
    context.fillRect(0, 0, width, height);
    return;
  }
  const parts = gradientParts(gradientMatch[2]);
  let angle = 135;
  const anglePart = parts[0].match(/^(-?[\d.]+)deg$/);
  const directionAngles: Record<string, number> = {
    "to top": 0,
    "to right": 90,
    "to bottom": 180,
    "to left": 270,
    "to top right": 45,
    "to right top": 45,
    "to bottom right": 135,
    "to right bottom": 135,
    "to bottom left": 225,
    "to left bottom": 225,
    "to top left": 315,
    "to left top": 315,
  };
  if (anglePart) angle = Number(parts.shift()!.slice(0, -3));
  else if (parts[0] in directionAngles) angle = directionAngles[parts.shift()!];
  else if (
    gradientMatch[1] === "radial" &&
    /^(circle|ellipse|at\s)/.test(parts[0])
  )
    parts.shift();

  const radians = (angle * Math.PI) / 180;
  const span =
    Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
  const dx = (Math.sin(radians) * span) / 2;
  const dy = (-Math.cos(radians) * span) / 2;
  const gradient =
    gradientMatch[1] === "radial"
      ? context.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          Math.hypot(width, height) / 2,
        )
      : context.createLinearGradient(
          width / 2 - dx,
          height / 2 - dy,
          width / 2 + dx,
          height / 2 + dy,
        );
  let stops = 0;
  parts.forEach((part, index) => {
    const match = part.match(/^(.*?)\s+(-?[\d.]+)%$/);
    const color = match ? match[1] : part;
    if (!CSS.supports("color", color)) return;
    const position = match
      ? Math.max(0, Math.min(1, Number(match[2]) / 100))
      : index / Math.max(1, parts.length - 1);
    gradient.addColorStop(position, color);
    stops++;
  });
  context.fillStyle = stops ? gradient : "#d9b7ed";
  context.fillRect(0, 0, width, height);
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(Math.max(0, radius), width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function getAspectRatio(value: string | number, original: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0)
    return value;
  if (typeof value === "string") {
    const parts = value.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
    if (parts && Number(parts[2]) > 0)
      return Number(parts[1]) / Number(parts[2]);
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return original;
}

function zoomScaleAt(seconds: number, duration: number): number {
  // Match the editor's cubic-bezier(.22, .61, .36, 1) transition.
  const ease = (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    let low = 0;
    let high = 1;
    for (let index = 0; index < 14; index++) {
      const t = (low + high) / 2;
      const x =
        3 * (1 - t) ** 2 * t * 0.22 + 3 * (1 - t) * t ** 2 * 0.36 + t ** 3;
      if (x < progress) low = t;
      else high = t;
    }
    const t = (low + high) / 2;
    return 3 * (1 - t) ** 2 * t * 0.61 + 3 * (1 - t) * t ** 2 + t ** 3;
  };
  const start = duration / 3;
  const end = duration * 0.56;
  const transition = 1.4;
  const amount =
    seconds < end
      ? ease((seconds - start) / transition)
      : ease((end - start) / transition) *
        (1 - ease((seconds - end) / transition));
  return 1 + 0.12 * amount;
}

/** Renders in real time, returning a downloadable WebM with the editor's framing. */
export async function renderVideo(options: RenderVideoOptions): Promise<Blob> {
  const {
    sourceUrl,
    demoImageUrl,
    background,
    padding,
    borderRadius,
    shadow,
    onProgress,
    signal,
  } = options;
  checkAbort(signal);
  if (
    typeof MediaRecorder === "undefined" ||
    !HTMLCanvasElement.prototype.captureStream
  ) {
    throw new Error(
      "Video export is not supported in this browser. Please use a desktop version of Chrome, Edge, or Firefox.",
    );
  }
  const mimeType = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType)
    throw new Error(
      "This browser cannot export WebM video. Please use Chrome, Edge, or Firefox.",
    );
  if (!sourceUrl && !demoImageUrl)
    throw new Error("Record your screen or import a video before exporting.");
  if (!Number.isFinite(options.duration) || options.duration <= 0)
    throw new Error(
      "The recording duration is unavailable. Please try importing the video again.",
    );

  const video: CapturableVideo | null = sourceUrl
    ? document.createElement("video")
    : null;
  const demoImage = !sourceUrl ? new Image() : null;
  const backgroundUrl = background
    .match(/^url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/)
    ?.slice(1)
    .find(Boolean);
  const backgroundImage = backgroundUrl ? new Image() : null;
  const volume = Math.max(0, Math.min(1, options.volume ?? 1));
  let canvasStream: MediaStream | null = null;
  let sourceStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let recorder: MediaRecorder | null = null;
  let animation = 0;
  let timeout = 0;

  try {
    if (video && volume > 0) {
      audioContext = new AudioContext();
      // Start this while the export button's user activation is still available.
      void audioContext.resume().catch(() => {});
    }
    if (backgroundImage) {
      backgroundImage.crossOrigin = "anonymous";
      await loadMedia(backgroundImage, backgroundUrl!, signal);
    }
    if (video) {
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      await loadMedia(video, sourceUrl!, signal);
      video.currentTime = 0;
    } else if (demoImage) {
      demoImage.crossOrigin = "anonymous";
      await loadMedia(demoImage, demoImageUrl!, signal);
    }
    checkAbort(signal);
    const sourceWidth = video?.videoWidth || demoImage?.naturalWidth || 1280;
    const sourceHeight = video?.videoHeight || demoImage?.naturalHeight || 720;
    const aspect = Math.max(
      0.25,
      Math.min(
        4,
        getAspectRatio(options.aspectRatio, sourceWidth / sourceHeight),
      ),
    );
    const maxDimension = Math.max(
      320,
      Math.min(1920, options.resolution || 1280),
    );
    const width =
      Math.round((aspect >= 1 ? maxDimension : maxDimension * aspect) / 2) * 2;
    const height =
      Math.round((aspect >= 1 ? maxDimension / aspect : maxDimension) / 2) * 2;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "Your browser could not create the video canvas. Please try again.",
      );
    const scale = width / 700;
    const inset = Math.max(
      0,
      Math.min((width * padding) / 1200, Math.min(width, height) * 0.4),
    );
    const fit = Math.min(
      (width - inset * 2) / sourceWidth,
      (height - inset * 2) / sourceHeight,
    );
    const frameWidth = sourceWidth * fit;
    const frameHeight = sourceHeight * fit;
    const x = (width - frameWidth) / 2;
    const y = (height - frameHeight) / 2;
    const duration =
      video && Number.isFinite(video.duration)
        ? Math.min(options.duration, video.duration)
        : options.duration;
    const draw = (seconds: number) => {
      if (backgroundImage) {
        const cover = Math.max(
          width / backgroundImage.naturalWidth,
          height / backgroundImage.naturalHeight,
        );
        const imageWidth = backgroundImage.naturalWidth * cover;
        const imageHeight = backgroundImage.naturalHeight * cover;
        context.drawImage(
          backgroundImage,
          (width - imageWidth) / 2,
          (height - imageHeight) / 2,
          imageWidth,
          imageHeight,
        );
      } else paintBackground(context, background, width, height);
      const effectScale = options.autoZoom ? zoomScaleAt(seconds, duration) : 1;
      context.save();
      context.translate(width / 2, height / 2);
      context.scale(effectScale, effectScale);
      context.translate(-width / 2, -height / 2);
      context.save();
      if (shadow) {
        const amount =
          typeof shadow === "number" ? Math.max(0, Math.min(100, shadow)) : 55;
        context.shadowColor = `rgba(0, 0, 0, ${amount / 150})`;
        context.shadowBlur = amount * 0.65 * scale * effectScale;
        context.shadowOffsetY = amount * 0.22 * scale * effectScale;
      }
      roundedRect(context, x, y, frameWidth, frameHeight, borderRadius * scale);
      context.fillStyle = "#151519";
      context.fill();
      context.restore();
      context.save();
      roundedRect(context, x, y, frameWidth, frameHeight, borderRadius * scale);
      context.clip();
      if (video) context.drawImage(video, x, y, frameWidth, frameHeight);
      else if (demoImage)
        context.drawImage(demoImage, x, y, frameWidth, frameHeight);
      context.restore();
      context.restore();
    };
    draw(0);
    canvasStream = canvas.captureStream(30);
    if (video) {
      try {
        await video.play();
      } catch {
        throw new Error(
          "The source video could not play for export. Click Export again to allow playback.",
        );
      }
      const capture = video.captureStream || video.mozCaptureStream;
      if (capture) {
        sourceStream = capture.call(video);
        if (
          volume > 0 &&
          sourceStream.getAudioTracks().length &&
          audioContext
        ) {
          const input = audioContext.createMediaStreamSource(
            new MediaStream(sourceStream.getAudioTracks()),
          );
          const gain = audioContext.createGain();
          const destination = audioContext.createMediaStreamDestination();
          gain.gain.value = volume;
          input.connect(gain).connect(destination);
          for (const track of destination.stream.getAudioTracks())
            canvasStream.addTrack(track);
        }
      } else if (volume > 0 && audioContext) {
        // Safari may lack captureStream; route the media element into an export-only destination.
        const input = audioContext.createMediaElementSource(video);
        const gain = audioContext.createGain();
        const destination = audioContext.createMediaStreamDestination();
        gain.gain.value = volume;
        input.connect(gain).connect(destination);
        for (const track of destination.stream.getAudioTracks())
          canvasStream.addTrack(track);
      }
    }
    checkAbort(signal);
    recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: 8_000_000,
      audioBitsPerSecond: 192_000,
    });
    const activeRecorder = recorder;
    const chunks: BlobPart[] = [];
    onProgress?.(0);
    return await new Promise<Blob>((resolve, reject) => {
      let finished = false;
      const started = performance.now();
      const removeListeners = () =>
        signal?.removeEventListener("abort", cancelled);
      const finish = () => {
        if (finished) return;
        finished = true;
        window.cancelAnimationFrame(animation);
        window.clearTimeout(timeout);
        if (activeRecorder.state !== "inactive") activeRecorder.stop();
      };
      const cancelled = () => {
        finish();
        removeListeners();
        reject(aborted());
      };
      activeRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      activeRecorder.onerror = () => {
        finish();
        removeListeners();
        reject(
          new Error(
            "The browser could not finish exporting this video. Please try again.",
          ),
        );
      };
      activeRecorder.onstop = () => {
        removeListeners();
        if (signal?.aborted) {
          reject(aborted());
          return;
        }
        if (!chunks.length) {
          reject(new Error("The exported video was empty. Please try again."));
          return;
        }
        onProgress?.(1);
        resolve(
          new Blob(chunks, { type: activeRecorder.mimeType || "video/webm" }),
        );
      };
      signal?.addEventListener("abort", cancelled, { once: true });
      activeRecorder.start(1000);
      const tick = () => {
        if (finished) return;
        const seconds = video
          ? video.currentTime
          : (performance.now() - started) / 1000;
        try {
          draw(seconds);
          onProgress?.(Math.min(0.99, seconds / duration));
        } catch (cause) {
          finish();
          removeListeners();
          reject(
            cause instanceof Error
              ? cause
              : new Error("The video frame could not be rendered."),
          );
          return;
        }
        if (seconds >= duration || video?.ended) {
          finish();
          return;
        }
        animation = window.requestAnimationFrame(tick);
      };
      // A hidden tab may throttle animation frames; still guarantee a bounded export.
      timeout = window.setTimeout(
        () => {
          finish();
          removeListeners();
          reject(
            new Error(
              "Export paused because the video stopped advancing. Keep this tab visible and try again.",
            ),
          );
        },
        (duration + 20) * 1000,
      );
      tick();
      if (signal?.aborted) cancelled();
    });
  } finally {
    window.cancelAnimationFrame(animation);
    window.clearTimeout(timeout);
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.onerror = null;
      if (recorder.state !== "inactive") recorder.stop();
    }
    for (const track of canvasStream?.getTracks() || []) track.stop();
    for (const track of sourceStream?.getTracks() || []) track.stop();
    if (audioContext && audioContext.state !== "closed")
      void audioContext.close().catch(() => {});
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }
}
