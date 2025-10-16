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

## New Implementations

### `draw-Interface-event-horizon-synchronizer.js`
- Elliptical distortion well layered with warping rings that respond to energy levels and gravity warnings, turning the singularity skiff pitch into a playable panel.【F:public/scripts/draw-Interface-event-horizon-synchronizer.js†L1-L184】
- Dual telemetry bands and animated histogram translate scan cohesion, shear indices, and drift data into glowing CRT-style diagnostics.【F:public/scripts/draw-Interface-event-horizon-synchronizer.js†L115-L170】

### `draw-Interface-neon-cathedral-command-deck.js`
- Vaulted wireframes, glowing data pillars, and heartbeat-reactive crossbeams deliver the cathedral cockpit ambience with throughput-driven motion.【F:public/scripts/draw-Interface-neon-cathedral-command-deck.js†L1-L163】
- Bottom buffer visualizer syncs with throughput and heartbeat to reinforce the organ-pipe metaphor while retaining CRT scanline patina.【F:public/scripts/draw-Interface-neon-cathedral-command-deck.js†L113-L161】

### `draw-Interface-chrono-archive-time-table.js`
- Layered archival “tapes” animate segmented glyphs, anomaly markers, and jitter tuned by energy modulation, realising the temporal browser concept.【F:public/scripts/draw-Interface-chrono-archive-time-table.js†L1-L132】
- Scrubber halo and telemetry rail expose scan position, jitter, and archive age with phosphor-friendly palettes.【F:public/scripts/draw-Interface-chrono-archive-time-table.js†L134-L179】

### `draw-Interface-bio-luminal-reef-monitor.js`
- Hexagonal viewport, coral filigree, and bioluminescent organisms react to scan resonance and reef metrics to simulate living telemetry glass.【F:public/scripts/draw-Interface-bio-luminal-reef-monitor.js†L1-L158】
- Nutrient currents and status readouts convert density, stress, and flow into luminous CRT graphing with aquatic scanlines.【F:public/scripts/draw-Interface-bio-luminal-reef-monitor.js†L160-L215】

### `draw-Interface-interlaced-orbital-bazaar.js`
- Emerald grid, orbit lanes, and vendor glyphs translate market rotations and trade volume into a circular bazaar dashboard.【F:public/scripts/draw-Interface-interlaced-orbital-bazaar.js†L1-L124】
- Interlaced ticker and control frame communicate alerts, lane density, and energy levels with layered CRT interlace effects.【F:public/scripts/draw-Interface-interlaced-orbital-bazaar.js†L126-L188】

Each canvas now ships as a dedicated script in `public/scripts`, extending the CRT suite beyond the original horizon runner toward new retro-futurist missions.
