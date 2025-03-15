"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useControls, folder, Leva } from "leva";
import { drawInterface, ChromaticAberrationParams } from "./draw-Interface";

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

function CRTScreen({ imageUrl }: { imageUrl: string }) {
  const { size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture: THREE.Texture) => {
      setTexture(loadedTexture);
    });
  }, [imageUrl]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          tDiffuse: { value: texture },
          time: { value: 0 },
          curvature: { value: 2.0 },
          scanlineIntensity: { value: 0.15 },
          scanlineCount: { value: 800 },
          vignetteIntensity: { value: 1.3 },
          noiseIntensity: { value: 0.05 },
          flickerIntensity: { value: 0.03 },
          redOffset: { value: 0.003 },
          greenOffset: { value: 0.0015 },
          blueOffset: { value: 0.004 },
          redAngle: { value: 0 },
          greenAngle: { value: 45 },
          blueAngle: { value: 180 },
          redColor: { value: [1.0, 0.0, 0.0] },
          greenColor: { value: [0.0, 1.0, 0.0] },
          blueColor: { value: [0.0, 0.0, 1.0] },
          brightness: { value: 1.1 },
          contrast: { value: 1.1 },
          resolution: { value: 1.0 },
        }}
      />
    </mesh>
  );
}

export function CRT() {
  const crtSettings = useControls("CRT Effects", {
    curvature: { value: 2.5, min: 0, max: 5, step: 0.1 },
    scanlineIntensity: { value: 0.5, min: 0, max: 1, step: 0.01 },
    noiseIntensity: { value: 0.2, min: 0, max: 0.2, step: 0.01 },
    flickerIntensity: { value: 0, min: 0, max: 0.2, step: 0.01 },
    resolution: {
      value: 1.0,
      min: 1,
      max: 8,
      step: 0.1,
      label: "Resolution (Higher = Softer)",
    },
    chromaticAberration: folder({
      redOffset: {
        value: 0.003,
        min: 0,
        max: 0.02,
        step: 0.0001,
        label: "Red Offset",
      },
      greenOffset: {
        value: 0.0015,
        min: 0,
        max: 0.02,
        step: 0.0001,
        label: "Green Offset",
      },
      blueOffset: {
        value: 0.004,
        min: 0,
        max: 0.02,
        step: 0.0001,
        label: "Blue Offset",
      },
      redAngle: { value: 0, min: 0, max: 360, step: 1, label: "Red Angle" },
      greenAngle: {
        value: 45,
        min: 0,
        max: 360,
        step: 1,
        label: "Green Angle",
      },
      blueAngle: { value: 180, min: 0, max: 360, step: 1, label: "Blue Angle" },
      redColor: {
        value: [1.9, 0.0, 0.0],
        label: "Red Channel Color",
      },
      greenColor: {
        value: [0.0, 1.9, 0.0],
        label: "Green Channel Color",
      },
      blueColor: {
        value: [0.0, 0.0, 1.9],
        label: "Blue Channel Color",
      },
    }),
    tint: {
      value: [0.0, 0.8, 1.0],
      label: "Color Tint",
      render: (get) => true,
    },
  });

  const scanParams = useControls("Scan Parameters", {
    scanType: {
      options: [
        "Brain Scan",
        "Orbital Insertion",
        "Tumor Analysis",
        "Tissue Mapping",
      ],
      value: "Orbital Insertion",
    },
    targetSection: {
      options: ["Frontal", "Temporal", "Central", "Occipital"],
      value: "Central",
    },
    scanResolution: { value: 0.75, min: 0.1, max: 1.0, step: 0.05 },
    showGrid: { value: true },
    showTarget: { value: true },
    targetSize: { value: 0.3, min: 0.1, max: 1.0, step: 0.05 },
    scanProgress: { value: 0.0, min: 0.0, max: 1.0, step: 0.01 },
    autoRotate: { value: true },
  });

  const techParams = useControls("Technical Data", {
    exposureTime: {
      value: 2.8,
      min: 0.5,
      max: 10,
      step: 0.1,
      label: "Exposure (ms)",
    },
    energyLevel: {
      value: 118.4,
      min: 50,
      max: 200,
      step: 0.1,
      label: "Energy (kV)",
    },
    sliceThickness: {
      value: 1.2,
      min: 0.5,
      max: 5,
      step: 0.1,
      label: "Thickness (mm)",
    },
    insertionDepth: {
      value: 42,
      min: 0,
      max: 100,
      step: 1,
      label: "Depth (%)",
    },
    rotationAngle: {
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Rotation",
    },
  });

  const [forceUpdate, setForceUpdate] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const canvasX = (x / rect.width) * 512;
    const canvasY = (y / rect.height) * 512;

    setMousePosition({ x: canvasX, y: canvasY });
  };

  const [targetPosition, setTargetPosition] = useState({ x: 56, y: 56 });

  useEffect(() => {
    let animationFrameId: number;
    let angle = 0;
    const radius = 100;
    const centerX = 256;
    const centerY = 256;
    const speed = 0.005;

    const animate = () => {
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      setTargetPosition({ x, y });
      angle += speed;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = 512;
    canvas.height = 512;

    const chromaticParams: ChromaticAberrationParams = {
      redOffset: crtSettings.redOffset,
      greenOffset: crtSettings.greenOffset,
      blueOffset: crtSettings.blueOffset,
      redAngle: crtSettings.redAngle,
      greenAngle: crtSettings.greenAngle,
      blueAngle: crtSettings.blueAngle,
      redColor: crtSettings.redColor,
      greenColor: crtSettings.greenColor,
      blueColor: crtSettings.blueColor,
    };

    const adjustedScanParams = {
      ...scanParams,
      targetX: targetPosition.x,
      targetY: targetPosition.y,
    };

    drawInterface(canvas, ctx, adjustedScanParams, techParams, chromaticParams);

    const interval = setInterval(() => {
      if (ctx) {
        drawInterface(
          canvas,
          ctx,
          adjustedScanParams,
          techParams,
          chromaticParams
        );
      }
    }, 50);

    return () => clearInterval(interval);
  }, [
    scanParams,
    techParams,
    crtSettings.redOffset,
    crtSettings.greenOffset,
    crtSettings.blueOffset,
    crtSettings.redAngle,
    crtSettings.greenAngle,
    crtSettings.blueAngle,
    crtSettings.redColor,
    crtSettings.greenColor,
    crtSettings.blueColor,
    targetPosition,
  ]);

  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasTexture = new THREE.CanvasTexture(canvasRef.current);
    canvasTexture.needsUpdate = true;
    setTexture(canvasTexture);

    const updateTexture = () => {
      if (canvasTexture) {
        canvasTexture.needsUpdate = true;
      }
    };

    const animationFrameId = requestAnimationFrame(updateTexture);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [crtSettings, scanParams, techParams]);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div className="w-full h-full rounded-lg overflow-hidden border-2 border-[#00aaff]/30 shadow-[0_0_15px_rgba(0,170,255,0.3)]">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <OrbitControls enableZoom={true} enablePan={true} />
          {texture && (
            <CRTEffect
              texture={texture}
              settings={crtSettings}
              materialRef={materialRef}
              key={`crt-effect-${forceUpdate}`}
            />
          )}
        </Canvas>
      </div>
      <Leva
        titleBar={{
          title: "HUD Controls",
          filter: false,
        }}
        collapsed={false}
        theme={{
          colors: {
            accent1: "#0077ff",
            accent2: "#00aaff",
            accent3: "#00ffcc",
            highlight1: "#00ff88",
            highlight2: "#66ffaa",
          },
        }}
      />
    </div>
  );
}

function CRTEffect({
  texture,
  settings,
  materialRef,
}: {
  texture: THREE.Texture;
  settings: {
    curvature: number;
    scanlineIntensity: number;
    noiseIntensity: number;
    flickerIntensity: number;
    tint: number[];
    resolution: number;
    redOffset: number;
    greenOffset: number;
    blueOffset: number;
    redAngle: number;
    greenAngle: number;
    blueAngle: number;
    redColor: number[];
    greenColor: number[];
    blueColor: number[];
  };
  materialRef: React.RefObject<THREE.ShaderMaterial | null>;
}) {
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.curvature.value = settings.curvature;
      materialRef.current.uniforms.scanlineIntensity.value =
        settings.scanlineIntensity;
      materialRef.current.uniforms.noiseIntensity.value =
        settings.noiseIntensity;
      materialRef.current.uniforms.flickerIntensity.value =
        settings.flickerIntensity;
      materialRef.current.uniforms.tint.value = new THREE.Vector3(
        settings.tint[0],
        settings.tint[1],
        settings.tint[2]
      );
      materialRef.current.uniforms.resolution.value = settings.resolution;

      materialRef.current.uniforms.redOffset.value = settings.redOffset;
      materialRef.current.uniforms.greenOffset.value = settings.greenOffset;
      materialRef.current.uniforms.blueOffset.value = settings.blueOffset;
      materialRef.current.uniforms.redAngle.value = settings.redAngle;
      materialRef.current.uniforms.greenAngle.value = settings.greenAngle;
      materialRef.current.uniforms.blueAngle.value = settings.blueAngle;

      materialRef.current.uniforms.redColor.value = new THREE.Vector3(
        settings.redColor[0],
        settings.redColor[1],
        settings.redColor[2]
      );
      materialRef.current.uniforms.greenColor.value = new THREE.Vector3(
        settings.greenColor[0],
        settings.greenColor[1],
        settings.greenColor[2]
      );
      materialRef.current.uniforms.blueColor.value = new THREE.Vector3(
        settings.blueColor[0],
        settings.blueColor[1],
        settings.blueColor[2]
      );

      if (materialRef.current.uniforms.tDiffuse.value !== texture) {
        materialRef.current.uniforms.tDiffuse.value = texture;
      }

      materialRef.current.needsUpdate = true;
      texture.needsUpdate = true;
    }
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true;
    }
  }, [settings]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          tDiffuse: { value: texture },
          time: { value: 0 },
          curvature: { value: settings.curvature },
          scanlineIntensity: { value: settings.scanlineIntensity },
          scanlineCount: { value: 400 },
          vignetteIntensity: { value: 1.1 },
          noiseIntensity: { value: settings.noiseIntensity },
          flickerIntensity: { value: settings.flickerIntensity },
          redOffset: { value: settings.redOffset },
          greenOffset: { value: settings.greenOffset },
          blueOffset: { value: settings.blueOffset },
          redAngle: { value: settings.redAngle },
          greenAngle: { value: settings.greenAngle },
          blueAngle: { value: settings.blueAngle },
          redColor: {
            value: new THREE.Vector3(
              settings.redColor[0],
              settings.redColor[1],
              settings.redColor[2]
            ),
          },
          greenColor: {
            value: new THREE.Vector3(
              settings.greenColor[0],
              settings.greenColor[1],
              settings.greenColor[2]
            ),
          },
          blueColor: {
            value: new THREE.Vector3(
              settings.blueColor[0],
              settings.blueColor[1],
              settings.blueColor[2]
            ),
          },
          brightness: { value: 1.5 },
          contrast: { value: 1.5 },
          tint: {
            value: new THREE.Vector3(
              settings.tint[0],
              settings.tint[1],
              settings.tint[2]
            ),
          },
          resolution: { value: settings.resolution },
        }}
      />
    </mesh>
  );
}
