import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  Copy,
  Film,
  FolderOpen,
  Fullscreen,
  Image,
  Keyboard,
  Layers,
  LoaderCircle,
  Maximize,
  Mic,
  MicOff,
  Minus,
  Monitor,
  MoreHorizontal,
  MousePointer2,
  Music2,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Scissors,
  Search,
  Settings2,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  Undo2,
  Upload,
  Volume2,
  VolumeX,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { toPng } from "html-to-image";
import DemoPreview from "./DemoPreview";
import { useRecorder } from "./useRecorder";
import { renderVideo } from "./exportVideo";

type Design = {
  background: string;
  padding: number;
  radius: number;
  shadow: number;
  cursor: boolean;
  cursorSize: number;
  aspect: string;
  frame: string;
  volume: number;
  fade: boolean;
};
type Project = {
  id: string;
  name: string;
  duration: number;
  color: string;
  source?: string;
  thumbnail?: string;
  sourceAspect?: number;
  settings?: Design;
};
const backgrounds = [
  {
    name: "Sage",
    value:
      "linear-gradient(135deg, #e5e8bd 0%, #a1b898 35%, #497569 66%, #234d47 100%)",
  },
  {
    name: "Lavender",
    value: "linear-gradient(135deg, #e5d8f6, #a898d4 50%, #62518e)",
  },
  {
    name: "Sunset",
    value: "linear-gradient(135deg, #f8dda3, #e5a489 48%, #bc6979)",
  },
  {
    name: "Ocean",
    value: "linear-gradient(135deg, #b8e8ed, #65a5c1 50%, #355e9b)",
  },
  {
    name: "Rose",
    value: "linear-gradient(135deg, #f9e0d4, #d8a6b6 50%, #a9719a)",
  },
  {
    name: "Midnight",
    value: "linear-gradient(135deg, #758796, #424c5e 50%, #1c2639)",
  },
  {
    name: "Peach",
    value: "linear-gradient(135deg, #ffdabb, #eea178 50%, #d67862)",
  },
  {
    name: "Iris",
    value: "linear-gradient(135deg, #bcd0ff, #8998e0 50%, #6961b0)",
  },
  {
    name: "Meadow",
    value: "linear-gradient(135deg, #e8edc9, #b9c58c 50%, #798d60)",
  },
  {
    name: "Sand",
    value: "linear-gradient(135deg, #f2e9d2, #d4c5ab 50%, #af9e88)",
  },
  {
    name: "Berry",
    value: "linear-gradient(135deg, #e9b6b1, #b4798e 50%, #6a455d)",
  },
  {
    name: "Charcoal",
    value: "linear-gradient(135deg, #75797c, #494d52 50%, #25282d)",
  },
];
const wallpapers = [
  { name: "Dunes", url: "/wallpapers/dunes.svg" },
  { name: "Tide", url: "/wallpapers/tide.svg" },
  { name: "Petal", url: "/wallpapers/petal.svg" },
  { name: "Aurora", url: "/wallpapers/aurora.svg" },
];
const defaultDesign: Design = {
  background: backgrounds[0].value,
  padding: 56,
  radius: 12,
  shadow: 55,
  cursor: true,
  cursorSize: 1.5,
  aspect: "16:9",
  frame: "Browser",
  volume: 75,
  fade: false,
};
const initialProjects: Project[] = [
  {
    id: "welcome",
    name: "Website walkthrough",
    duration: 24,
    color: backgrounds[0].value,
  },
  {
    id: "product",
    name: "Product launch",
    duration: 38,
    color: backgrounds[1].value,
  },
  {
    id: "tutorial",
    name: "A quick how-to",
    duration: 18,
    color: backgrounds[2].value,
  },
];
const formatTime = (value: number, precise = false) =>
  `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(value % 60)
    .toString()
    .padStart(2, "0")}${
    precise
      ? "." +
        Math.floor((value % 1) * 100)
          .toString()
          .padStart(2, "0")
      : ""
  }`;
function IconButton({
  children,
  label,
  onClick,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={`icon-button ${className}`}
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      className={`toggle ${value ? "on" : ""}`}
      onClick={onChange}
    >
      <span />
    </button>
  );
}
function Slider({
  label,
  value,
  max = 100,
  min = 0,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  max?: number;
  min?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="slider-setting">
      <div className="setting-label">
        <span>{label}</span>
        <span className="value-box">
          {value}
          <span>{unit}</span>
        </span>
      </div>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={
          {
            "--fill": `${((value - min) / (max - min)) * 100}%`,
          } as CSSProperties
        }
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
function MiniPreview({
  color,
  thumbnail,
}: {
  color: string;
  thumbnail?: string;
}) {
  return (
    <div className="mini-preview" style={{ background: color }}>
      {thumbnail ? (
        <img src={thumbnail} alt="Video thumbnail" />
      ) : (
        <div className="mini-window">
          <div className="mini-dots">
            <i />
            <i />
            <i />
          </div>
          <div className="mini-content">
            <b>
              studio<span>✳︎</span>
            </b>
            <div className="mini-headline">
              Good ideas deserve
              <br />a little spotlight.
            </div>
            <svg className="mini-sun" viewBox="0 0 40 40" aria-hidden="true">
              <g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                <path d="M20 4v32M4 20h32M8.7 8.7l22.6 22.6M31.3 8.7 8.7 31.3" />
              </g>
            </svg>
            <div className="mini-lines" />
            <div className="mini-cta" />
            <div className="mini-cards">
              <i />
              <i />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={19} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem("studio-projects");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) &&
        parsed.length &&
        parsed.every(
          (p) =>
            p.id && typeof p.name === "string" && Number.isFinite(p.duration),
        )
        ? parsed
        : initialProjects;
    } catch {
      return initialProjects;
    }
  });
  const [selectedId, setSelectedId] = useState(projects[0]?.id || "welcome");
  const project =
    projects.find((p) => p.id === selectedId) || initialProjects[0];
  const [design, setDesign] = useState<Design>(
    project.settings || { ...defaultDesign, background: project.color },
  );
  const [past, setPast] = useState<Design[]>([]);
  const [future, setFuture] = useState<Design[]>([]);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [inspector, setInspector] = useState("Design");
  const [backgroundTab, setBackgroundTab] = useState("Gradient");
  const [leftTab, setLeftTab] = useState("Projects");
  const [modal, setModal] = useState<
    "record" | "export" | "help" | "new" | null
  >(null);
  const [toast, setToast] = useState("");
  const [storageLimited, setStorageLimited] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [resolution, setResolution] = useState("1080p");
  const [newName, setNewName] = useState("Untitled recording");
  const [zoom, setZoom] = useState(1);
  const [splits, setSplits] = useState<number[]>([]);
  const [previewSize, setPreviewSize] = useState({ width: 700, height: 430 });
  const [isMuted, setIsMuted] = useState(false);
  const [zoomEffect, setZoomEffect] = useState(true);
  const [selectedClip, setSelectedClip] = useState<"video" | "audio">("video");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const exportAbortRef = useRef<AbortController | null>(null);
  const recorder = useRecorder();
  const duration = project.duration;
  const activeProjectRef = useRef({ selectedId, design });
  activeProjectRef.current = { selectedId, design };
  const recordingSeenRef = useRef<Blob | null>(null);
  const ownedUrlsRef = useRef<string[]>([]);
  useEffect(
    () => () => {
      ownedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );
  const aspectParts = design.aspect.split(":").map(Number);
  const stageAspect = aspectParts[0] / aspectParts[1];
  const stageWidth = Math.min(
    previewSize.width,
    previewSize.height * stageAspect,
  );
  const stageHeight = stageWidth / stageAspect;
  const stagePadding = (stageWidth * design.padding) / 1200;
  const frameAspect = project.sourceAspect || 1.6;
  const frameWidth = Math.min(
    stageWidth - stagePadding * 2,
    (stageHeight - stagePadding * 2) * frameAspect,
  );
  useEffect(() => {
    const node = previewRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(node);
      setPreviewSize({
        width:
          node.clientWidth -
          parseFloat(style.paddingLeft) -
          parseFloat(style.paddingRight),
        height:
          node.clientHeight -
          parseFloat(style.paddingTop) -
          parseFloat(style.paddingBottom),
      });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 4200);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "studio-projects",
        JSON.stringify(
          projects
            .filter((p) => !p.source)
            .map((p) => ({
              ...p,
              settings: p.id === selectedId ? design : p.settings,
            })),
        ),
      );
      setStorageLimited(false);
    } catch {
      setStorageLimited(true);
    }
  }, [projects, design, selectedId]);
  const updateDesign = useCallback(
    (patch: Partial<Design>) => {
      setPast((prev) => [...prev.slice(-29), design]);
      setFuture([]);
      setDesign((current) => ({ ...current, ...patch }));
    },
    [design],
  );
  const undo = useCallback(() => {
    if (!past.length) return;
    setFuture((f) => [design, ...f]);
    setDesign(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
  }, [past, design]);
  const redo = useCallback(() => {
    if (!future.length) return;
    setPast((p) => [...p, design]);
    setDesign(future[0]);
    setFuture((f) => f.slice(1));
  }, [future, design]);
  const chooseProject = useCallback((p: Project) => {
    const active = activeProjectRef.current;
    setProjects((items) =>
      items.map((item) =>
        item.id === active.selectedId
          ? { ...item, settings: active.design }
          : item,
      ),
    );
    setSelectedId(p.id);
    setDesign(
      p.id === active.selectedId
        ? active.design
        : p.settings || { ...defaultDesign, background: p.color },
    );
    setTime(0);
    setPlaying(false);
    setPast([]);
    setFuture([]);
    setSplits([]);
  }, []);
  const seek = useCallback(
    (newTime: number) => {
      const t = Math.max(0, Math.min(newTime, duration));
      setTime(t);
      if (videoRef.current) videoRef.current.currentTime = t;
    },
    [duration],
  );
  const togglePlay = useCallback(() => {
    if (time >= duration) seek(0);
    setPlaying((p) => !p);
  }, [duration, time, seek]);
  useEffect(() => {
    if (!playing || project.source) return;
    let last = performance.now();
    const frame = setInterval(() => {
      const now = performance.now();
      const delta = ((now - last) / 1000) * speed;
      last = now;
      setTime((t) => {
        if (t + delta >= duration) {
          setPlaying(false);
          return duration;
        }
        return t + delta;
      });
    }, 30);
    return () => clearInterval(frame);
  }, [playing, duration, speed, project.source]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    video.volume = design.volume / 100;
    video.muted = isMuted;
    if (playing) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [playing, speed, design.volume, isMuted, project.source]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (event.target as HTMLElement).tagName,
        )
      )
        return;
      if (event.code === "Escape") {
        if (!exporting) setModal(null);
        setMenuOpen(false);
      }
      if (modal) return;
      if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey)
        setModal("record");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "i") {
        event.preventDefault();
        fileRef.current?.click();
      }
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      }
      if (event.code === "ArrowRight") seek(time + 5);
      if (event.code === "ArrowLeft") seek(time - 5);
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "e") {
        event.preventDefault();
        setModal("export");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, togglePlay, seek, time, undo, redo, exporting]);
  useEffect(() => {
    if (recorder.error) notify(recorder.error);
  }, [recorder.error, notify]);
  useEffect(() => {
    if (
      !recorder.recording ||
      recordingSeenRef.current === recorder.recording.blob
    )
      return;
    const rec = recorder.recording;
    recordingSeenRef.current = rec.blob;
    const url = URL.createObjectURL(rec.blob);
    ownedUrlsRef.current.push(url);
    const item: Project = {
      id: `recording-${Date.now()}`,
      name: "New screen recording",
      duration: rec.duration || 1,
      color: backgrounds[0].value,
      source: url,
      sourceAspect: 16 / 9,
    };
    setProjects((p) => [item, ...p]);
    chooseProject(item);
    setModal(null);
    notify("Your recording is ready. Make it your own.");
  }, [recorder.recording, notify, chooseProject]);
  const importVideo = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      notify("Choose a video file, such as MP4, MOV, or WebM.");
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.src = url;
    const failed = () => {
      URL.revokeObjectURL(url);
      notify("This video could not be opened. Try MP4 or WebM.");
    };
    video.onerror = failed;
    video.onloadedmetadata = async () => {
      let measuredDuration = video.duration;
      if (!Number.isFinite(measuredDuration)) {
        try {
          measuredDuration = await new Promise<number>((resolve, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("duration")),
              10000,
            );
            video.onseeked = () => {
              clearTimeout(timeout);
              video.onseeked = null;
              const total = Number.isFinite(video.duration)
                ? video.duration
                : video.currentTime;
              total > 0 && Number.isFinite(total)
                ? resolve(total)
                : reject(new Error("duration"));
            };
            video.currentTime = 1e10;
          });
        } catch {
          failed();
          return;
        }
      }
      if (!measuredDuration || measuredDuration <= 0) {
        failed();
        return;
      }
      let thumbnail: string | undefined;
      try {
        video.currentTime = 0;
        await new Promise<void>((resolve) => {
          if (video.readyState >= 2 && !video.seeking) resolve();
          else {
            video.onseeked = () => resolve();
            setTimeout(resolve, 800);
          }
        });
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = Math.round(
          (320 * video.videoHeight) / video.videoWidth,
        );
        canvas
          .getContext("2d")
          ?.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnail = canvas.toDataURL("image/jpeg", 0.7);
      } catch {
        /* Thumbnail is optional. */
      }
      const item: Project = {
        id: `import-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        duration: measuredDuration,
        color: backgrounds[0].value,
        source: url,
        sourceAspect: video.videoWidth / video.videoHeight,
        thumbnail,
      };
      ownedUrlsRef.current.push(url);
      setProjects((p) => [item, ...p]);
      chooseProject(item);
      setModal(null);
      notify("Video imported. Ready for a little polish.");
    };
  };
  const duplicateProject = () => {
    const copy = {
      ...project,
      id: `copy-${Date.now()}`,
      name: `${project.name} copy`,
      settings: design,
    };
    setProjects((p) => [...p, copy]);
    setMenuOpen(false);
    chooseProject(copy);
    notify("Project duplicated");
  };
  const createProject = () => {
    const item = {
      id: `project-${Date.now()}`,
      name: newName.trim() || "Untitled recording",
      duration: 24,
      color: backgrounds[0].value,
    };
    setProjects((p) => [item, ...p]);
    chooseProject(item);
    setModal(null);
    notify("New project created with the studio demo");
  };
  const startExport = async () => {
    setPlaying(false);
    setExporting(true);
    setExportProgress(0);
    seek(0);
    const controller = new AbortController();
    exportAbortRef.current = controller;
    try {
      let demoImageUrl: string | undefined;
      if (!project.source && demoRef.current) {
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
        demoImageUrl = await toPng(demoRef.current, {
          pixelRatio: Math.max(2, 1920 / frameWidth),
          cacheBust: true,
        });
      }
      const blob = await renderVideo({
        sourceUrl: project.source,
        demoImageUrl,
        duration,
        background: design.background,
        padding: design.padding,
        borderRadius: design.radius,
        shadow: design.shadow,
        aspectRatio: design.aspect,
        onProgress: setExportProgress,
        signal: controller.signal,
        resolution:
          (resolution === "720p" ? 720 : 1080) *
          (design.aspect === "1:1"
            ? 1
            : design.aspect === "4:3"
              ? 4 / 3
              : 16 / 9),
        volume: isMuted ? 0 : design.volume / 100,
        autoZoom: zoomEffect,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setModal(null);
      notify("Your video is exported. Go share something great.");
    } catch (error) {
      if (!controller.signal.aborted)
        notify(
          error instanceof Error
            ? error.message
            : "Export could not be completed. Please try again.",
        );
    } finally {
      if (exportAbortRef.current === controller) {
        setExporting(false);
        exportAbortRef.current = null;
      }
    }
  };
  const splitClip = () => {
    if (time < 0.2 || time > duration - 0.2) {
      notify("Move the playhead inside the clip to split it.");
      return;
    }
    if (!splits.some((s) => Math.abs(s - time) < 0.2)) {
      setSplits((p) => [...p, time].sort((a, b) => a - b));
      notify(`Clip split at ${formatTime(time, true)}`);
    }
  };
  const currentBackground =
    backgrounds.find((b) => b.value === design.background)?.name ||
    wallpapers.find((b) => design.background.includes(b.url))?.name ||
    "Custom";

  return (
    <div className="studio-app">
      <header className="app-header">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setModal("help");
          }}
        >
          <span className="brand-mark">
            <Monitor size={21} strokeWidth={2.4} />
            <Play size={9} fill="currentColor" />
          </span>
          <span>
            Screen Studio<span className="brand-dot">®</span>
          </span>
        </a>
        <div className="project-heading">
          <div className="project-name-wrap">
            <input
              aria-label="Project name"
              value={project.name}
              onChange={(e) =>
                setProjects((p) =>
                  p.map((item) =>
                    item.id === selectedId
                      ? { ...item, name: e.target.value }
                      : item,
                  ),
                )
              }
            />
            <div className="project-menu">
              <IconButton
                label="Project actions"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <ChevronDown size={14} />
              </IconButton>
              {menuOpen && (
                <div className="dropdown">
                  <button onClick={duplicateProject}>
                    <Copy size={15} />
                    Duplicate project
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setModal("new");
                    }}
                  >
                    <Plus size={15} />
                    New project
                  </button>
                  <button
                    onClick={() => {
                      if (projects.length > 1) {
                        const rest = projects.filter(
                          (p) => p.id !== selectedId,
                        );
                        setProjects(rest);
                        chooseProject(rest[0]);
                      } else
                        notify("Keep at least one project in your workspace.");
                      setMenuOpen(false);
                    }}
                  >
                    <Trash2 size={15} />
                    Delete project
                  </button>
                </div>
              )}
            </div>
          </div>
          <span className="saved-status">
            <CheckCheck size={13} />{" "}
            {project.source || storageLimited
              ? "Saved for this session"
              : "All changes saved"}
          </span>
        </div>
        <div className="header-actions">
          <button
            className="button record-button"
            onClick={() => setModal("record")}
          >
            <span className="record-dot" />
            New recording<span className="keycap">N</span>
          </button>
          <button
            className="button button-primary"
            onClick={() => setModal("export")}
          >
            <ArrowUpRight size={16} />
            Export video
          </button>
        </div>
      </header>

      <aside className="left-sidebar">
        <div className="workspace-label">
          <span>MY WORKSPACE</span>
          <span className="workspace-count">{projects.length}</span>
        </div>
        <div className="sidebar-tabs">
          <button
            className={leftTab === "Projects" ? "active" : ""}
            onClick={() => setLeftTab("Projects")}
          >
            <Layers size={15} />
            Projects
          </button>
          <button
            className={leftTab === "Media" ? "active" : ""}
            onClick={() => setLeftTab("Media")}
          >
            <Film size={15} />
            Media
          </button>
        </div>
        <div className="sidebar-section-title">
          <span>
            {leftTab === "Projects" ? "Recent projects" : "Your media"}
          </span>
          <div>
            <IconButton
              label="Search projects"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={14} />
            </IconButton>
            <IconButton
              label={leftTab === "Projects" ? "New project" : "Import video"}
              onClick={() =>
                leftTab === "Projects"
                  ? setModal("new")
                  : fileRef.current?.click()
              }
            >
              <Plus size={17} />
            </IconButton>
          </div>
        </div>
        {searchOpen && (
          <div className="search-box">
            <Search size={14} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a project…"
              aria-label="Search projects"
            />
          </div>
        )}
        <div className="project-list">
          {projects
            .filter(
              (p) =>
                (leftTab === "Projects" || p.source) &&
                p.name.toLowerCase().includes(query.toLowerCase()),
            )
            .map((p, index) => (
              <button
                className={`project-card ${selectedId === p.id ? "selected" : ""}`}
                key={p.id}
                onClick={() => chooseProject(p)}
              >
                <div className="project-thumbnail">
                  <MiniPreview
                    color={
                      selectedId === p.id
                        ? design.background
                        : p.settings?.background || p.color
                    }
                    thumbnail={p.thumbnail}
                  />
                  <span className="duration-badge">
                    {formatTime(p.duration)}
                  </span>
                  {selectedId === p.id && (
                    <span className="selected-badge">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="project-card-title">{p.name}</div>
                <div className="project-card-info">
                  <span>
                    {p.source
                      ? "Recording"
                      : index === 0
                        ? "Edited just now"
                        : index === 1
                          ? "Yesterday"
                          : "2 days ago"}
                  </span>
                  <span>{p.source ? "VIDEO" : "DEMO"}</span>
                </div>
              </button>
            ))}
          {leftTab === "Media" && !projects.some((p) => p.source) && (
            <div className="empty-media">
              <Film size={26} />
              <b>A home for your footage</b>
              <p>Import a video or record your screen to get started.</p>
              <button
                className="button"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} />
                Import video
              </button>
            </div>
          )}
        </div>
        <button
          className="import-button"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={14} />
          Import video<span>⌘ I</span>
        </button>
        <div className="sidebar-bottom">
          <div className="little-promo">
            <span className="promo-star">
              <Sparkles size={25} strokeWidth={1.4} />
            </span>
            <p>
              Your screen.
              <br />
              <strong>A little more extraordinary.</strong>
            </p>
          </div>
          <button className="help-button" onClick={() => setModal("help")}>
            <CircleHelp size={15} />
            Help & shortcuts
            <ArrowUpRight size={13} />
          </button>
        </div>
      </aside>

      <main className="editor">
        <div className="preview-section">
          <div className="preview-toolbar">
            <div className="section-title">
              <Monitor size={15} />
              <span>Preview</span>
              <span className="demo-label">
                {project.source ? "Recording" : "Demo project"}
              </span>
            </div>
            <div className="preview-toolbar-right">
              <label className="aspect-select">
                <span className="aspect-icon" />
                <select
                  aria-label="Aspect ratio"
                  value={design.aspect}
                  onChange={(e) => updateDesign({ aspect: e.target.value })}
                >
                  <option>16:9</option>
                  <option>9:16</option>
                  <option>1:1</option>
                  <option>4:3</option>
                </select>
              </label>
              <div className="toolbar-divider" />
              <IconButton
                label="Fullscreen preview"
                onClick={() => {
                  if (document.fullscreenElement) document.exitFullscreen();
                  else
                    previewRef.current
                      ?.requestFullscreen()
                      .catch(() =>
                        notify("Fullscreen is not available in this browser."),
                      );
                }}
              >
                <Maximize size={15} />
              </IconButton>
            </div>
          </div>
          <div className="preview-area" ref={previewRef}>
            <div
              className={`video-stage ${design.aspect === "9:16" ? "portrait" : design.aspect === "1:1" ? "square" : ""}`}
              style={{
                background: design.background,
                width: stageWidth,
                height: stageHeight,
                padding: stagePadding,
                aspectRatio: design.aspect.replace(":", "/"),
              }}
            >
              <div
                className={`screen-frame ${design.frame === "None" ? "no-browser-frame" : ""}`}
                style={{
                  width: frameWidth,
                  height: frameWidth / frameAspect,
                  flexShrink: 0,
                  borderRadius: `${design.radius}px`,
                  boxShadow: `0 ${design.shadow * 0.22}px ${design.shadow * 0.65}px ${design.shadow * 0.03}px rgba(0, 0, 0, ${design.shadow / 150})`,
                  transform:
                    zoomEffect && time > duration / 3 && time < duration * 0.56
                      ? "scale(1.12)"
                      : "scale(1)",
                }}
              >
                {project.source ? (
                  <video
                    key={project.id}
                    ref={videoRef}
                    src={project.source}
                    playsInline
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      setProjects((items) =>
                        items.map((p) =>
                          p.id === selectedId
                            ? {
                                ...p,
                                sourceAspect: v.videoWidth / v.videoHeight,
                              }
                            : p,
                        ),
                      );
                    }}
                    onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                    onEnded={() => setPlaying(false)}
                  />
                ) : (
                  <div ref={demoRef} className="demo-holder">
                    <DemoPreview
                      progress={0}
                      cursor={design.cursor}
                      cursorSize={design.cursorSize * 18}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="playback-bar">
            <div className="video-meta">
              <span className="quality-dot" />
              {design.aspect === "16:9"
                ? "1920 × 1080"
                : design.aspect === "9:16"
                  ? "1080 × 1920"
                  : design.aspect === "1:1"
                    ? "1080 × 1080"
                    : "1440 × 1080"}
              <span className="meta-separator">·</span>30 fps
            </div>
            <div className="playback-controls">
              <IconButton label="Go to beginning" onClick={() => seek(0)}>
                <SkipBack size={15} fill="currentColor" />
              </IconButton>
              <IconButton
                label={playing ? "Pause" : "Play"}
                className="play-button"
                onClick={togglePlay}
              >
                {playing ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </IconButton>
              <IconButton
                label="Go to end"
                onClick={() => {
                  seek(duration);
                  setPlaying(false);
                }}
              >
                <SkipForward size={15} fill="currentColor" />
              </IconButton>
              <span className="time-display">
                {formatTime(time)} <span>/ {formatTime(duration)}</span>
              </span>
            </div>
            <button
              className="playback-speed"
              onClick={() =>
                setSpeed((s) =>
                  s === 1 ? 1.5 : s === 1.5 ? 2 : s === 2 ? 0.5 : 1,
                )
              }
              title="Playback speed"
            >
              {speed}×<ChevronDown size={12} />
            </button>
          </div>
        </div>

        <section className="timeline">
          <div className="timeline-toolbar">
            <div className="timeline-tools">
              <IconButton
                label="Undo design change"
                onClick={undo}
                disabled={!past.length}
              >
                <Undo2 size={16} />
              </IconButton>
              <IconButton
                label="Redo design change"
                onClick={redo}
                disabled={!future.length}
              >
                <Redo2 size={16} />
              </IconButton>
              <span className="toolbar-divider" />
              <IconButton label="Split clip at playhead" onClick={splitClip}>
                <Scissors size={16} />
              </IconButton>
              <IconButton
                label="Clear clip splits"
                onClick={() => {
                  setSplits([]);
                  notify("Clip splits cleared");
                }}
                disabled={!splits.length}
              >
                <Trash2 size={15} />
              </IconButton>
              <span className="toolbar-divider" />
              <button
                className={`zoom-effect-button ${zoomEffect ? "active" : ""}`}
                onClick={() => setZoomEffect(!zoomEffect)}
              >
                <WandSparkles size={14} />
                Auto zoom
                <span className="tiny-status" />
              </button>
            </div>
            <div className="timeline-zoom">
              <IconButton
                label="Zoom out timeline"
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
              >
                <Minus size={13} />
              </IconButton>
              <input
                aria-label="Timeline zoom"
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <IconButton
                label="Zoom in timeline"
                onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
              >
                <Plus size={13} />
              </IconButton>
              <button className="fit-button" onClick={() => setZoom(1)}>
                <Fullscreen size={13} />
                Fit
              </button>
            </div>
          </div>
          <div className="timeline-body">
            <div className="track-labels">
              <div className="ruler-label">
                <Clock3 size={12} />
              </div>
              <button
                className={
                  selectedClip === "video"
                    ? "track-label active"
                    : "track-label"
                }
                onClick={() => setSelectedClip("video")}
                title="Screen track"
              >
                <Monitor size={16} />
              </button>
              <button
                className={
                  selectedClip === "audio"
                    ? "track-label active"
                    : "track-label"
                }
                onClick={() => {
                  setSelectedClip("audio");
                  setInspector("Audio");
                }}
                title="Audio track"
              >
                <AudioLines size={17} />
              </button>
              <button
                className="track-label zoom-label"
                onClick={() => setZoomEffect(!zoomEffect)}
                title="Toggle auto zoom"
              >
                <ZoomIn size={15} />
              </button>
            </div>
            <div className="timeline-scroll">
              <div
                className="timeline-content"
                ref={timelineRef}
                style={{ width: `${zoom * 100}%` }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seek(((e.clientX - rect.left) / rect.width) * duration);
                }}
              >
                <div className="ruler">
                  {Array.from({ length: 9 }, (_, i) => (
                    <span key={i} style={{ left: `${i * 12.5}%` }}>
                      {formatTime((i * duration) / 8)}
                    </span>
                  ))}
                  <div className="ruler-ticks" />
                </div>
                <div
                  className={`video-track ${selectedClip === "video" ? "selected-track" : ""}`}
                  onClick={() => setSelectedClip("video")}
                >
                  <div className="clip-label">
                    <Monitor size={11} />
                    <span>
                      {project.source ? project.name : "Screen recording"}
                    </span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="filmstrip">
                    {Array.from({ length: 12 }, (_, i) => (
                      <MiniPreview
                        color={design.background}
                        thumbnail={project.thumbnail}
                        key={i}
                      />
                    ))}
                  </div>
                  <span className="trim-handle left" />
                  <span className="trim-handle right" />
                  {splits.map((split) => (
                    <div
                      className="clip-split"
                      key={split}
                      style={{ left: `${(split / duration) * 100}%` }}
                    />
                  ))}
                </div>
                <div
                  className={`audio-track ${isMuted ? "muted" : ""}`}
                  onClick={() => setSelectedClip("audio")}
                >
                  <div className="audio-track-label">
                    <AudioLines size={11} />
                    {project.source
                      ? "Recording audio"
                      : "Demo audio visualization"}
                  </div>
                  <div className="waveform">
                    {Array.from({ length: 150 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          height: `${18 + Math.abs(Math.sin(i * 0.76) * Math.cos(i * 0.19)) * 82}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="zoom-track">
                  {zoomEffect && (
                    <div
                      className="zoom-clip"
                      style={{ left: "33%", width: "23%" }}
                    >
                      <ZoomIn size={10} />
                      <span>1.12× zoom</span>
                    </div>
                  )}
                </div>
                <div
                  className="playhead"
                  style={{ left: `${(time / duration) * 100}%` }}
                >
                  <span />
                  <div />
                </div>
              </div>
            </div>
          </div>
          <div className="timeline-footer">
            <span>
              <span className="timeline-status-dot" />
              {splits.length + 1} clip{splits.length > 0 ? "s" : ""}
              <span className="meta-separator">·</span>
              {formatTime(duration)} total
            </span>
            <span>
              <span className="space-key">space</span> to play or pause
            </span>
          </div>
        </section>
      </main>

      <aside className="inspector">
        <div className="inspector-tabs">
          <button
            className={inspector === "Design" ? "active" : ""}
            onClick={() => setInspector("Design")}
          >
            <SlidersHorizontal size={15} />
            Design
          </button>
          <button
            className={inspector === "Audio" ? "active" : ""}
            onClick={() => setInspector("Audio")}
          >
            <AudioLines size={16} />
            Audio
          </button>
        </div>
        <div className="inspector-content">
          {inspector === "Design" ? (
            <>
              <section className="setting-section background-section">
                <div className="section-heading">
                  <div>
                    <Image size={15} />
                    <h3>Background</h3>
                  </div>
                  <ChevronDown size={14} />
                </div>
                <div className="segmented-control">
                  {["Wallpaper", "Gradient", "Color"].map((tab) => (
                    <button
                      className={backgroundTab === tab ? "active" : ""}
                      onClick={() => setBackgroundTab(tab)}
                      key={tab}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {backgroundTab === "Gradient" ? (
                  <div className="background-grid">
                    {backgrounds.map((bg) => (
                      <button
                        key={bg.name}
                        title={bg.name}
                        aria-label={`${bg.name} background`}
                        aria-pressed={design.background === bg.value}
                        className={`background-swatch ${design.background === bg.value ? "selected" : ""}`}
                        style={{ background: bg.value }}
                        onClick={() => updateDesign({ background: bg.value })}
                      >
                        {design.background === bg.value && (
                          <Check size={14} strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </div>
                ) : backgroundTab === "Color" ? (
                  <>
                    <div className="color-grid">
                      {[
                        "#d7e5cc",
                        "#eedbc5",
                        "#d4c8e6",
                        "#d3e3ed",
                        "#f3f0e8",
                        "#242527",
                        "#abc2ad",
                        "#d59b87",
                        "#9b8cba",
                        "#789cbd",
                        "#bdbaad",
                        "#121315",
                      ].map((c) => (
                        <button
                          key={c}
                          aria-label={`Background ${c}`}
                          style={{ background: c }}
                          className="background-swatch"
                          onClick={() => updateDesign({ background: c })}
                        >
                          {design.background === c && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                    <label className="custom-color">
                      Custom color
                      <input
                        type="color"
                        value={
                          design.background.startsWith("#")
                            ? design.background
                            : "#a1b898"
                        }
                        onChange={(e) =>
                          updateDesign({ background: e.target.value })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <div className="wallpaper-grid">
                    {wallpapers.map((bg) => (
                      <button
                        key={bg.name}
                        aria-label={`${bg.name} wallpaper`}
                        style={{
                          background: `url("${bg.url}") center / cover`,
                        }}
                        onClick={() =>
                          updateDesign({
                            background: `url("${bg.url}") center / cover`,
                          })
                        }
                      />
                    ))}
                    <button
                      className="upload-wallpaper"
                      onClick={() => backgroundFileRef.current?.click()}
                    >
                      <Upload size={15} />
                      Upload image
                    </button>
                  </div>
                )}
                <div className="background-caption">
                  <span>{currentBackground}</span>
                  <span>
                    {backgroundTab === "Gradient"
                      ? "Soft & subtle"
                      : "Made for your story"}
                  </span>
                </div>
              </section>
              <section className="setting-section frame-section">
                <div className="section-heading">
                  <div>
                    <Maximize size={15} />
                    <h3>Frame</h3>
                  </div>
                  <IconButton
                    label="Reset frame settings"
                    onClick={() =>
                      updateDesign({
                        padding: 56,
                        radius: 12,
                        shadow: 55,
                        frame: "Browser",
                      })
                    }
                  >
                    <RotateCcw size={12} />
                  </IconButton>
                </div>
                <div className="setting-label frame-select-label">
                  <span>Style</span>
                  {project.source ? (
                    <span className="source-frame-label">
                      Original recording
                    </span>
                  ) : (
                    <div className="styled-select">
                      <Monitor size={13} />
                      <select
                        aria-label="Frame style"
                        value={design.frame}
                        onChange={(e) =>
                          updateDesign({ frame: e.target.value })
                        }
                      >
                        <option>Browser</option>
                        <option>None</option>
                      </select>
                      <ChevronDown size={12} />
                    </div>
                  )}
                </div>
                <Slider
                  label="Padding"
                  value={design.padding}
                  max={120}
                  unit="px"
                  onChange={(value) => updateDesign({ padding: value })}
                />
                <Slider
                  label="Corner radius"
                  value={design.radius}
                  max={32}
                  unit="px"
                  onChange={(value) => updateDesign({ radius: value })}
                />
                <Slider
                  label="Shadow"
                  value={design.shadow}
                  unit="%"
                  onChange={(value) => updateDesign({ shadow: value })}
                />
              </section>
              <section className="setting-section cursor-section">
                <div className="section-heading">
                  <div>
                    <MousePointer2 size={15} />
                    <h3>Cursor</h3>
                  </div>
                  {!project.source && (
                    <Toggle
                      value={design.cursor}
                      onChange={() => updateDesign({ cursor: !design.cursor })}
                      label="Show cursor"
                    />
                  )}
                </div>
                {!project.source && (
                  <Slider
                    label="Size"
                    value={design.cursorSize}
                    min={1}
                    max={3}
                    step={0.1}
                    unit="×"
                    onChange={(value) => updateDesign({ cursorSize: value })}
                  />
                )}
                <p className="setting-hint">
                  {project.source
                    ? "The cursor is captured as part of your original video."
                    : "A little easier to follow."}
                </p>
              </section>
              <div className="preset-card">
                <span className="preset-icon">
                  <Sparkles size={17} />
                </span>
                <div>
                  <strong>Looking good, effortlessly.</strong>
                  <p>A few details. A big difference.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <section className="setting-section">
                <div className="section-heading">
                  <div>
                    <Volume2 size={16} />
                    <h3>Recording audio</h3>
                  </div>
                  <Toggle
                    value={!isMuted}
                    onChange={() => setIsMuted(!isMuted)}
                    label="Enable recording audio"
                  />
                </div>
                <Slider
                  label="Volume"
                  value={design.volume}
                  unit="%"
                  onChange={(value) => updateDesign({ volume: value })}
                />
                <p className="setting-hint">
                  Adjust the audio level for your recording and export.
                </p>
              </section>
              <section className="setting-section">
                <div className="section-heading">
                  <div>
                    <Mic size={16} />
                    <h3>Microphone</h3>
                  </div>
                </div>
                <p className="audio-description">
                  Want to add your voice? Enable your microphone when starting a
                  new recording.
                </p>
                <button
                  className="button audio-record-button"
                  onClick={() => {
                    setMicrophone(true);
                    setModal("record");
                  }}
                >
                  <Mic size={14} />
                  Record with microphone
                </button>
              </section>
              <div className="audio-note">
                <AudioLines size={24} />
                <p>
                  {project.source
                    ? "Your original audio stays in sync with your screen recording."
                    : "This demo has no audio. Import or record a video to work with your sound."}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="inspector-bottom">
          <span className="local-dot" />
          Your work stays on your device
          <CircleHelp size={12} />
        </div>
      </aside>
      <footer className="app-footer">
        <span>
          <span className="footer-logo">◉</span>Made for your next great take.
        </span>
        <span className="footer-right">
          <span className="online-dot" />
          All systems ready
          <span className="footer-divider" />
          Screen Studio <span className="version">1.0</span>
        </span>
      </footer>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => {
          importVideo(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={backgroundFileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () =>
              updateDesign({
                background: `url("${reader.result}") center / cover`,
              });
            reader.readAsDataURL(file);
          }
        }}
      />
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={13} />
          </button>
        </div>
      )}
      {recorder.isRecording && (
        <div className="recording-controls">
          <span className="record-dot pulsing" />
          <b>Recording</b>
          <span className="recording-time">{formatTime(recorder.elapsed)}</span>
          <IconButton
            label={recorder.isPaused ? "Resume recording" : "Pause recording"}
            onClick={recorder.togglePause}
          >
            {recorder.isPaused ? <Play size={16} /> : <Pause size={16} />}
          </IconButton>
          <button className="stop-recording" onClick={recorder.stopRecording}>
            <Square size={13} fill="currentColor" />
            Finish recording
          </button>
        </div>
      )}
      {modal === "record" && (
        <Modal
          title="Make your next great take."
          subtitle="A beautiful recording starts right here."
          onClose={() => setModal(null)}
        >
          <div className="record-source">
            <div className="record-source-icon">
              <Monitor size={30} />
            </div>
            <div>
              <strong>Screen recording</strong>
              <p>Choose a screen, window, or browser tab.</p>
            </div>
            <Check size={19} />
          </div>
          <div className="record-option">
            <div>
              <Mic size={18} />
              <span>
                <b>Microphone</b>
                <small>Add your voice to the story</small>
              </span>
            </div>
            <Toggle
              value={microphone}
              onChange={() => setMicrophone(!microphone)}
              label="Record microphone"
            />
          </div>
          <div className="modal-info">
            <CircleHelp size={15} />
            Your browser will ask which screen you’d like to share. Audio
            capture depends on the selected source.
          </div>
          <button
            className="button button-primary modal-primary"
            onClick={async () => {
              await recorder.startRecording({ microphone });
              setModal(null);
            }}
          >
            <span className="record-dot" />
            Start recording
          </button>
          <button
            className="modal-secondary"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={14} />
            Or import an existing video
          </button>
        </Modal>
      )}
      {modal === "export" && (
        <Modal
          title={
            exporting
              ? "Your video is getting ready."
              : "Ready for the spotlight."
          }
          subtitle={
            exporting
              ? "Adding those finishing touches. Keep this tab open."
              : "Export your recording and share something great."
          }
          onClose={() => {
            if (exporting) {
              exportAbortRef.current?.abort();
            }
            setModal(null);
          }}
        >
          <div className="export-preview">
            <MiniPreview
              color={design.background}
              thumbnail={project.thumbnail}
            />
            <div>
              <strong>{project.name}</strong>
              <span>
                {formatTime(duration)} · {design.aspect} · 30 fps
              </span>
            </div>
          </div>
          {exporting ? (
            <div className="export-progress">
              <div>
                <LoaderCircle className="spin" size={18} />
                <span>Rendering your video</span>
                <b>{Math.round(exportProgress * 100)}%</b>
              </div>
              <progress max="1" value={exportProgress} />
              <p>Export runs in real time to preserve every frame.</p>
            </div>
          ) : (
            <>
              <label className="export-field">
                Resolution
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                >
                  <option value="1080p">1080p · Full HD</option>
                  <option value="720p">720p · Smaller file</option>
                </select>
              </label>
              <div className="export-field">
                <span>Format</span>
                <span className="format-pill">
                  WebM <span>High quality</span>
                </span>
              </div>
              <div className="modal-info">
                <Layers size={15} />
                Includes your background, padding, rounded corners, and shadow.
              </div>
            </>
          )}
          <button
            className={`button ${exporting ? "" : "button-primary"} modal-primary`}
            onClick={
              exporting
                ? () => {
                    exportAbortRef.current?.abort();
                  }
                : startExport
            }
          >
            {exporting ? (
              <>
                <X size={15} />
                Cancel export
              </>
            ) : (
              <>
                <ArrowDownToLine size={16} />
                Export video
              </>
            )}
          </button>
        </Modal>
      )}
      {modal === "new" && (
        <Modal
          title="A fresh canvas."
          subtitle="Give your next project a name."
          onClose={() => setModal(null)}
        >
          <label className="new-project-field">
            Project name
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
            />
          </label>
          <button
            className="button button-primary modal-primary"
            onClick={createProject}
          >
            <Plus size={16} />
            Create project
          </button>
          <button
            className="modal-secondary"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={14} />
            Start with your own video
          </button>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="A little help from the studio."
          subtitle="Everything you need for a smoother workflow."
          onClose={() => setModal(null)}
        >
          <div className="help-intro">
            <span className="brand-mark">
              <Monitor size={22} />
            </span>
            <p>
              Record your screen, make it your own, and export a polished video
              — all in your browser.
            </p>
          </div>
          <h3 className="shortcuts-title">
            <Keyboard size={16} />
            Keyboard shortcuts
          </h3>
          <div className="shortcut-list">
            {[
              ["Play / pause", "Space"],
              ["Skip 5 seconds", "← / →"],
              ["Undo", "⌘ / Ctrl Z"],
              ["Redo", "⌘ / Ctrl ⇧ Z"],
              ["Export video", "⌘ / Ctrl E"],
            ].map(([label, key]) => (
              <div key={label}>
                <span>{label}</span>
                <kbd>{key}</kbd>
              </div>
            ))}
          </div>
          <p className="help-note">
            Demo projects and design settings are saved in this browser.
            Download your recorded and imported videos before closing the tab.
          </p>
          <button
            className="button button-primary modal-primary"
            onClick={() => setModal(null)}
          >
            Got it. Let’s create.
            <ArrowRight size={15} />
          </button>
        </Modal>
      )}
    </div>
  );
}
