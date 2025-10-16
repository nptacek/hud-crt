# CRT Interface Moodboard & Concept Pitch

This document captures the current CRT-inspired canvases in `public/scripts` and proposes next-wave panels to push our VR metaverse toward that shimmering retro-future tactility.

## Existing Implementations

### `draw-Interface.js` & `draw-Interface-wireframe-horizon-drive.js`
- Vaporwave horizon runner with a neon gradient sky, crystalline sun bands, and wireframe mountains delivering depth cues across the horizon break.【F:public/scripts/draw-Interface.js†L1-L104】
- Procedural starfield, perspective road grid, and speed-line overlays that respond to `techParams.energyLevel`, reinforcing velocity in the scene.【F:public/scripts/draw-Interface.js†L33-L104】
- Layered HUD includes diagnostics, warning flashes, and scanline overlays to keep the CRT identity alive even when the scene is busy.【F:public/scripts/draw-Interface.js†L105-L220】

### `draw-Interface-original.js`
- Classic mission-control composition: rectangular bezels, right-side data tower, and bottom analytics strip frame the central Earth wireframe and orbital plots.【F:public/scripts/draw-Interface-original.js†L1-L120】
- Dynamic orbital tracks, satellites, and multicolored alerts give constant motion inside the “scope” while retaining symmetrical gridwork for stability.【F:public/scripts/draw-Interface-original.js†L120-L220】

### `draw-Interface-hello-world.js`
- Centered spherical hologram with rotating latitude/longitude rings, luminous halo, and rotating markers anchored by a strong cyan headline treatment.【F:public/scripts/draw-Interface-hello-world.js†L1-L140】
- Peripheral status arcs and pulse animation translate `scanParams.scanProgress` into a kinetic dial that feels at home on a command bridge.【F:public/scripts/draw-Interface-hello-world.js†L140-L220】

### `draw-Interface-quantum-relay-interface.js`
- Multi-panel control surface: dynamic grid background, cyan title marquee, and compartmentalized side panels for system matrices and signal analytics.【F:public/scripts/draw-Interface-quantum-relay-interface.js†L1-L120】
- Center visualization renders a quantum sphere surrounded by energy glyphs, with data streams and status ribbons breathing to the beat of real-time parameters.【F:public/scripts/draw-Interface-quantum-relay-interface.js†L120-L260】

### `hud-vr.js`
- Houses the CRT shader pipeline that bends and distorts the render, layering scanlines, noise, bloom, and tint mixing so every interface inherits phosphor warmth and screen curvature.【F:public/scripts/hud-vr.js†L1-L140】

## Future-Facing Concepts

### 1. Event Horizon Synchronizer
A gravitational navigation scope that feels like piloting a singularity skiff.
- **Visual Core:** Elliptical distortion grid that warps toward a central void; concentric rings shear and lens-flare in response to proximity warnings.
- **Palette:** Deep ultramarine base with saturated magenta gravitational shear bands and gold telemetry strokes for contrast.
- **Dynamics:** `techParams.energyLevel` modulates ring precession speed while `scanParams.scanProgress` ripples gravitational waves across the grid.
- **CRT Touches:** Thick vertical retrace effect on the void and faint chromatic splitting along the horizon lines.

### 2. Neon Cathedral Command Deck
A vaulted, cathedral-like cockpit where light pillars replace stained glass.
- **Visual Core:** Symmetrical vertical panels representing “organ pipes” that pulse with inbound data; vaulted wireframes converge above to imply height.
- **Palette:** Cyan glass panes, violet shadows, and white plasma tracers that flicker in sync with system heartbeat.
- **Dynamics:** `systemData` routes (e.g., throughput, latency) render as climbing light columns, with horizontal crossbeams flashing warnings in red when thresholds spike.
- **CRT Touches:** Dynamic moiré dithering across the tall panes, subtle geometric scanlines bending with the vaulted curvature from `hud-vr.js` post-processing.

### 3. Chrono Archive Time Table
An archival browser that manifests timelines as stacked CRT tapes.
- **Visual Core:** Layered horizontal “time tapes” with glow embossing; each tape cycles segmented glyphs representing eras and branching futures.
- **Palette:** Desaturated teal substrate with amber time markers, overlaid by grayscale anomaly highlights.
- **Dynamics:** Scrubbing through time adjusts parallax offset; `scanParams.scanProgress` animates forward scanning lasers while `techParams` sets tape jitter intensity.
- **CRT Touches:** Temporal noise bursts mimic dropouts, and a gentle desaturation bloom evokes aged phosphors being overdriven.

### 4. Bio-Luminal Reef Monitor
A living reef telemetry console fusing organic motion with synthwave hues.
- **Visual Core:** Hexagonal viewport filled with vector coral silhouettes and drifting micro-organisms, all outlined in electric turquoise.
- **Palette:** Midnight navy field, bioluminescent aquas, and coral pink alerts that pop like emergency strobes.
- **Dynamics:** Environmental metrics spawn particle schools, with `scanParams` influencing bloom pulses and `systemData` driving nutrient currents along bezier channels.
- **CRT Touches:** Rolling scanlines double as tidal oscillations; curvature shader adds a glass aquarium feel around the interface perimeter.

### 5. Interlaced Orbital Bazaar
Market dashboard for trading nodes scattered across orbiting platforms.
- **Visual Core:** Circular market map with rotating docking bays, ticker arcs, and vendor glyphs blinking in rhythmic patterns.
- **Palette:** Rich emerald gridlines, amber trade alerts, and violet docking lanes.
- **Dynamics:** `techParams.energyLevel` influences orbital rotation rate; trade volume from `systemData` thickens lane trails and intensifies neon glows.
- **CRT Touches:** Interlaced scanlines emphasize ticker motion while chromatic offsets simulate misaligned projection overlays.

These concepts embrace the existing shader stack and procedural patterns while broadening the experiential vocabulary—each is ready to prototype by remixing the canvases already thriving in `public/scripts`.
