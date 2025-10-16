import { getProgramById, getProgramByIndex } from "./neon-arcade-programs.js";

const AFRAME_READY = new Promise((resolve) => {
  if (window.AFRAME) {
    resolve(window.AFRAME);
    return;
  }
  window.addEventListener("aframe-loaded", () => resolve(window.AFRAME), { once: true });
});

const vertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D map;
  uniform float time;
  uniform float energy;
  uniform vec3 tint;
  void main(){
    vec2 centered = vUv - 0.5;
    float vignette = smoothstep(0.7, 0.05, length(centered));
    float scan = 0.75 + 0.25 * sin(vUv.y * 620.0 + time * 11.0);
    vec3 base = texture2D(map, vUv).rgb;
    base *= scan;
    float glow = max(max(base.r, base.g), base.b);
    vec3 glowTint = tint * glow * (0.35 + energy * 0.25);
    vec3 color = mix(base, base + glowTint, 0.35 * energy);
    color *= vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function randomSeed(index) {
  const x = Math.sin(index * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function createTelemetryState(seed, programMeta) {
  const now = Date.now();
  const sectionNames = [
    "Sector", "Array", "Cluster", "Nexus", "Vault", "Drift", "Spire", "Field",
  ];
  const section = sectionNames[Math.floor(seed * sectionNames.length) % sectionNames.length];
  const scanType = programMeta?.label ?? "Arcade Sequence";

  return {
    seed,
    rotation: seed * Math.PI * 2,
    scan: {
      showGrid: true,
      showTarget: true,
      targetSize: 0.28,
      scanResolution: 0.7,
      autoRotate: true,
      scanProgress: 0,
      scanType,
      targetSection: `${section} ${Math.floor(seed * 12) + 1}`,
      targetX: 256,
      targetY: 256,
    },
    tech: {
      exposureTime: 2.4 + seed * 0.8,
      energyLevel: 70 + seed * 6,
      sliceThickness: 1.1 + seed * 0.4,
      insertionDepth: 36 + seed * 6,
      rotationAngle: seed * 0.4,
    },
    chromatic: {
      redOffset: 0.003 + seed * 0.001,
      greenOffset: 0.0015 + seed * 0.0008,
      blueOffset: 0.004 + seed * 0.001,
      redAngle: 0,
      greenAngle: 45,
      blueAngle: 180,
      redColor: [1.8, 0.1, 0.1],
      greenColor: [0.1, 1.8, 0.1],
      blueColor: [0.1, 0.1, 1.8],
    },
    systemData: {
      systemLoad: Array.from({ length: 16 }, (_, i) => 48 + Math.sin(seed * 8 + i * 0.4) * 18),
      signalStrength: 62 + seed * 10,
      noiseLevels: Array.from({ length: 128 }, (_, i) => Math.sin(seed * 3 + i * 0.14) * 8),
      fuelCells: Array.from({ length: 8 }, (_, i) => 78 - i * (1.8 + seed * 0.8)),
      tradeVolume: 520 + seed * 380,
      laneDensity: 0.35 + seed * 0.1,
      alerts: 0,
      ticker: [
        { label: "NODE-01", value: "+12%" },
        { label: "NODE-07", value: "-4%" },
        { label: "DOCK-ALFA", value: "+32%" },
        { label: "NODE-12", value: "+5%" },
      ],
      docks: 10,
      dockingProgress: 0.45 + seed * 0.35,
      orbits: [
        { baseRadius: 150 + seed * 20, radius: 150 + seed * 20, speed: 1.2, label: "ALPHA" },
        { baseRadius: 120 + seed * 18, radius: 120 + seed * 18, speed: 0.85, label: "BETA" },
        { baseRadius: 90 + seed * 12, radius: 90 + seed * 12, speed: 0.65, label: "GATE" },
      ],
      lifeSupportStatus: "NOMINAL",
      lastUpdateTime: now,
    },
  };
}

function updateTelemetryState(state, time, delta, playing) {
  const elapsed = (delta || 16) / 1000;
  const t = time / 1000 + state.seed * 10;
  const intensity = playing ? 1 : 0.6;
  state.rotation = (state.rotation + elapsed * (0.4 + state.seed * 0.6)) % (Math.PI * 2);
  const orbit = 110 + Math.sin(t * 0.6 + state.seed * 2) * 18;
  state.scan.targetX = 256 + Math.cos(state.rotation) * orbit;
  state.scan.targetY = 256 + Math.sin(state.rotation) * orbit;
  state.scan.scanProgress = (Math.sin(t * 0.7) + 1) / 2;

  const energyTarget = 74 + Math.sin(t * 0.9) * 12 * intensity;
  state.tech.energyLevel += (energyTarget - state.tech.energyLevel) * 0.5;
  state.tech.rotationAngle = (Math.sin(t * 0.5) + 1) * 0.35;
  state.tech.insertionDepth = 36 + Math.sin(t * 0.3 + state.seed) * 9;

  state.systemData.systemLoad = state.systemData.systemLoad.map((value, index) => {
    const target = 52 +
      Math.sin(t * 0.9 + index * 0.33 + state.seed * 4) * 20 +
      Math.cos(t * 1.3 + index * 0.27) * 6 * intensity;
    return value + (target - value) * 0.12;
  });

  state.systemData.noiseLevels = state.systemData.noiseLevels.map((_, index) => {
    return (
      Math.sin(t * 2.1 + index * 0.18 + state.seed * 5) * 9 +
      Math.sin(t * 0.8 + index * 0.07) * 4
    );
  });

  state.systemData.fuelCells = state.systemData.fuelCells.map((value, index) => {
    const drift = Math.sin(t * 0.25 + index * 0.9 + state.seed) * 0.9;
    const next = value + drift;
    return Math.min(100, Math.max(35, next));
  });

  state.systemData.tradeVolume += (
    620 + Math.sin(t * 0.65 + state.seed * 1.5) * 320 * intensity - state.systemData.tradeVolume
  ) * 0.18;

  state.systemData.laneDensity += (
    0.42 + Math.sin(t * 0.55 + state.seed * 2.1) * 0.18 - state.systemData.laneDensity
  ) * 0.2;

  const alertWave = Math.sin(t * 0.4 + state.seed * 3.2);
  state.systemData.alerts = alertWave > 0.75 ? 2 : alertWave > 0.35 ? 1 : 0;

  state.systemData.dockingProgress = Math.max(0, Math.min(1, 0.5 + Math.sin(t * 0.45) * 0.35));
  state.systemData.orbits = state.systemData.orbits.map((orbit, idx) => ({
    ...orbit,
    radius: orbit.baseRadius + Math.sin(t * 0.3 + idx) * 4,
  }));

  state.systemData.ticker = state.systemData.ticker.map((entry, idx) => {
    const drift = Math.sin(t * 0.9 + idx * 1.3 + state.seed * 4) * 8;
    const value = Math.round(drift * 10) / 10;
    const sign = value >= 0 ? "+" : "";
    return { ...entry, value: `${sign}${value}%` };
  });

  const signalTarget = 64 + Math.sin(t * 0.5 + state.seed * 3) * 14 + Math.cos(t * 0.8) * 6;
  state.systemData.signalStrength += (signalTarget - state.systemData.signalStrength) * 0.15;
  const stress = Math.max(0, Math.min(1, (90 - state.systemData.signalStrength) / 40));
  state.systemData.lifeSupportStatus = stress > 0.7 ? "ALERT" : stress > 0.35 ? "CHECK" : "NOMINAL";
  state.systemData.lastUpdateTime = Date.now();
}

function ensureMesh(el, geometry, material) {
  const mesh = el.getObject3D("mesh");
  if (mesh) {
    mesh.geometry.dispose();
    mesh.geometry = geometry;
    mesh.material = material;
    mesh.material.needsUpdate = true;
    return mesh;
  }
  const THREE = window.AFRAME.THREE;
  const m = new THREE.Mesh(geometry, material);
  el.setObject3D("mesh", m);
  return m;
}

AFRAME_READY.then((AFRAME) => {
  const THREE = AFRAME.THREE;
  const Bus = { emit: (event, detail = {}) => AFRAME.scenes[0]?.emit(event, detail) };

  AFRAME.registerComponent("grid-floor", {
    schema: { sizeX: { default: 16 }, sizeZ: { default: 12 }, step: { default: 0.5 } },
    init() {
      const grid = new THREE.GridHelper(
        Math.max(this.data.sizeX, this.data.sizeZ),
        Math.max(this.data.sizeX, this.data.sizeZ) / this.data.step,
        "#1a9eff",
        "#1a9eff"
      );
      grid.material.opacity = 0.15;
      grid.material.transparent = true;
      grid.position.set(0, 0.02, 0);
      this.el.object3D.add(grid);
    },
  });

  AFRAME.registerComponent("neon-tube", {
    schema: { length: { default: 10 }, color: { default: "#ff79c6" } },
    init() {
      const tube = document.createElement("a-cylinder");
      tube.setAttribute("radius", 0.02);
      tube.setAttribute("height", this.data.length);
      tube.setAttribute("rotation", "0 0 90");
      tube.setAttribute("material", {
        color: this.data.color,
        emissive: this.data.color,
        emissiveIntensity: 0.8,
        metalness: 0.2,
        roughness: 0.2,
      });
      tube.setAttribute(
        "animation__f",
        "property: material.emissiveIntensity; dir: alternate; from: 0.65; to: 0.95; dur: 1800; loop: true; easing: easeInOutSine"
      );
      this.el.appendChild(tube);
    },
  });

  AFRAME.registerComponent("fx-pedestal", {
    schema: { label: { default: "ACTION" }, event: { default: "fx" }, color: { default: "#8be9fd" } },
    init() {
      const r = this.el;
      const base = document.createElement("a-cylinder");
      base.setAttribute("radius", 0.22);
      base.setAttribute("height", 0.08);
      base.setAttribute("material", { color: "#121821", roughness: 0.9, metalness: 0.1 });
      base.setAttribute("position", "0 0.04 0");
      const stem = document.createElement("a-cylinder");
      stem.setAttribute("radius", 0.07);
      stem.setAttribute("height", 0.42);
      stem.setAttribute("material", { color: "#1b2330", roughness: 0.85, metalness: 0.2 });
      stem.setAttribute("position", "0 0.29 0");
      const btn = document.createElement("a-sphere");
      btn.setAttribute("radius", 0.11);
      btn.setAttribute("position", "0 0.56 0");
      btn.setAttribute("material", {
        color: this.data.color,
        emissive: this.data.color,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.2,
      });
      const halo = document.createElement("a-ring");
      halo.setAttribute("radius-inner", 0.14);
      halo.setAttribute("radius-outer", 0.2);
      halo.setAttribute("rotation", "-90 0 0");
      halo.setAttribute("position", "0 0.01 0");
      halo.setAttribute("material", {
        color: this.data.color,
        emissive: this.data.color,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.5,
      });
      halo.setAttribute(
        "animation__pulse",
        "property: material.opacity; dir: alternate; from: 0.25; to: 0.8; dur: 1500; easing: easeInOutSine; loop: true"
      );
      const text = document.createElement("a-entity");
      text.setAttribute("position", "0 0.82 0");
      text.setAttribute("text", `value: ${this.data.label}; align: center; width: 2.2; color: #eaf2ff`);
      r.appendChild(base);
      r.appendChild(stem);
      r.appendChild(btn);
      r.appendChild(halo);
      r.appendChild(text);
      r.classList.add("interactive", "clickable");
      r.addEventListener("mouseenter", () => r.setAttribute("scale", "1.03 1.03 1.03"));
      r.addEventListener("mouseleave", () => r.setAttribute("scale", "1 1 1"));
      r.addEventListener("click", () => Bus.emit(this.data.event, { src: "pedestal" }));
    },
  });

  AFRAME.registerComponent("beeper", {
    init() {
      this.ctx = null;
      this.gain = null;
      this.osc = null;
      const start = () => {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.0;
        this.gain.connect(this.ctx.destination);
        this.osc = this.ctx.createOscillator();
        this.osc.type = "square";
        this.osc.frequency.value = 440;
        this.osc.connect(this.gain);
        this.osc.start();
      };
      document.addEventListener("click", start, { once: true });
      this.el.addEventListener("beep", (e) => {
        if (!this.ctx) return;
        const f = (e.detail && e.detail.freq) || 880;
        const d = (e.detail && e.detail.dur) || 0.08;
        const v = (e.detail && e.detail.vol) || 0.03;
        const now = this.ctx.currentTime;
        this.osc.frequency.setValueAtTime(f, now);
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(0, now);
        this.gain.gain.linearRampToValueAtTime(v, now + 0.005);
        this.gain.gain.linearRampToValueAtTime(0, now + d);
      });
      this.music = false;
      this.loopTimer = null;
      this.el.sceneEl.addEventListener("arcade-music", () => {
        if (!this.ctx) return;
        this.music = !this.music;
        if (this.music) {
          let i = 0;
          const seq = [659, 784, 659, 523, 587, 659, 440, 440, 659, 784, 659, 523, 587, 659, 880, 880];
          this.loopTimer = setInterval(() => {
            const now = this.ctx.currentTime;
            const f = seq[i % seq.length];
            i++;
            this.osc.frequency.setValueAtTime(f, now);
            this.gain.gain.setValueAtTime(0, now);
            this.gain.gain.linearRampToValueAtTime(0.02, now + 0.02);
            this.gain.gain.linearRampToValueAtTime(0.0, now + 0.18);
          }, 220);
        } else {
          clearInterval(this.loopTimer);
          this.loopTimer = null;
        }
      });
    },
  });

  AFRAME.registerComponent("ambient-hum", {
    init() {
      this.ctx = null;
      this.gain = null;
      this.on = true;
      const start = () => {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        const bufferSize = 2 * this.ctx.sampleRate;
        const nbuf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const out = nbuf.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) out[i] = (Math.random() * 2 - 1) * 0.2;
        const src = this.ctx.createBufferSource();
        src.buffer = nbuf;
        src.loop = true;
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.01;
        src.connect(this.gain).connect(this.ctx.destination);
        src.start();
      };
      document.addEventListener("click", start, { once: true });
      this.el.sceneEl.addEventListener("arcade-power", () => {
        this.on = !this.on;
        if (this.gain) this.gain.gain.value = this.on ? 0.01 : 0.0;
      });
    },
  });

  AFRAME.registerComponent("crt-program-screen", {
    schema: {
      program: { type: "string" },
      width: { type: "number", default: 0.58 },
      height: { type: "number", default: 0.42 },
      tint: { type: "string", default: "#8be9fd" },
      interval: { type: "number", default: 80 },
    },
    init() {
      this.programMeta = getProgramById(this.data.program);
      this.seed = randomSeed(Math.random() * 5000);
      this.telemetry = createTelemetryState(this.seed, this.programMeta);
      this.canvas = document.createElement("canvas");
      this.canvas.width = 512;
      this.canvas.height = 512;
      this.ctx = this.canvas.getContext("2d");
      if (!this.ctx) {
        console.warn("crt-program-screen: 2D context unavailable");
      }
      this.texture = new THREE.CanvasTexture(this.canvas);
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
      this.texture.generateMipmaps = false;
      this.uniforms = {
        map: { value: this.texture },
        time: { value: 0 },
        energy: { value: 0.6 },
        tint: { value: new THREE.Color(this.data.tint) },
      };
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
      });
      this.nextDraw = 0;
      this.playing = true;
      this.el.addEventListener("screen-play", () => {
        this.playing = true;
        this.uniforms.energy.value = 1.0;
      });
      this.el.addEventListener("screen-attract", () => {
        this.playing = false;
        this.uniforms.energy.value = 0.6;
      });
      const geometry = new THREE.PlaneGeometry(this.data.width, this.data.height);
      ensureMesh(this.el, geometry, this.material);
      this.drawFrame(0);
    },
    update(oldData) {
      if (!this.material) return;
      if (oldData.tint !== this.data.tint) {
        this.uniforms.tint.value.set(this.data.tint);
      }
      if (oldData.width !== this.data.width || oldData.height !== this.data.height) {
        const geometry = new THREE.PlaneGeometry(this.data.width, this.data.height);
        ensureMesh(this.el, geometry, this.material);
      }
      if (oldData.program !== this.data.program) {
        this.programMeta = getProgramById(this.data.program);
        this.telemetry = createTelemetryState(this.seed, this.programMeta);
      }
    },
    remove() {
      if (this.texture) {
        this.texture.dispose();
      }
      if (this.material) {
        this.material.dispose();
      }
      const mesh = this.el.getObject3D("mesh");
      if (mesh) {
        mesh.geometry.dispose();
      }
    },
    drawFrame(time) {
      if (!this.ctx || !this.programMeta?.draw) return;
      const payload = this.telemetry;
      this.programMeta.draw(
        this.canvas,
        this.ctx,
        payload.scan,
        payload.tech,
        payload.chromatic,
        payload.systemData
      );
      this.texture.needsUpdate = true;
      this.uniforms.time.value = time / 1000;
    },
    tick(time, delta) {
      updateTelemetryState(this.telemetry, time, delta, this.playing);
      const interval = this.playing ? this.data.interval : this.data.interval * 2.5;
      if (time >= this.nextDraw) {
        this.drawFrame(time);
        this.nextDraw = time + interval;
      } else {
        this.uniforms.time.value = time / 1000;
      }
    },
  });

  AFRAME.registerComponent("arcade-row", {
    schema: { count: { default: 5 }, spacing: { default: 2 }, theme: { default: "pink" }, programStart: { default: 0 } },
    init() {
      for (let i = 0; i < this.data.count; i++) {
        const index = this.data.programStart + i;
        const program = getProgramByIndex(index);
        const cab = document.createElement("a-entity");
        cab.setAttribute("position", `${i * this.data.spacing} 0 0`);
        cab.setAttribute("arcade-cabinet", {
          theme: this.data.theme,
          program: program.id,
        });
        this.el.appendChild(cab);
      }
    },
  });

  AFRAME.registerComponent("arcade-cabinet", {
    schema: { theme: { default: "pink" }, program: { type: "string", default: "" } },
    init() {
      const col = (c) => (c === "cyan" ? "#8be9fd" : c === "yellow" ? "#f1fa8c" : "#ff79c6");
      const themeColor = col(this.data.theme);
      const programMeta = getProgramById(this.data.program);
      const programId = programMeta?.id || getProgramByIndex(0).id;
      const marqueeTitle = programMeta?.label || "ARCADE";
      const screenTint = programMeta?.tint || themeColor;
      const screenInterval = programMeta?.interval || 80;
      const root = this.el;

      const body = document.createElement("a-box");
      body.setAttribute("width", 0.9);
      body.setAttribute("height", 1.6);
      body.setAttribute("depth", 1.0);
      body.setAttribute("material", { color: "#111521", roughness: 0.9, metalness: 0.08 });
      body.setAttribute("position", "0 0.8 0");
      body.setAttribute("shadow", "cast:true; receive:true");

      const bezel = document.createElement("a-box");
      bezel.setAttribute("width", 0.7);
      bezel.setAttribute("height", 0.55);
      bezel.setAttribute("depth", 0.18);
      bezel.setAttribute("position", "0 1.25 0.47");
      bezel.setAttribute("rotation", "-20 0 0");
      bezel.setAttribute("material", { color: "#0e0e18", metalness: 0.3, roughness: 0.6 });

      const screen = document.createElement("a-entity");
      screen.setAttribute("position", "0 1.26 0.52");
      screen.setAttribute("rotation", "-20 0 0");
      screen.setAttribute("crt-program-screen", {
        program: programId,
        width: 0.58,
        height: 0.42,
        tint: screenTint,
        interval: screenInterval,
      });

      const glass = document.createElement("a-plane");
      glass.setAttribute("width", 0.62);
      glass.setAttribute("height", 0.46);
      glass.setAttribute("position", "0 1.26 0.535");
      glass.setAttribute("rotation", "-20 0 0");
      glass.setAttribute("material", {
        color: "#66b1ff",
        roughness: 0.1,
        metalness: 0.2,
        transparent: true,
        opacity: 0.1,
      });

      const marquee = document.createElement("a-box");
      marquee.setAttribute("width", 0.9);
      marquee.setAttribute("height", 0.22);
      marquee.setAttribute("depth", 0.2);
      marquee.setAttribute("position", "0 1.65 0.3");
      marquee.setAttribute("material", { color: "#0e0e18", roughness: 0.7, metalness: 0.5 });
      const mtxt = document.createElement("a-entity");
      mtxt.setAttribute("position", "0 1.65 0.41");
      mtxt.setAttribute("text", `value: ${marqueeTitle}; align: center; width: 2.4; color: ${themeColor}`);

      const ctrl = document.createElement("a-box");
      ctrl.setAttribute("width", 0.8);
      ctrl.setAttribute("height", 0.12);
      ctrl.setAttribute("depth", 0.5);
      ctrl.setAttribute("position", "0 0.95 0.4");
      ctrl.setAttribute("rotation", "-20 0 0");
      ctrl.setAttribute("material", { color: "#171b29", roughness: 0.8, metalness: 0.2 });

      const stickBase = document.createElement("a-cylinder");
      stickBase.setAttribute("radius", 0.03);
      stickBase.setAttribute("height", 0.18);
      stickBase.setAttribute("position", "-0.18 1.0 0.54");
      stickBase.setAttribute("rotation", "-20 0 0");
      stickBase.setAttribute("material", { color: "#5b667a", roughness: 0.6, metalness: 0.6 });
      const stickBall = document.createElement("a-sphere");
      stickBall.setAttribute("radius", 0.05);
      stickBall.setAttribute("position", "-0.18 1.1 0.55");
      stickBall.setAttribute("material", {
        color: themeColor,
        roughness: 0.3,
        metalness: 0.6,
        emissive: themeColor,
        emissiveIntensity: 0.35,
      });

      const btn1 = document.createElement("a-sphere");
      btn1.setAttribute("radius", 0.035);
      btn1.setAttribute("position", "0.06 1.0 0.56");
      btn1.setAttribute("material", {
        color: "#f1fa8c",
        emissive: "#f1fa8c",
        emissiveIntensity: 0.4,
      });
      const btn2 = document.createElement("a-sphere");
      btn2.setAttribute("radius", 0.035);
      btn2.setAttribute("position", "0.14 0.98 0.55");
      btn2.setAttribute("material", {
        color: "#ff79c6",
        emissive: "#ff79c6",
        emissiveIntensity: 0.4,
      });

      const coinBtn = document.createElement("a-entity");
      coinBtn.setAttribute("position", "0 0.6 0.5");
      const cb = document.createElement("a-box");
      cb.setAttribute("width", 0.18);
      cb.setAttribute("height", 0.1);
      cb.setAttribute("depth", 0.06);
      cb.setAttribute("material", { color: "#0d0f18", roughness: 0.7, metalness: 0.2 });
      const led = document.createElement("a-sphere");
      led.setAttribute("radius", 0.025);
      led.setAttribute("position", "0 0.02 0.05");
      led.setAttribute("material", {
        color: themeColor,
        emissive: themeColor,
        emissiveIntensity: 0.2,
      });
      const lbl = document.createElement("a-entity");
      lbl.setAttribute("position", "0 -0.06 0.03");
      lbl.setAttribute("rotation", "-20 0 0");
      lbl.setAttribute("text", "value: INSERT COIN; align: center; width: 1.2; color: #8be9fd");
      coinBtn.appendChild(cb);
      coinBtn.appendChild(led);
      coinBtn.appendChild(lbl);
      coinBtn.classList.add("interactive", "clickable");
      coinBtn.addEventListener("mouseenter", () => coinBtn.setAttribute("scale", "1.05 1.05 1.05"));
      coinBtn.addEventListener("mouseleave", () => coinBtn.setAttribute("scale", "1 1 1"));

      let playing = false;
      const togglePlay = () => {
        playing = !playing;
        screen.emit(playing ? "screen-play" : "screen-attract", {}, false);
        led.setAttribute("material", {
          color: themeColor,
          emissive: themeColor,
          emissiveIntensity: playing ? 0.6 : 0.2,
        });
        document.getElementById("orchestrator")?.emit("beep", {
          freq: playing ? 988 : 622,
          dur: 0.1,
          vol: 0.03,
        });
      };
      coinBtn.addEventListener("click", togglePlay);

      root.appendChild(body);
      root.appendChild(bezel);
      root.appendChild(screen);
      root.appendChild(glass);
      root.appendChild(marquee);
      root.appendChild(mtxt);
      root.appendChild(ctrl);
      root.appendChild(stickBase);
      root.appendChild(stickBall);
      root.appendChild(btn1);
      root.appendChild(btn2);
      root.appendChild(coinBtn);
    },
  });

  AFRAME.registerComponent("claw-machine", {
    init() {
      const r = this.el;
      const base = document.createElement("a-box");
      base.setAttribute("width", 1.2);
      base.setAttribute("height", 2.0);
      base.setAttribute("depth", 1.2);
      base.setAttribute("position", "0 1.0 0");
      base.setAttribute("material", { color: "#0f131f", roughness: 0.9, metalness: 0.08 });
      base.setAttribute("shadow", "cast:true; receive:true");

      const glass = document.createElement("a-box");
      glass.setAttribute("width", 1.05);
      glass.setAttribute("height", 1.3);
      glass.setAttribute("depth", 1.05);
      glass.setAttribute("position", "0 1.25 0");
      glass.setAttribute("material", {
        color: "#9fd8ff",
        transparent: true,
        opacity: 0.15,
        roughness: 0.05,
        metalness: 0.1,
        emissive: "#9fd8ff",
        emissiveIntensity: 0.05,
      });

      const prizes = document.createElement("a-entity");
      prizes.setAttribute("position", "0 0.6 0");
      for (let i = 0; i < 8; i++) {
        const p = document.createElement("a-box");
        const s = 0.18 + Math.random() * 0.12;
        p.setAttribute("width", s);
        p.setAttribute("height", s);
        p.setAttribute("depth", s);
        p.setAttribute("position", `${Math.random() * 0.6 - 0.3} 0 ${Math.random() * 0.6 - 0.3}`);
        p.setAttribute("material", {
          color: ["#ff79c6", "#8be9fd", "#f1fa8c"][i % 3],
          roughness: 0.8,
          metalness: 0.2,
        });
        prizes.appendChild(p);
      }

      const rail = document.createElement("a-box");
      rail.setAttribute("width", 0.9);
      rail.setAttribute("height", 0.05);
      rail.setAttribute("depth", 0.05);
      rail.setAttribute("position", "0 1.85 0");
      rail.setAttribute("material", { color: "#6b7280", roughness: 0.6, metalness: 0.7 });
      const carriage = document.createElement("a-cylinder");
      carriage.setAttribute("radius", 0.04);
      carriage.setAttribute("height", 0.2);
      carriage.setAttribute("position", "0 1.75 0");
      carriage.setAttribute("material", { color: "#9aa1ac", roughness: 0.5, metalness: 0.8 });
      const cable = document.createElement("a-cylinder");
      cable.setAttribute("radius", 0.008);
      cable.setAttribute("height", 0.4);
      cable.setAttribute("position", "0 1.55 0");
      cable.setAttribute("material", { color: "#9aa1ac", roughness: 0.6, metalness: 0.7 });
      const claw = document.createElement("a-entity");
      claw.setAttribute("position", "0 1.35 0");
      for (let i = 0; i < 3; i++) {
        const arm = document.createElement("a-box");
        arm.setAttribute("width", 0.02);
        arm.setAttribute("height", 0.16);
        arm.setAttribute("depth", 0.02);
        arm.setAttribute("rotation", `${i * 120} 0 45`);
        arm.setAttribute("material", { color: "#cbd5e1", metalness: 0.8, roughness: 0.3 });
        claw.appendChild(arm);
      }

      const start = document.createElement("a-entity");
      start.setAttribute("position", "0 0.2 0.65");
      const b = document.createElement("a-box");
      b.setAttribute("width", 0.24);
      b.setAttribute("height", 0.1);
      b.setAttribute("depth", 0.08);
      b.setAttribute("material", { color: "#0e0e18", roughness: 0.8, metalness: 0.2 });
      const led = document.createElement("a-sphere");
      led.setAttribute("radius", 0.03);
      led.setAttribute("position", "0 0.02 0.05");
      led.setAttribute("material", {
        color: "#8be9fd",
        emissive: "#8be9fd",
        emissiveIntensity: 0.3,
      });
      const label = document.createElement("a-entity");
      label.setAttribute("position", "0 -0.06 0.01");
      label.setAttribute("text", "value: START; align: center; width: 1.4; color: #8be9fd");
      start.appendChild(b);
      start.appendChild(led);
      start.appendChild(label);
      start.classList.add("interactive", "clickable");

      let busy = false;
      start.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        document.getElementById("orchestrator")?.emit("beep", { freq: 880, dur: 0.12, vol: 0.035 });
        const seq = [
          { to: "-0.35 1.75 0.3", dur: 800 },
          { to: "-0.35 1.35 0.3", dur: 700 },
          { to: "-0.35 1.75 0.3", dur: 700 },
          { to: "0 1.75 0", dur: 900 },
        ];
        let t = 0;
        const step = () => {
          if (t >= seq.length) {
            busy = false;
            return;
          }
          carriage.setAttribute("animation__move", `property: position; to: ${seq[t].to}; dur: ${seq[t].dur}; easing: easeInOutQuad`);
          const yTarget = Number.parseFloat(seq[t].to.split(" ")[1]);
          const cableHeight = Math.max(0.2, yTarget - 1.35);
          cable.setAttribute("animation__len", `property: height; to: ${cableHeight}; dur: ${seq[t].dur}; easing: easeInOutQuad`);
          setTimeout(() => {
            t++;
            step();
          }, seq[t].dur + 50);
        };
        step();
      });

      r.appendChild(base);
      r.appendChild(glass);
      r.appendChild(prizes);
      r.appendChild(rail);
      r.appendChild(carriage);
      r.appendChild(cable);
      r.appendChild(claw);
      r.appendChild(start);
    },
  });

  AFRAME.registerComponent("pinball-table", {
    init() {
      const r = this.el;
      const deck = document.createElement("a-box");
      deck.setAttribute("width", 1.4);
      deck.setAttribute("height", 0.1);
      deck.setAttribute("depth", 2.2);
      deck.setAttribute("position", "0 0.55 0");
      deck.setAttribute("rotation", "-10 0 0");
      deck.setAttribute("material", { color: "#1b2330", roughness: 0.9, metalness: 0.2 });
      deck.setAttribute("shadow", "receive:true");
      const legs = [
        [-0.6, 0, -1.0],
        [0.6, 0, -1.0],
        [-0.6, 0, 1.0],
        [0.6, 0, 1.0],
      ];
      legs.forEach((p) => {
        const leg = document.createElement("a-cylinder");
        leg.setAttribute("radius", 0.05);
        leg.setAttribute("height", 0.6);
        leg.setAttribute("position", `${p[0]} 0.3 ${p[2]}`);
        leg.setAttribute("material", { color: "#6b7280", roughness: 0.6, metalness: 0.7 });
        r.appendChild(leg);
      });
      const glass = document.createElement("a-plane");
      glass.setAttribute("width", 1.35);
      glass.setAttribute("height", 2.1);
      glass.setAttribute("position", "0 0.62 0.03");
      glass.setAttribute("rotation", "-10 0 0");
      glass.setAttribute("material", {
        color: "#9fd8ff",
        transparent: true,
        opacity: 0.1,
        roughness: 0.05,
        metalness: 0.1,
      });
      for (let i = 0; i < 8; i++) {
        const l = document.createElement("a-sphere");
        l.setAttribute("radius", 0.05);
        const x = -0.55 + (i % 4) * 0.35;
        const z = -0.9 + Math.floor(i / 4) * 1.8;
        l.setAttribute("position", `${x} 0.62 ${z}`);
        l.setAttribute("rotation", "-10 0 0");
        const c = ["#ff79c6", "#8be9fd", "#f1fa8c"][i % 3];
        l.setAttribute("material", { color: c, emissive: c, emissiveIntensity: 0.4 });
        l.setAttribute(
          "animation__p",
          `property: material.emissiveIntensity; dir: alternate; from: 0.2; to: 0.8; dur: ${800 + i * 120}; loop: true; easing: easeInOutSine`
        );
        r.appendChild(l);
      }
      r.appendChild(deck);
      r.appendChild(glass);
    },
  });

  AFRAME.registerComponent("token-machine", {
    init() {
      const r = this.el;
      const body = document.createElement("a-box");
      body.setAttribute("width", 0.8);
      body.setAttribute("height", 1.4);
      body.setAttribute("depth", 0.6);
      body.setAttribute("position", "0 0.7 0");
      body.setAttribute("material", { color: "#0f131f", roughness: 0.9, metalness: 0.08 });
      const sign = document.createElement("a-entity");
      sign.setAttribute("position", "0 1.2 0.31");
      sign.setAttribute("text", "value: TOKENS; align: center; width: 2.4; color: #f1fa8c");
      const slot = document.createElement("a-box");
      slot.setAttribute("width", 0.5);
      slot.setAttribute("height", 0.18);
      slot.setAttribute("depth", 0.08);
      slot.setAttribute("position", "0 0.9 0.31");
      slot.setAttribute("material", { color: "#0e0e18", roughness: 0.8, metalness: 0.2 });
      const btn = document.createElement("a-entity");
      btn.setAttribute("position", "0 0.4 0.3");
      btn.classList.add("interactive", "clickable");
      const bb = document.createElement("a-box");
      bb.setAttribute("width", 0.26);
      bb.setAttribute("height", 0.12);
      bb.setAttribute("depth", 0.08);
      bb.setAttribute("material", { color: "#0e0e18", roughness: 0.8, metalness: 0.2 });
      const led = document.createElement("a-sphere");
      led.setAttribute("radius", 0.03);
      led.setAttribute("position", "0 0.02 0.05");
      led.setAttribute("material", { color: "#ff79c6", emissive: "#ff79c6", emissiveIntensity: 0.4 });
      const lbl = document.createElement("a-entity");
      lbl.setAttribute("position", "0 -0.06 0.01");
      lbl.setAttribute("text", "value: DISPENSE; align: center; width: 1.6; color: #ff79c6");
      btn.appendChild(bb);
      btn.appendChild(led);
      btn.appendChild(lbl);
      btn.addEventListener("click", () => {
        document.getElementById("orchestrator")?.emit("beep", { freq: 523, dur: 0.1, vol: 0.03 });
        const token = document.createElement("a-cylinder");
        token.setAttribute("radius", 0.06);
        token.setAttribute("height", 0.02);
        token.setAttribute("position", "0 0.88 0.34");
        token.setAttribute("rotation", "90 0 0");
        token.setAttribute("material", {
          color: "#f1fa8c",
          metalness: 0.8,
          roughness: 0.2,
          emissive: "#f1fa8c",
          emissiveIntensity: 0.2,
        });
        r.appendChild(token);
        token.setAttribute("animation__out", "property: position; to: 0 0.88 0.6; dur: 250; easing: easeOutQuad");
        token.setAttribute(
          "animation__drop",
          "property: position; to: 0 0.2 0.6; dur: 900; delay: 250; easing: easeInQuad"
        );
        setTimeout(() => token.remove(), 2000);
      });
      r.appendChild(body);
      r.appendChild(sign);
      r.appendChild(slot);
      r.appendChild(btn);
    },
  });

  AFRAME.registerComponent("arcade-orchestrator", {
    init() {
      this.power = true;
      const scene = this.el.sceneEl;
      scene.addEventListener("arcade-power", () => {
        this.power = !this.power;
        const neon = ["neonA", "neonB", "neonC"].map((id) => document.getElementById(id));
        neon.forEach((n) => {
          if (!n) return;
          const light = n.getAttribute("light");
          if (!light) return;
          const original = light.intensity ?? 0.6;
          n.setAttribute("light", { ...light, intensity: this.power ? original : 0.0 });
        });
        const ambient = document.querySelector("#lights a-entity[light][light^='type: ambient']") ||
          document.querySelector("#lights").children[0];
        ambient?.setAttribute("light", {
          type: "ambient",
          color: "#cfe4ff",
          intensity: this.power ? 0.25 : 0.05,
        });
      });
      scene.addEventListener("arcade-fog", () => {
        const f = scene.getAttribute("fog");
        const density = f?.density ?? 0.02;
        scene.setAttribute("fog", `type: exponential; color: #0b0d16; density: ${density > 0.01 ? 0.0 : 0.02}`);
      });
    },
  });
});
