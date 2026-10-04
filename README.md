# screen-recorder-workspace

A Screen Studio-inspired recorder and video editor built with React, TypeScript, and Vite. No account or backend is required.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. The development server listens on all interfaces.

```sh
npm run build
npm run preview
```

## Features

- Record a screen, window, or browser tab using the browser's screen-sharing picker.
- Include microphone and supported system/tab audio; pause, resume, or finish recording.
- Import videos, including WebM recordings with unknown initial duration.
- Preview, seek, change playback speed, and zoom the timeline.
- Trim with draggable In/Out handles, precise time fields, or the `I` and `O` keys. Preview and export use the selected range.
- Customize gradients, colors, built-in wallpapers, uploaded backgrounds, padding, corner radius, and shadows.
- Apply Studio, Focus, or Airy design presets with one click.
- Switch between landscape, portrait, square, and 4:3 output.
- Enable a smooth automatic zoom segment.
- Adjust recording audio volume or mute audio.
- Export composed MP4 or WebM video at 720p or 1080p, with audio, progress, and cancellation. Available formats depend on browser support.
- Download an imported or recorded video's original file from its project menu.
- Create, rename, duplicate, search, and switch projects.
- Undo and redo design changes. Recordings, imports, project settings, and trim ranges persist on this device in IndexedDB.
- Responsive desktop and mobile editing layouts, including a mobile project drawer.
- Keyboard-accessible dialogs with focus management and confirmation before deleting a project.

## Browser behavior

Screen capture needs HTTPS or localhost and a supported desktop browser. Chrome and Edge provide the most complete screen/audio recording support; the available audio sources depend on the chosen tab, window, or screen. Sharing is always initiated by the browser's picker.

Images and recordings are processed in the browser without uploading them to a backend. Original video files and project metadata are saved in this browser's IndexedDB, so projects can be reopened after a reload. The save indicator reports whether changes have been saved. If browser storage is unavailable or full, newly added media remains usable for the current session and a warning prompts you to export a backup.

Storage belongs to this browser and origin; clearing site data or browser-managed storage removes saved projects. Download originals or export finished videos for a separate backup. Projects do not sync between devices.

Exports run in real time and include only the selected trim range. MP4 and WebM availability and codecs depend on the browser; MP4 output does not guarantee H.264/AAC compatibility with every player. The demo contains no audio; its audio track is explicitly labeled as a visualization. Cursor styling and browser-frame controls apply to the demo, since a real recording's existing cursor/window appearance is part of its pixels.

## Verification completed

- Production TypeScript/Vite build.
- Desktop and mobile visual checks; no horizontal overflow at 390px.
- Background edits, undo/redo, project switching, playback, and portrait aspect ratio.
- Full UI export downloaded and checked as a 1920×1080 VP9 video.
- 35-second WebM import and reimport of a browser-generated WebM without duration metadata.
- Canvas export audio: half gain produces approximately a 6 dB reduction; muted exports contain no audio track.
- Uploaded backgrounds, cancellation, progress, and media-track cleanup.
- End-to-end recorder with simulated display/microphone streams: pause/resume, stop, audio mixing, permission cancellation, and playback of an earlier recording after a second recording.
- Imported media and project metadata survive reload; storage transaction rollback, quota errors, and connection recovery were exercised. Deleting an original retains the video used by its duplicate; an interrupted deletion preserves both project and media.
- One-second MP4 and WebM trim exports checked for duration, selected video frames, and synchronized audio; a trim crossing a color/tone boundary retained the correct order and timing.
- Dialog autofocus, keyboard focus trapping, Escape, focus restoration, and isolation from editor shortcuts.
