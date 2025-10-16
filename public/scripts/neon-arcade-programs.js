import { drawInterface as drawTronRunner } from "./draw-Interface-tron-runner-flyover.js";
import { drawInterface as drawOrbitalBazaar } from "./draw-Interface-interlaced-orbital-bazaar.js";
import { drawInterface as drawWeatherAtlas } from "./draw-Interface-weather-atlas.js";
import { drawInterface as drawStellarDock } from "./draw-Interface-stellar-dock-control.js";
import { drawInterface as drawTerminalOps } from "./draw-Interface-terminal-ops-console.js";
import { drawInterface as drawSourceScroll } from "./draw-Interface-source-scroll-analyzer.js";
import { drawInterface as drawCascadeGlyph } from "./draw-Interface-cascade-glyph-matrix.js";
import { drawInterface as drawEventHorizon } from "./draw-Interface-event-horizon-synchronizer.js";
import { drawInterface as drawAbyssalSonar } from "./draw-Interface-abyssal-sonar-array.js";
import { drawInterface as drawNeonCommand } from "./draw-Interface-neon-cathedral-command-deck.js";

export const CRT_PROGRAMS = [
  {
    id: "tron-runner",
    label: "TRON RUNNER",
    draw: drawTronRunner,
    tint: "#8be9fd",
    interval: 70,
  },
  {
    id: "orbital-bazaar",
    label: "ORBITAL BAZAAR",
    draw: drawOrbitalBazaar,
    tint: "#ff79c6",
    interval: 80,
  },
  {
    id: "weather-atlas",
    label: "WEATHER ATLAS",
    draw: drawWeatherAtlas,
    tint: "#f1fa8c",
    interval: 90,
  },
  {
    id: "stellar-dock",
    label: "STELLAR DOCK",
    draw: drawStellarDock,
    tint: "#8be9fd",
    interval: 75,
  },
  {
    id: "terminal-ops",
    label: "TERMINAL OPS",
    draw: drawTerminalOps,
    tint: "#ff79c6",
    interval: 85,
  },
  {
    id: "source-scroll",
    label: "SOURCE SCROLL",
    draw: drawSourceScroll,
    tint: "#8be9fd",
    interval: 80,
  },
  {
    id: "cascade-glyph",
    label: "CASCADE GLYPH",
    draw: drawCascadeGlyph,
    tint: "#f1fa8c",
    interval: 95,
  },
  {
    id: "event-horizon",
    label: "EVENT HORIZON",
    draw: drawEventHorizon,
    tint: "#ff79c6",
    interval: 75,
  },
  {
    id: "abyssal-sonar",
    label: "ABYSSAL SONAR",
    draw: drawAbyssalSonar,
    tint: "#8be9fd",
    interval: 85,
  },
  {
    id: "neon-command",
    label: "NEON COMMAND",
    draw: drawNeonCommand,
    tint: "#f1fa8c",
    interval: 80,
  },
];

export function getProgramByIndex(index) {
  if (!CRT_PROGRAMS.length) {
    throw new Error("No CRT programs available");
  }
  const idx = ((index % CRT_PROGRAMS.length) + CRT_PROGRAMS.length) % CRT_PROGRAMS.length;
  return CRT_PROGRAMS[idx];
}

export function getProgramById(id) {
  if (!id) return CRT_PROGRAMS[0];
  const found = CRT_PROGRAMS.find((entry) => entry.id === id);
  if (found) return found;
  const numeric = Number.parseInt(id, 10);
  if (!Number.isNaN(numeric)) {
    return getProgramByIndex(numeric);
  }
  return CRT_PROGRAMS[0];
}
