type VideoMetadata = {
  duration: number;
  aspect: number;
  thumbnail?: string;
  width: number;
  height: number;
};

const isDuration = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/** Read local media without retaining its object URL or decoder. */
export async function inspectVideo(
  blob: Blob,
  knownDuration?: number,
): Promise<VideoMetadata> {
  if (!blob.size) throw new Error("This video is empty. Choose another file.");

  const video = document.createElement("video");
  const url = URL.createObjectURL(blob);
  const pendingCleanups = new Set<() => void>();
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;

  const waitFor = (
    events: string[],
    ready: () => boolean,
    timeoutMessage: string,
    start?: () => void,
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const cleanup = () => {
        if (timer !== undefined) clearTimeout(timer);
        events.forEach((event) => video.removeEventListener(event, check));
        video.removeEventListener("error", fail);
        pendingCleanups.delete(cleanup);
      };
      const check = () => {
        if (ready()) {
          cleanup();
          resolve();
        }
      };
      const fail = () => {
        cleanup();
        reject(
          new Error(
            "This video could not be read. Try a different file or convert it to MP4 or WebM.",
          ),
        );
      };
      pendingCleanups.add(cleanup);
      events.forEach((event) => video.addEventListener(event, check));
      video.addEventListener("error", fail);
      timer = setTimeout(() => {
        cleanup();
        reject(new Error(timeoutMessage));
      }, 15_000);
      try {
        start?.();
        if (video.error) fail();
        else check();
      } catch (error) {
        cleanup();
        reject(error);
      }
    });

  try {
    await waitFor(
      ["loadedmetadata"],
      () => video.readyState >= HTMLMediaElement.HAVE_METADATA,
      "Reading the video took too long. Try a smaller file or another video format.",
      () => {
        video.src = url;
        video.load();
      },
    );

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height)
      throw new Error("This file has no playable video track.");

    let duration = isDuration(video.duration) ? video.duration : knownDuration;
    if (!isDuration(duration)) {
      // MediaRecorder WebM files often omit duration. Seeking beyond the end
      // asks the browser's demuxer to discover it without parsing on the UI thread.
      const endProbe = 1e10;
      await waitFor(
        ["durationchange", "seeked", "timeupdate"],
        () =>
          isDuration(video.duration) ||
          (!video.seeking &&
            video.currentTime > 0 &&
            video.currentTime < endProbe),
        "The video's duration could not be determined. Try converting it to MP4 or WebM.",
        () => {
          video.currentTime = endProbe;
        },
      );
      duration = isDuration(video.duration)
        ? video.duration
        : video.currentTime;
    }

    if (!isDuration(duration))
      throw new Error("This video does not have a valid duration.");

    const thumbnailTime = Math.min(0.1, duration / 2);
    await waitFor(
      ["seeked", "loadeddata", "canplay"],
      () =>
        !video.seeking &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        Math.abs(video.currentTime - thumbnailTime) < 0.05,
      "The video preview could not be loaded. Try a different file or video format.",
      () => {
        video.currentTime = thumbnailTime;
      },
    );

    let thumbnail: string | undefined;
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = Math.max(1, Math.round((320 * height) / width));
    const context = canvas.getContext("2d");
    if (context) {
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnail = canvas.toDataURL("image/jpeg", 0.78);
      } catch {
        // A thumbnail is optional; media with valid metadata is still useful.
      }
    }
    return { duration, aspect: width / height, thumbnail, width, height };
  } finally {
    pendingCleanups.forEach((cleanup) => cleanup());
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
