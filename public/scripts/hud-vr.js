import { drawInterface } from "./draw-Interface.js";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;

  /*
   * Fragment shader adapted from Grok's CRT shader (MIT License).
   * https://github.com/xai-org/grok
   */
  uniform sampler2D tDiffuse;
  uniform float time;
  uniform vec2 resolution;
  uniform float curvature;
  uniform float scanlineIntensity;
  uniform float scanlineCount;
  uniform float vignetteIntensity;
  uniform float noiseIntensity;
  uniform float flickerIntensity;
  uniform float redOffset;
  uniform float greenOffset;
  uniform float blueOffset;
  uniform float redAngle;
  uniform float greenAngle;
  uniform float blueAngle;
  uniform vec3 redColor;
  uniform vec3 greenColor;
  uniform vec3 blueColor;
  uniform float brightness;
  uniform float contrast;
  uniform vec3 tint;
  uniform float resolutionScale;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  vec3 hsv(float h, float s, float v) {
    vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return v * mix(vec3(1.0), rgb, s);
  }

  vec2 curveRemapUV(vec2 uv) {
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / vec2(curvature, curvature);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
  }

  void main() {
    vec2 remappedUv = curveRemapUV(vUv);

    if (remappedUv.x < 0.0 || remappedUv.x > 1.0 || remappedUv.y < 0.0 || remappedUv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }

    vec2 scaledUv = remappedUv;
    float sampleScale = max(resolutionScale, 1.0);
    vec2 safeResolution = vec2(max(resolution.x, 1.0), max(resolution.y, 1.0));
    vec2 texelSize = vec2(1.0) / safeResolution;

    vec2 redOffsetDir = rotate2D(radians(redAngle)) * vec2(redOffset, 0.0);
    vec2 greenOffsetDir = rotate2D(radians(greenAngle)) * vec2(greenOffset, 0.0);
    vec2 blueOffsetDir = rotate2D(radians(blueAngle)) * vec2(blueOffset, 0.0);

    vec3 color;
    if (sampleScale > 1.0) {
      vec3 redSample = vec3(0.0);
      vec3 greenSample = vec3(0.0);
      vec3 blueSample = vec3(0.0);

      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          vec2 offset = vec2(float(i), float(j)) * texelSize * sampleScale;
          redSample += texture2D(tDiffuse, scaledUv + offset + redOffsetDir).rgb * redColor / 9.0;
          greenSample += texture2D(tDiffuse, scaledUv + offset + greenOffsetDir).rgb * greenColor / 9.0;
          blueSample += texture2D(tDiffuse, scaledUv + offset + blueOffsetDir).rgb * blueColor / 9.0;
        }
      }

      color = redSample + greenSample + blueSample;
    } else {
      vec3 redSample = texture2D(tDiffuse, scaledUv + redOffsetDir).rgb * redColor;
      vec3 greenSample = texture2D(tDiffuse, scaledUv + greenOffsetDir).rgb * greenColor;
      vec3 blueSample = texture2D(tDiffuse, scaledUv + blueOffsetDir).rgb * blueColor;

      color = redSample + greenSample + blueSample;
    }

    float scanline = sin(remappedUv.y * scanlineCount * 3.14159 * 2.0) * 0.5 + 0.5;
    scanline = pow(scanline, 1.1) * scanlineIntensity;
    color *= 1.0 - scanline;

    vec2 screenUv = gl_FragCoord.xy / safeResolution;
    float noise = random(screenUv + vec2(time * 0.03, 0.0)) * noiseIntensity;
    color += noise;

    vec2 bloomOffset = texelSize * 2.0;
    vec3 bloom = vec3(0.0);
    bloom += texture2D(tDiffuse, scaledUv + vec2(bloomOffset.x, 0.0)).rgb * 0.1;
    bloom += texture2D(tDiffuse, scaledUv - vec2(bloomOffset.x, 0.0)).rgb * 0.1;
    bloom += texture2D(tDiffuse, scaledUv + vec2(0.0, bloomOffset.y)).rgb * 0.1;
    bloom += texture2D(tDiffuse, scaledUv - vec2(0.0, bloomOffset.y)).rgb * 0.1;

    vec3 crtTexture = texture2D(tDiffuse, scaledUv).rgb;
    vec3 enhancedTexture = crtTexture + bloom * 0.5;

    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    float mixFactor = 0.5 + luminance * 0.2;
    color = mix(color, enhancedTexture, mixFactor);

    float flicker = random(vec2(time * 0.1, 0.0)) * flickerIntensity;
    color *= 1.0 - flicker;

    float vignette = length(vUv - 0.5) * vignetteIntensity;
    color *= 1.0 - vignette;

    color = (color - 0.5) * contrast + 0.5;
    color *= brightness;

    float glow = max(max(color.r, color.g), color.b) * 0.6;
    vec3 dynamicTint = hsv(mod(time * 0.05 + remappedUv.y * 0.12, 1.0), 0.45, 1.0);
    color += vec3(glow * tint.r, glow * tint.g, glow * tint.b);
    color += dynamicTint * glow * 0.1;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const CRT_SHADER_DEFAULTS = {
  time: 0,
  curvature: 2.5,
  scanlineIntensity: 0.5,
  scanlineCount: 720,
  vignetteIntensity: 1.1,
  noiseIntensity: 0.2,
  flickerIntensity: 0.02,
  redOffset: 0.003,
  greenOffset: 0.0015,
  blueOffset: 0.004,
  redAngle: 0,
  greenAngle: 45,
  blueAngle: 180,
  redColor: { x: 1.9, y: 0.0, z: 0.0 },
  greenColor: { x: 0.0, y: 1.9, z: 0.0 },
  blueColor: { x: 0.0, y: 0.0, z: 1.9 },
  brightness: 1.45,
  contrast: 1.35,
  tint: { x: 0.0, y: 0.8, z: 1.0 },
  resolution: { x: 512, y: 512 },
  resolutionScale: 1.0,
};

function toVec3(value, fallback) {
  if (Array.isArray(value)) {
    return { x: value[0] ?? fallback.x, y: value[1] ?? fallback.y, z: value[2] ?? fallback.z };
  }
  if (value && typeof value === "object") {
    if ("x" in value && "y" in value && "z" in value) {
      return { x: value.x, y: value.y, z: value.z };
    }
    if ("r" in value && "g" in value && "b" in value) {
      return { x: value.r, y: value.g, z: value.b };
    }
  }
  return { x: fallback.x, y: fallback.y, z: fallback.z };
}

function toVec2(value, fallback) {
  if (Array.isArray(value)) {
    return { x: value[0] ?? fallback.x, y: value[1] ?? fallback.y };
  }
  if (value && typeof value === "object") {
    if ("x" in value && "y" in value) {
      return { x: value.x, y: value.y };
    }
    if ("width" in value && "height" in value) {
      return { x: value.width, y: value.height };
    }
  }
  return { x: fallback.x, y: fallback.y };
}

function createCrtUniforms(THREE, data = {}) {
  const redColor = toVec3(data.redColor ?? CRT_SHADER_DEFAULTS.redColor, CRT_SHADER_DEFAULTS.redColor);
  const greenColor = toVec3(data.greenColor ?? CRT_SHADER_DEFAULTS.greenColor, CRT_SHADER_DEFAULTS.greenColor);
  const blueColor = toVec3(data.blueColor ?? CRT_SHADER_DEFAULTS.blueColor, CRT_SHADER_DEFAULTS.blueColor);
  const tint = toVec3(data.tint ?? CRT_SHADER_DEFAULTS.tint, CRT_SHADER_DEFAULTS.tint);
  const resolution = toVec2(data.resolution ?? CRT_SHADER_DEFAULTS.resolution, CRT_SHADER_DEFAULTS.resolution);

  return {
    tDiffuse: { value: data.map ?? null },
    time: { value: data.time ?? CRT_SHADER_DEFAULTS.time },
    curvature: { value: data.curvature ?? CRT_SHADER_DEFAULTS.curvature },
    scanlineIntensity: { value: data.scanlineIntensity ?? CRT_SHADER_DEFAULTS.scanlineIntensity },
    scanlineCount: { value: data.scanlineCount ?? CRT_SHADER_DEFAULTS.scanlineCount },
    vignetteIntensity: { value: data.vignetteIntensity ?? CRT_SHADER_DEFAULTS.vignetteIntensity },
    noiseIntensity: { value: data.noiseIntensity ?? CRT_SHADER_DEFAULTS.noiseIntensity },
    flickerIntensity: { value: data.flickerIntensity ?? CRT_SHADER_DEFAULTS.flickerIntensity },
    redOffset: { value: data.redOffset ?? CRT_SHADER_DEFAULTS.redOffset },
    greenOffset: { value: data.greenOffset ?? CRT_SHADER_DEFAULTS.greenOffset },
    blueOffset: { value: data.blueOffset ?? CRT_SHADER_DEFAULTS.blueOffset },
    redAngle: { value: data.redAngle ?? CRT_SHADER_DEFAULTS.redAngle },
    greenAngle: { value: data.greenAngle ?? CRT_SHADER_DEFAULTS.greenAngle },
    blueAngle: { value: data.blueAngle ?? CRT_SHADER_DEFAULTS.blueAngle },
    redColor: { value: new THREE.Vector3(redColor.x, redColor.y, redColor.z) },
    greenColor: { value: new THREE.Vector3(greenColor.x, greenColor.y, greenColor.z) },
    blueColor: { value: new THREE.Vector3(blueColor.x, blueColor.y, blueColor.z) },
    brightness: { value: data.brightness ?? CRT_SHADER_DEFAULTS.brightness },
    contrast: { value: data.contrast ?? CRT_SHADER_DEFAULTS.contrast },
    tint: { value: new THREE.Vector3(tint.x, tint.y, tint.z) },
    resolution: { value: new THREE.Vector2(resolution.x, resolution.y) },
    resolutionScale: { value: data.resolutionScale ?? CRT_SHADER_DEFAULTS.resolutionScale },
  };
}

function updateCrtUniforms(uniforms, data = {}) {
  if (!uniforms) return;
  if ("map" in data && "tDiffuse" in uniforms) {
    uniforms.tDiffuse.value = data.map;
  }
  if ("time" in data && "time" in uniforms) {
    uniforms.time.value = data.time;
  }
  if ("curvature" in data && "curvature" in uniforms) {
    uniforms.curvature.value = data.curvature;
  }
  if ("scanlineIntensity" in data && "scanlineIntensity" in uniforms) {
    uniforms.scanlineIntensity.value = data.scanlineIntensity;
  }
  if ("scanlineCount" in data && "scanlineCount" in uniforms) {
    uniforms.scanlineCount.value = data.scanlineCount;
  }
  if ("vignetteIntensity" in data && "vignetteIntensity" in uniforms) {
    uniforms.vignetteIntensity.value = data.vignetteIntensity;
  }
  if ("noiseIntensity" in data && "noiseIntensity" in uniforms) {
    uniforms.noiseIntensity.value = data.noiseIntensity;
  }
  if ("flickerIntensity" in data && "flickerIntensity" in uniforms) {
    uniforms.flickerIntensity.value = data.flickerIntensity;
  }
  if ("redOffset" in data && "redOffset" in uniforms) {
    uniforms.redOffset.value = data.redOffset;
  }
  if ("greenOffset" in data && "greenOffset" in uniforms) {
    uniforms.greenOffset.value = data.greenOffset;
  }
  if ("blueOffset" in data && "blueOffset" in uniforms) {
    uniforms.blueOffset.value = data.blueOffset;
  }
  if ("redAngle" in data && "redAngle" in uniforms) {
    uniforms.redAngle.value = data.redAngle;
  }
  if ("greenAngle" in data && "greenAngle" in uniforms) {
    uniforms.greenAngle.value = data.greenAngle;
  }
  if ("blueAngle" in data && "blueAngle" in uniforms) {
    uniforms.blueAngle.value = data.blueAngle;
  }
  if ("redColor" in data && uniforms.redColor) {
    const vec = toVec3(data.redColor, CRT_SHADER_DEFAULTS.redColor);
    uniforms.redColor.value.set(vec.x, vec.y, vec.z);
  }
  if ("greenColor" in data && uniforms.greenColor) {
    const vec = toVec3(data.greenColor, CRT_SHADER_DEFAULTS.greenColor);
    uniforms.greenColor.value.set(vec.x, vec.y, vec.z);
  }
  if ("blueColor" in data && uniforms.blueColor) {
    const vec = toVec3(data.blueColor, CRT_SHADER_DEFAULTS.blueColor);
    uniforms.blueColor.value.set(vec.x, vec.y, vec.z);
  }
  if ("brightness" in data && "brightness" in uniforms) {
    uniforms.brightness.value = data.brightness;
  }
  if ("contrast" in data && "contrast" in uniforms) {
    uniforms.contrast.value = data.contrast;
  }
  if ("tint" in data && uniforms.tint) {
    const vec = toVec3(data.tint, CRT_SHADER_DEFAULTS.tint);
    uniforms.tint.value.set(vec.x, vec.y, vec.z);
  }
  if ("resolution" in data && uniforms.resolution) {
    const vec = toVec2(data.resolution, CRT_SHADER_DEFAULTS.resolution);
    uniforms.resolution.value.set(vec.x, vec.y);
  }
  if ("resolutionScale" in data && "resolutionScale" in uniforms) {
    uniforms.resolutionScale.value = data.resolutionScale;
  }
}

function registerHudCrtShader(AFRAME) {
  if (AFRAME.shaders && AFRAME.shaders["hud-crt"]) {
    return;
  }

  AFRAME.registerShader("hud-crt", {
    schema: {
      map: { type: "map", is: "uniform", default: null },
      time: { type: "time", is: "uniform", default: CRT_SHADER_DEFAULTS.time },
      curvature: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.curvature },
      scanlineIntensity: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.scanlineIntensity },
      scanlineCount: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.scanlineCount },
      vignetteIntensity: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.vignetteIntensity },
      noiseIntensity: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.noiseIntensity },
      flickerIntensity: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.flickerIntensity },
      redOffset: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.redOffset },
      greenOffset: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.greenOffset },
      blueOffset: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.blueOffset },
      redAngle: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.redAngle },
      greenAngle: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.greenAngle },
      blueAngle: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.blueAngle },
      redColor: { type: "vec3", is: "uniform", default: CRT_SHADER_DEFAULTS.redColor },
      greenColor: { type: "vec3", is: "uniform", default: CRT_SHADER_DEFAULTS.greenColor },
      blueColor: { type: "vec3", is: "uniform", default: CRT_SHADER_DEFAULTS.blueColor },
      brightness: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.brightness },
      contrast: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.contrast },
      tint: { type: "vec3", is: "uniform", default: CRT_SHADER_DEFAULTS.tint },
      resolution: { type: "vec2", is: "uniform", default: CRT_SHADER_DEFAULTS.resolution },
      resolutionScale: { type: "number", is: "uniform", default: CRT_SHADER_DEFAULTS.resolutionScale },
    },
    init(data) {
      const THREE = AFRAME.THREE;
      this.uniforms = createCrtUniforms(THREE, data);
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader,
      });
    },
    update(data) {
      updateCrtUniforms(this.uniforms, data);
    },
  });
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function registerHudTelemetrySystem(AFRAME) {
  if (AFRAME.systems && AFRAME.systems["hud-telemetry"]) {
    return;
  }

  AFRAME.registerSystem("hud-telemetry", {
    init() {
      const now = Date.now();
      const baseScan = {
        showGrid: true,
        showTarget: true,
        targetSize: 0.3,
        scanResolution: 0.75,
        autoRotate: true,
        scanProgress: 0,
        scanType: "Orbital Insertion",
        targetSection: "Central",
        targetX: 256,
        targetY: 256,
      };

      const baseTech = {
        exposureTime: 2.8,
        energyLevel: 118.4,
        sliceThickness: 1.2,
        insertionDepth: 42,
        rotationAngle: 0.2,
      };

      const baseChromatic = {
        redOffset: 0.003,
        greenOffset: 0.0015,
        blueOffset: 0.004,
        redAngle: 0,
        greenAngle: 45,
        blueAngle: 180,
        redColor: [1.9, 0.0, 0.0],
        greenColor: [0.0, 1.9, 0.0],
        blueColor: [0.0, 0.0, 1.9],
      };

      const baseSystem = {
        systemLoad: Array.from({ length: 16 }, (_, i) =>
          55 + Math.sin(now / 12000 + i * 0.4) * 20
        ),
        signalStrength: 60,
        noiseLevels: Array.from({ length: 128 }, (_, i) =>
          Math.sin(now / 800 + i * 0.12) * 10
        ),
        fuelCells: Array.from({ length: 8 }, () => 80),
        lifeSupportStatus: "NOMINAL",
        lastUpdateTime: now,
      };

      this.scan = baseScan;
      this.tech = baseTech;
      this.chromatic = baseChromatic;
      this.crt = {
        curvature: 2.5,
        scanlineIntensity: 0.5,
        noiseIntensity: 0.2,
        flickerIntensity: 0.02,
        resolution: 1.0,
        tint: [0.0, 0.8, 1.0],
        redOffset: 0.003,
        greenOffset: 0.0015,
        blueOffset: 0.004,
        redAngle: 0,
        greenAngle: 45,
        blueAngle: 180,
        redColor: [1.9, 0.0, 0.0],
        greenColor: [0.0, 1.9, 0.0],
        blueColor: [0.0, 0.0, 1.9],
        brightness: 1.45,
        contrast: 1.35,
      };

      this.systemData = baseSystem;
      this.listeners = new Set();
      this.targetAngle = 0;
      this.texture = null;
      this.canvas = null;
      this.textureDirty = false;
      this.lifeSupportStates = ["NOMINAL", "CHECK", "ALERT"];
      this.lastUpdate = 0;
    },
    registerCanvas(canvas) {
      this.canvas = canvas;
    },
    registerTexture(texture) {
      this.texture = texture;
    },
    markTextureDirty() {
      if (this.texture) {
        this.textureDirty = true;
      }
    },
    consumeTextureDirty() {
      if (this.textureDirty && this.texture) {
        this.textureDirty = false;
        return true;
      }
      return false;
    },
    subscribe(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    },
    notify() {
      this.listeners.forEach((cb) => cb());
    },
    getPayload() {
      const scan = { ...this.scan };
      const tech = { ...this.tech };
      const chromatic = {
        ...this.chromatic,
        redColor: [...this.chromatic.redColor],
        greenColor: [...this.chromatic.greenColor],
        blueColor: [...this.chromatic.blueColor],
      };
      const system = {
        ...this.systemData,
        systemLoad: [...this.systemData.systemLoad],
        noiseLevels: [...this.systemData.noiseLevels],
        fuelCells: [...this.systemData.fuelCells],
        lastUpdateTime: Date.now(),
      };

      return {
        scanParams: scan,
        techParams: tech,
        chromaticParams: chromatic,
        systemData: system,
      };
    },
    getCRTSettings() {
      return this.crt;
    },
    getValue(group, key) {
      if (this[group] && key in this[group]) {
        return this[group][key];
      }
      return undefined;
    },
    adjust(group, key, delta, min, max) {
      if (!this[group]) return;
      const next = clamp((this[group][key] ?? 0) + delta, min, max);
      this[group][key] = next;
      this.notify();
    },
    tick(time, delta) {
      const elapsed = delta || 16;
      const rotationSpeed = this.scan.autoRotate ? 0.45 : 0;
      this.targetAngle = (this.targetAngle + (elapsed / 1000) * rotationSpeed) % (Math.PI * 2);
      const orbitRadius = 110 + Math.sin(time / 4000) * 14;
      this.scan.targetX = 256 + Math.cos(this.targetAngle) * orbitRadius;
      this.scan.targetY = 256 + Math.sin(this.targetAngle) * orbitRadius;
      this.scan.scanProgress = (Math.sin(time / 6000) + 1) / 2;

      if (!this.lastUpdate) {
        this.lastUpdate = time;
      }

      if (time - this.lastUpdate > 80) {
        const now = Date.now();
        this.systemData.systemLoad = this.systemData.systemLoad.map((value, index) => {
          const target = 45 + Math.sin(now / 8000 + index * 0.35) * 25 + Math.random() * 4;
          return value + (target - value) * 0.08;
        });

        this.systemData.noiseLevels = this.systemData.noiseLevels.map((value, index) => {
          const target =
            Math.sin(now / 900 + index * 0.18) * 9 +
            Math.sin(now / 2300 + index * 0.11) * 4;
          return value + (target - value) * 0.2;
        });

        this.systemData.fuelCells = this.systemData.fuelCells.map((value, index) => {
          const drift = Math.sin(now / 15000 + index) * 2 - 0.25;
          const next = value + drift;
          return clamp(next, 35, 100);
        });

        const signalTarget =
          65 +
          Math.sin(now / 5000) * 18 +
          Math.cos(now / 2700) * 8 +
          Math.random() * 2;
        this.systemData.signalStrength += (signalTarget - this.systemData.signalStrength) * 0.1;
        this.systemData.signalStrength = clamp(this.systemData.signalStrength, 20, 100);

        const stressLevel = Math.max(0, Math.min(1, (90 - this.systemData.signalStrength) / 40));
        const stateIndex = stressLevel > 0.75 ? 2 : stressLevel > 0.35 ? 1 : 0;
        this.systemData.lifeSupportStatus = this.lifeSupportStates[stateIndex];

        this.systemData.lastUpdateTime = now;
        this.notify();
        this.lastUpdate = time;
      }
    },
  });
}

function registerHudDrawComponent(AFRAME) {
  if (AFRAME.components && AFRAME.components["hud-draw"]) {
    return;
  }

  AFRAME.registerComponent("hud-draw", {
    schema: {
      canvas: { type: "selector" },
      interval: { type: "number", default: 50 },
    },
    init() {
      this.system = this.el.sceneEl.systems["hud-telemetry"];
      this.canvas = this.data.canvas;
      if (!this.canvas) {
        this.canvas = document.querySelector(this.data.canvas || "#hud-canvas");
      }
      if (this.canvas) {
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.ctx = this.canvas.getContext("2d");
        this.system.registerCanvas(this.canvas);
      }
      this.nextDraw = 0;
      this.dirty = true;
      this.unsubscribe = this.system.subscribe(() => {
        this.dirty = true;
      });
    },
    remove() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
    },
    tick(time) {
      if (!this.ctx || !this.canvas) return;

      if (this.dirty || time >= this.nextDraw) {
        const payload = this.system.getPayload();
        drawInterface(
          this.canvas,
          this.ctx,
          payload.scanParams,
          payload.techParams,
          payload.chromaticParams,
          payload.systemData
        );
        this.system.markTextureDirty();
        this.nextDraw = time + this.data.interval;
        this.dirty = false;
      }
    },
  });
}

function registerCrtDisplayComponent(AFRAME) {
  if (AFRAME.components && AFRAME.components["crt-display"]) {
    return;
  }

  AFRAME.registerComponent("crt-display", {
    schema: {
      canvas: { type: "string", default: "#hud-canvas" },
    },
    init() {
      const THREE = AFRAME.THREE;
      this.system = this.el.sceneEl.systems["hud-telemetry"];
      this.canvas = null;
      this.texture = null;
      const initialCRT = this.system ? this.system.getCRTSettings() : null;
      this.uniforms = createCrtUniforms(THREE, {
        curvature: initialCRT?.curvature,
        scanlineIntensity: initialCRT?.scanlineIntensity,
        noiseIntensity: initialCRT?.noiseIntensity,
        flickerIntensity: initialCRT?.flickerIntensity,
        redOffset: initialCRT?.redOffset,
        greenOffset: initialCRT?.greenOffset,
        blueOffset: initialCRT?.blueOffset,
        redAngle: initialCRT?.redAngle,
        greenAngle: initialCRT?.greenAngle,
        blueAngle: initialCRT?.blueAngle,
        redColor: initialCRT ? { x: initialCRT.redColor[0], y: initialCRT.redColor[1], z: initialCRT.redColor[2] } : undefined,
        greenColor: initialCRT
          ? { x: initialCRT.greenColor[0], y: initialCRT.greenColor[1], z: initialCRT.greenColor[2] }
          : undefined,
        blueColor: initialCRT
          ? { x: initialCRT.blueColor[0], y: initialCRT.blueColor[1], z: initialCRT.blueColor[2] }
          : undefined,
        brightness: initialCRT?.brightness,
        contrast: initialCRT?.contrast,
        tint: initialCRT ? { x: initialCRT.tint[0], y: initialCRT.tint[1], z: initialCRT.tint[2] } : undefined,
        resolutionScale: initialCRT?.resolution,
      });
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader,
      });

      const applyMaterial = () => {
        const mesh = this.el.getObject3D("mesh");
        if (mesh) {
          mesh.material = this.material;
          mesh.material.needsUpdate = true;
        }
      };

      if (this.el.getObject3D("mesh")) {
        applyMaterial();
      } else {
        this.el.addEventListener("object3dset", (evt) => {
          if (evt.detail.type === "mesh") {
            applyMaterial();
          }
        });
      }
    },
    update() {
      const THREE = AFRAME.THREE;
      if (!this.canvas) {
        this.canvas = document.querySelector(this.data.canvas || "#hud-canvas");
      }
      if (this.canvas && !this.texture) {
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = false;
        this.texture.needsUpdate = true;
        updateCrtUniforms(this.uniforms, { map: this.texture });
        this.system.registerTexture(this.texture);
        this.system.registerCanvas(this.canvas);
      }
      if (this.canvas) {
        updateCrtUniforms(this.uniforms, {
          resolution: { x: this.canvas.width, y: this.canvas.height },
        });
      }
    },
    tick(time) {
      const crt = this.system.getCRTSettings();
      updateCrtUniforms(this.uniforms, {
        time: time / 1000,
        curvature: crt.curvature,
        scanlineIntensity: crt.scanlineIntensity,
        noiseIntensity: crt.noiseIntensity,
        flickerIntensity: crt.flickerIntensity,
        resolutionScale: crt.resolution,
        tint: { x: crt.tint[0], y: crt.tint[1], z: crt.tint[2] },
        redOffset: crt.redOffset,
        greenOffset: crt.greenOffset,
        blueOffset: crt.blueOffset,
        redAngle: crt.redAngle,
        greenAngle: crt.greenAngle,
        blueAngle: crt.blueAngle,
        redColor: { x: crt.redColor[0], y: crt.redColor[1], z: crt.redColor[2] },
        greenColor: { x: crt.greenColor[0], y: crt.greenColor[1], z: crt.greenColor[2] },
        blueColor: { x: crt.blueColor[0], y: crt.blueColor[1], z: crt.blueColor[2] },
        brightness: crt.brightness,
        contrast: crt.contrast,
      });

      if (this.system.consumeTextureDirty() && this.texture) {
        this.texture.needsUpdate = true;
      }
    },
  });
}

function registerHudControlsComponent(AFRAME) {
  if (AFRAME.components && AFRAME.components["hud-controls"]) {
    return;
  }

  AFRAME.registerComponent("hud-controls", {
    init() {
      this.system = this.el.sceneEl.systems["hud-telemetry"];
      this.rows = [];
      this.el.setAttribute("geometry", {
        primitive: "plane",
        width: 1.8,
        height: 2.2,
      });
      this.el.setAttribute("material", {
        color: "#021320",
        opacity: 0.85,
        shader: "flat",
        transparent: true,
        side: "double",
      });

      const groups = [
        {
          title: "CRT EFFECTS",
          controls: [
            {
              label: "Curvature",
              group: "crt",
              key: "curvature",
              step: 0.1,
              min: 0,
              max: 5,
              format: (value) => value.toFixed(1),
            },
            {
              label: "Scanlines",
              group: "crt",
              key: "scanlineIntensity",
              step: 0.05,
              min: 0,
              max: 1,
              format: (value) => value.toFixed(2),
            },
            {
              label: "Noise",
              group: "crt",
              key: "noiseIntensity",
              step: 0.01,
              min: 0,
              max: 0.3,
              format: (value) => value.toFixed(2),
            },
          ],
        },
        {
          title: "SCAN PARAMETERS",
          controls: [
            {
              label: "Resolution",
              group: "scan",
              key: "scanResolution",
              step: 0.05,
              min: 0.1,
              max: 1.0,
              format: (value) => value.toFixed(2),
            },
            {
              label: "Target Size",
              group: "scan",
              key: "targetSize",
              step: 0.05,
              min: 0.1,
              max: 1.0,
              format: (value) => value.toFixed(2),
            },
            {
              label: "Progress",
              group: "scan",
              key: "scanProgress",
              step: 0.05,
              min: 0,
              max: 1,
              format: (value) => `${Math.round(value * 100)}%`,
            },
          ],
        },
        {
          title: "TECHNICAL DATA",
          controls: [
            {
              label: "Exposure",
              group: "tech",
              key: "exposureTime",
              step: 0.1,
              min: 0.5,
              max: 10,
              format: (value) => value.toFixed(1),
            },
            {
              label: "Energy",
              group: "tech",
              key: "energyLevel",
              step: 1,
              min: 50,
              max: 200,
              format: (value) => `${Math.round(value)}kV`,
            },
            {
              label: "Depth",
              group: "tech",
              key: "insertionDepth",
              step: 1,
              min: 0,
              max: 100,
              format: (value) => `${Math.round(value)}%`,
            },
          ],
        },
      ];

      let yOffset = 0.95;
      groups.forEach((group) => {
        const header = document.createElement("a-text");
        header.setAttribute("value", group.title);
        header.setAttribute("color", "#00d7ff");
        header.setAttribute("align", "left");
        header.setAttribute("width", 1.6);
        header.setAttribute("position", `-0.85 ${yOffset} 0.01`);
        this.el.appendChild(header);
        yOffset -= 0.18;

        group.controls.forEach((control) => {
          const row = document.createElement("a-entity");
          row.setAttribute("position", `0 ${yOffset} 0.02`);
          this.el.appendChild(row);

          const label = document.createElement("a-text");
          label.setAttribute("value", control.label);
          label.setAttribute("color", "#8fe3ff");
          label.setAttribute("align", "left");
          label.setAttribute("width", 1.2);
          label.setAttribute("position", "-0.85 0 0.01");
          row.appendChild(label);

          const valueText = document.createElement("a-text");
          const initialValue = this.system.getValue(control.group, control.key) ?? 0;
          valueText.setAttribute("value", control.format(initialValue));
          valueText.setAttribute("color", "#00ffaa");
          valueText.setAttribute("align", "right");
          valueText.setAttribute("width", 0.8);
          valueText.setAttribute("position", "0.2 0 0.01");
          row.appendChild(valueText);

          const decrement = document.createElement("a-plane");
          decrement.setAttribute("class", "interactive");
          decrement.setAttribute("color", "#02263a");
          decrement.setAttribute("width", 0.16);
          decrement.setAttribute("height", 0.12);
          decrement.setAttribute("position", "0.5 0 0");
          decrement.setAttribute("material", {
            color: "#02263a",
            opacity: 0.9,
            shader: "flat",
            transparent: true,
          });
          row.appendChild(decrement);

          const decrementLabel = document.createElement("a-text");
          decrementLabel.setAttribute("value", "−");
          decrementLabel.setAttribute("color", "#00ffaa");
          decrementLabel.setAttribute("align", "center");
          decrementLabel.setAttribute("width", 0.4);
          decrementLabel.setAttribute("position", "0 0 0.01");
          decrement.appendChild(decrementLabel);

          const increment = document.createElement("a-plane");
          increment.setAttribute("class", "interactive");
          increment.setAttribute("color", "#02263a");
          increment.setAttribute("width", 0.16);
          increment.setAttribute("height", 0.12);
          increment.setAttribute("position", "0.7 0 0");
          increment.setAttribute("material", {
            color: "#02263a",
            opacity: 0.9,
            shader: "flat",
            transparent: true,
          });
          row.appendChild(increment);

          const incrementLabel = document.createElement("a-text");
          incrementLabel.setAttribute("value", "+");
          incrementLabel.setAttribute("color", "#00ffaa");
          incrementLabel.setAttribute("align", "center");
          incrementLabel.setAttribute("width", 0.4);
          incrementLabel.setAttribute("position", "0 0 0.01");
          increment.appendChild(incrementLabel);

          decrement.addEventListener("click", () => {
            this.system.adjust(
              control.group,
              control.key,
              -control.step,
              control.min,
              control.max
            );
          });

          increment.addEventListener("click", () => {
            this.system.adjust(
              control.group,
              control.key,
              control.step,
              control.min,
              control.max
            );
          });

          this.rows.push({ control, valueText });
          yOffset -= 0.16;
        });

        yOffset -= 0.1;
      });
    },
    tick() {
      if (!this.rows) return;
      this.rows.forEach(({ control, valueText }) => {
        const rawValue = this.system.getValue(control.group, control.key) ?? 0;
        valueText.setAttribute("value", control.format(rawValue));
      });
    },
  });
}

function ensureHudRegistered(AFRAME) {
  if (!window.__HUD_AFRAME_REGISTERED__) {
    registerHudCrtShader(AFRAME);
    registerHudTelemetrySystem(AFRAME);
    registerHudDrawComponent(AFRAME);
    registerCrtDisplayComponent(AFRAME);
    registerHudControlsComponent(AFRAME);
    window.__HUD_AFRAME_REGISTERED__ = true;
  }
}

function waitForDomReady() {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", resolve, { once: true });
  });
}

function waitForAframe() {
  if (window.AFRAME) {
    return Promise.resolve(window.AFRAME);
  }
  return new Promise((resolve) => {
    window.addEventListener(
      "aframe-loaded",
      () => {
        resolve(window.AFRAME);
      },
      { once: true }
    );
  });
}

Promise.all([waitForDomReady(), waitForAframe()]).then(([, AFRAME]) => {
  if (!AFRAME) return;
  ensureHudRegistered(AFRAME);
});
