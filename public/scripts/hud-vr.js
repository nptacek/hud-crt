import { drawInterface } from "./draw-Interface.js";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float time;
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
  uniform float resolution;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
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
    if (resolution > 1.0) {
      float invResolution = 1.0 / resolution;
      vec2 texelSize = vec2(invResolution) / 512.0;

      vec3 redSample = vec3(0.0);
      vec3 greenSample = vec3(0.0);
      vec3 blueSample = vec3(0.0);

      float redAngleRad = redAngle * 3.14159 / 180.0;
      float greenAngleRad = greenAngle * 3.14159 / 180.0;
      float blueAngleRad = blueAngle * 3.14159 / 180.0;

      vec2 redOffsetDir = vec2(cos(redAngleRad), sin(redAngleRad)) * redOffset;
      vec2 greenOffsetDir = vec2(cos(greenAngleRad), sin(greenAngleRad)) * greenOffset;
      vec2 blueOffsetDir = vec2(cos(blueAngleRad), sin(blueAngleRad)) * blueOffset;

      for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
          vec2 offset = vec2(float(i), float(j)) * texelSize * resolution;
          redSample += texture2D(tDiffuse, scaledUv + offset + redOffsetDir).rgb * redColor / 9.0;
          greenSample += texture2D(tDiffuse, scaledUv + offset + greenOffsetDir).rgb * greenColor / 9.0;
          blueSample += texture2D(tDiffuse, scaledUv + offset + blueOffsetDir).rgb * blueColor / 9.0;
        }
      }

      vec3 color = redSample + greenSample + blueSample;

      float scanline = sin(remappedUv.y * scanlineCount * 3.14159 * 2.0) * 0.5 + 0.5;
      scanline = pow(scanline, 1.2) * scanlineIntensity;
      color *= 1.0 - scanline;

      float noise = random(vUv + vec2(time * 0.01, 0.0)) * noiseIntensity;
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
      color += vec3(glow * tint.r, glow * tint.g, glow * tint.b);

      gl_FragColor = vec4(color, 1.0);
    } else {
      float redAngleRad = redAngle * 3.14159 / 180.0;
      float greenAngleRad = greenAngle * 3.14159 / 180.0;
      float blueAngleRad = blueAngle * 3.14159 / 180.0;

      vec2 redOffsetDir = vec2(cos(redAngleRad), sin(redAngleRad)) * redOffset;
      vec2 greenOffsetDir = vec2(cos(greenAngleRad), sin(greenAngleRad)) * greenOffset;
      vec2 blueOffsetDir = vec2(cos(blueAngleRad), sin(blueAngleRad)) * blueOffset;

      vec3 redSample = texture2D(tDiffuse, scaledUv + redOffsetDir).rgb * redColor;
      vec3 greenSample = texture2D(tDiffuse, scaledUv + greenOffsetDir).rgb * greenColor;
      vec3 blueSample = texture2D(tDiffuse, scaledUv + blueOffsetDir).rgb * blueColor;

      vec3 color = redSample + greenSample + blueSample;

      float scanline = sin(remappedUv.y * scanlineCount * 3.14159 * 2.0) * 0.5 + 0.5;
      scanline = pow(scanline, 1.0) * scanlineIntensity;
      color *= 1.0 - scanline;

      float noise = random(vUv + vec2(time * 0.01, 0.0)) * noiseIntensity;
      color += noise;

      vec3 crtTexture = texture2D(tDiffuse, scaledUv).rgb;

      vec2 bloomOffset = 1.0 / vec2(512.0);
      vec3 bloom = vec3(0.0);
      bloom += texture2D(tDiffuse, scaledUv + vec2(bloomOffset.x, 0.0)).rgb * 0.1;
      bloom += texture2D(tDiffuse, scaledUv - vec2(bloomOffset.x, 0.0)).rgb * 0.1;
      bloom += texture2D(tDiffuse, scaledUv + vec2(0.0, bloomOffset.y)).rgb * 0.1;
      bloom += texture2D(tDiffuse, scaledUv - vec2(0.0, bloomOffset.y)).rgb * 0.1;

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
      color += vec3(glow * tint.r, glow * tint.g, glow * tint.b);

      gl_FragColor = vec4(color, 1.0);
    }
  }
`;

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
      this.uniforms = {
        tDiffuse: { value: null },
        time: { value: 0 },
        curvature: { value: 2.5 },
        scanlineIntensity: { value: 0.5 },
        scanlineCount: { value: 720 },
        vignetteIntensity: { value: 1.1 },
        noiseIntensity: { value: 0.2 },
        flickerIntensity: { value: 0.02 },
        redOffset: { value: 0.003 },
        greenOffset: { value: 0.0015 },
        blueOffset: { value: 0.004 },
        redAngle: { value: 0 },
        greenAngle: { value: 45 },
        blueAngle: { value: 180 },
        redColor: { value: new THREE.Vector3(1.9, 0, 0) },
        greenColor: { value: new THREE.Vector3(0, 1.9, 0) },
        blueColor: { value: new THREE.Vector3(0, 0, 1.9) },
        brightness: { value: 1.45 },
        contrast: { value: 1.35 },
        tint: { value: new THREE.Vector3(0, 0.8, 1) },
        resolution: { value: 1.0 },
      };
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
        this.uniforms.tDiffuse.value = this.texture;
        this.system.registerTexture(this.texture);
        this.system.registerCanvas(this.canvas);
      }
    },
    tick(time) {
      const crt = this.system.getCRTSettings();
      this.uniforms.time.value = time / 1000;
      this.uniforms.curvature.value = crt.curvature;
      this.uniforms.scanlineIntensity.value = crt.scanlineIntensity;
      this.uniforms.noiseIntensity.value = crt.noiseIntensity;
      this.uniforms.flickerIntensity.value = crt.flickerIntensity;
      this.uniforms.resolution.value = crt.resolution;
      this.uniforms.tint.value.set(crt.tint[0], crt.tint[1], crt.tint[2]);
      this.uniforms.redOffset.value = crt.redOffset;
      this.uniforms.greenOffset.value = crt.greenOffset;
      this.uniforms.blueOffset.value = crt.blueOffset;
      this.uniforms.redAngle.value = crt.redAngle;
      this.uniforms.greenAngle.value = crt.greenAngle;
      this.uniforms.blueAngle.value = crt.blueAngle;
      this.uniforms.redColor.value.set(crt.redColor[0], crt.redColor[1], crt.redColor[2]);
      this.uniforms.greenColor.value.set(
        crt.greenColor[0],
        crt.greenColor[1],
        crt.greenColor[2]
      );
      this.uniforms.blueColor.value.set(crt.blueColor[0], crt.blueColor[1], crt.blueColor[2]);
      this.uniforms.brightness.value = crt.brightness;
      this.uniforms.contrast.value = crt.contrast;

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
