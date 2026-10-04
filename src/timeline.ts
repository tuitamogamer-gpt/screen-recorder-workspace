/** Shortest useful selection; shared by the editor and the export renderer. */
export const MIN_TRIM_DURATION = 0.1;

export interface TrimRange {
  start: number;
  end: number;
  duration: number;
}

/** Validate source-time trim bounds without silently moving the selection. */
export function normalizeTrim(
  duration: number,
  start = 0,
  end = duration,
): TrimRange {
  if (!Number.isFinite(duration) || duration <= 0)
    throw new Error(
      "The recording duration is unavailable. Try importing the video again.",
    );
  if (!Number.isFinite(start) || !Number.isFinite(end))
    throw new Error("Choose a valid start and end time for your clip.");
  if (start < 0 || end > duration || start >= end)
    throw new Error(
      "The selected clip must start and end within the recording.",
    );
  if (end - start < Math.min(MIN_TRIM_DURATION, duration) - 1e-8)
    throw new Error("Keep at least 0.1 seconds of the recording in your clip.");
  return { start, end, duration: end - start };
}
