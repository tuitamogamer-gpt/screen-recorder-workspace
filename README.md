# Screen Studio — browser workspace

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
- Preview, seek, change playback speed, mark clip splits, and zoom the timeline.
- Customize gradients, colors, built-in wallpapers, uploaded backgrounds, padding, corner radius, and shadows.
- Switch between landscape, portrait, square, and 4:3 output.
- Enable a smooth automatic zoom segment.
- Adjust recording audio volume or mute audio.
- Export composed WebM video at 720p or 1080p, with audio, progress, and cancellation.
- Create, rename, duplicate, search, and switch projects.
- Undo and redo design changes. Demo projects and design preferences persist in local storage.
- Responsive desktop and mobile editing layouts.

## Browser behavior

Screen capture needs HTTPS or localhost and a supported desktop browser. Chrome and Edge provide the most complete screen/audio recording support; the available audio sources depend on the chosen tab, window, or screen. Sharing is always initiated by the browser's picker.

Recording and imported video blobs stay in memory for the current tab. Export videos before closing or reloading. The header distinguishes session-only changes from locally saved demo projects. Images and recordings are processed in the browser.

Exports run in real time. WebM is the available output format. The demo contains no audio; its audio track is explicitly labeled as a visualization. Cursor styling and browser-frame controls apply to the demo, since a real recording's existing cursor/window appearance is part of its pixels. Clip splitting marks boundaries without deleting or trimming footage.

## Verification completed

- Production TypeScript/Vite build.
- Desktop and mobile visual checks; no horizontal overflow at 390px.
- Background edits, undo/redo, project switching, playback, and portrait aspect ratio.
- Full UI export downloaded and checked as a 1920×1080 VP9 video.
- 35-second WebM import and reimport of a browser-generated WebM without duration metadata.
- Canvas export audio: half gain produces approximately a 6 dB reduction; muted exports contain no audio track.
- Uploaded backgrounds, cancellation, progress, and media-track cleanup.
- End-to-end recorder with simulated display/microphone streams: pause/resume, stop, audio mixing, permission cancellation, and playback of an earlier recording after a second recording.
