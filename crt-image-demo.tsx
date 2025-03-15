"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader with CRT effects
const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float time;
  uniform float curvature;
  uniform float scanlineIntensity;
  uniform float scanlineCount;
  uniform float vignetteIntensity;
  uniform float noiseIntensity;
  uniform float flickerIntensity;
  uniform float rgbOffset;
  uniform float brightness;
  uniform float contrast;
  uniform vec3 tint;
  varying vec2 vUv;

  // Random noise function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Apply screen curvature
  vec2 curveRemapUV(vec2 uv) {
    uv = uv * 2.0 - 1.0;
    vec2 offset = abs(uv.yx) / vec2(curvature, curvature);
    uv = uv + uv * offset * offset;
    uv = uv * 0.5 + 0.5;
    return uv;
  }

  void main() {
    // Apply screen curvature
    vec2 remappedUv = curveRemapUV(vUv);
    vec3 color = vec3(0.0);
    
    // Check if UV is outside the curved screen
    if (remappedUv.x < 0.0 || remappedUv.x > 1.0 || remappedUv.y < 0.0 || remappedUv.y > 1.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    
    // RGB color separation (chromatic aberration)
    float r = texture2D(tDiffuse, remappedUv + vec2(rgbOffset, 0.0)).r;
    float g = texture2D(tDiffuse, remappedUv).g;
    float b = texture2D(tDiffuse, remappedUv - vec2(rgbOffset, 0.0)).b;
    color = vec3(r, g, b);
    
    // Apply scanlines
    float scanline = sin(remappedUv.y * scanlineCount * 3.14159 * 2.0) * 0.5 + 0.5;
    scanline = pow(scanline, 1.0) * scanlineIntensity;
    color *= 1.0 - scanline;
    
    // Apply noise
    float noise = random(vUv + vec2(time * 0.01, 0.0)) * noiseIntensity;
    color += noise;
    
    // Apply flicker
    float flicker = random(vec2(time * 0.1, 0.0)) * flickerIntensity;
    color *= 1.0 - flicker;
    
    // Apply vignette
    float vignette = length(vUv - 0.5) * vignetteIntensity;
    color *= 1.0 - vignette;
    
    // Apply brightness and contrast
    color = (color - 0.5) * contrast + 0.5;
    color *= brightness;
    
    // Apply color tint
    float luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
    color = mix(color, vec3(luminance) * tint, 0.85);
    
    // Add enhanced phosphor glow
    float glow = max(max(r, g), b) * 0.8;
    color += vec3(glow * tint.r * 0.3, glow * tint.g * 0.6, glow * tint.b * 0.8);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// CRT Screen component
function CRTScreen({ imageUrl }: { imageUrl: string }) {
  const { size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load the image texture
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
          rgbOffset: { value: 0.002 },
          brightness: { value: 1.1 },
          contrast: { value: 1.1 },
        }}
      />
    </mesh>
  );
}

// Main component
export default function CRTImageDemo() {
  const [settings, setSettings] = useState({
    curvature: 2.0,
    scanlineIntensity: 0.25,
    noiseIntensity: 0.05,
    flickerIntensity: 0.03,
    tint: [0.1, 0.5, 0.9], // Blue tint for the technical display
  });

  // Create a retro computer interface instead of using a placeholder image
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 512;
    canvas.height = 512;

    // Draw retro computer interface
    const drawInterface = () => {
      // Black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw blue border/frame
      ctx.strokeStyle = "#0077ff";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Draw header text
      ctx.fillStyle = "#00aaff";
      ctx.font = "bold 18px monospace";
      ctx.fillText("ORBIT INSERTION", 20, 35);

      // Draw right side data panel
      ctx.fillStyle = "#0055ff";
      ctx.fillRect(canvas.width - 130, 10, 120, canvas.height - 20);

      // Data panel text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      ctx.fillText("POSITION", canvas.width - 120, 35);
      ctx.fillText("X: 127.87", canvas.width - 120, 60);
      ctx.fillText("Y: 045.23", canvas.width - 120, 80);
      ctx.fillText("Z: 356.01", canvas.width - 120, 100);

      ctx.fillText("TIME TO", canvas.width - 120, 130);
      ctx.fillText("INSERTION", canvas.width - 120, 150);
      ctx.fillText("05:24:17", canvas.width - 120, 170);

      ctx.fillText("ALTITUDE", canvas.width - 120, 200);
      ctx.fillText("245.8 KM", canvas.width - 120, 220);

      ctx.fillText("MASS", canvas.width - 120, 250);
      ctx.fillText("12350 KG", canvas.width - 120, 270);

      ctx.fillText("VELOCITY", canvas.width - 120, 300);
      ctx.fillText("5.43 KM/S", canvas.width - 120, 320);

      // Draw crosshairs
      ctx.strokeStyle = "#00aaff";
      ctx.lineWidth = 1;

      // Top-left crosshair
      ctx.beginPath();
      ctx.moveTo(20, 60);
      ctx.lineTo(50, 60);
      ctx.moveTo(35, 45);
      ctx.lineTo(35, 75);
      ctx.stroke();

      // Bottom-left crosshair
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 60);
      ctx.lineTo(50, canvas.height - 60);
      ctx.moveTo(35, canvas.height - 45);
      ctx.lineTo(35, canvas.height - 75);
      ctx.stroke();

      // Draw orbital sphere
      const centerX = canvas.width / 2 - 30;
      const centerY = canvas.height / 2;
      const radius = 120;

      // Draw grid lines for globe
      ctx.strokeStyle = "#00aa77";
      ctx.lineWidth = 0.5;

      // Horizontal grid lines
      for (let i = -4; i <= 4; i += 1) {
        const y = centerY + (radius * i) / 4;
        if (y > centerY - radius && y < centerY + radius) {
          const width =
            Math.sqrt(radius * radius - Math.pow(y - centerY, 2)) * 2;
          ctx.beginPath();
          ctx.moveTo(centerX - width / 2, y);
          ctx.lineTo(centerX + width / 2, y);
          ctx.stroke();
        }
      }

      // Vertical grid lines
      for (let i = -4; i <= 4; i += 1) {
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY,
          radius,
          (radius * Math.abs(i)) / 4,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Draw orbit path
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(
        centerX - 10,
        centerY,
        radius * 0.9,
        radius * 0.5,
        Math.PI * 0.2,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // Draw planet/target
      ctx.fillStyle = "#ff3300";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Draw spacecraft position
      const now = Date.now();
      const orbitPos = (now / 3000) % (Math.PI * 2);
      const shipX =
        centerX - 10 + Math.cos(orbitPos + Math.PI * 0.2) * radius * 0.9;
      const shipY = centerY + Math.sin(orbitPos + Math.PI * 0.2) * radius * 0.5;

      ctx.fillStyle = "#00ffff";
      ctx.beginPath();
      ctx.arc(shipX, shipY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw selection box around spacecraft
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(shipX - 15, shipY - 15, 30, 30);
      ctx.stroke();

      // Draw target box
      ctx.strokeStyle = "#00ff77";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.rect(centerX - 70, centerY - 70, 140, 140);
      ctx.rect(centerX - 75, centerY - 75, 150, 150);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw status text
      ctx.fillStyle = "#00ff77";
      ctx.font = "14px monospace";
      ctx.fillText("ORBITAL PARAMETERS:", 20, canvas.height - 90);
      ctx.fillText("SEMI-MAJOR: 12450 KM", 20, canvas.height - 70);
      ctx.fillText("INCLINATION: 29.8°", 20, canvas.height - 50);
      ctx.fillText("ECCENTRICITY: 0.083", 20, canvas.height - 30);
    };

    // Initial draw
    drawInterface();

    // Update animation
    const interval = setInterval(drawInterface, 50); // Update more frequently for smoother animation

    return () => clearInterval(interval);
  }, []);

  // Create a texture from the canvas
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasTexture = new THREE.CanvasTexture(canvasRef.current);
    canvasTexture.needsUpdate = true;
    setTexture(canvasTexture);

    // Update texture periodically
    const interval = setInterval(() => {
      canvasTexture.needsUpdate = true;
    }, 500);

    return () => clearInterval(interval);
  }, [canvasRef]);

  return (
    <div className="w-full h-screen bg-black">
      {/* Hidden canvas for drawing the interface */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <Canvas camera={{ position: [0, 0, 1] }}>
        {texture && <CRTEffect texture={texture} settings={settings} />}
      </Canvas>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-4 rounded-lg text-white">
        <h2 className="text-lg font-bold mb-2">CRT Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Curvature</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={settings.curvature}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  curvature: Number.parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Scanline Intensity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.scanlineIntensity}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  scanlineIntensity: Number.parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Noise</label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={settings.noiseIntensity}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  noiseIntensity: Number.parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm">Flicker</label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={settings.flickerIntensity}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  flickerIntensity: Number.parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// New component that handles the CRT effect
function CRTEffect({
  texture,
  settings,
}: {
  texture: THREE.Texture;
  settings: {
    curvature: number;
    scanlineIntensity: number;
    noiseIntensity: number;
    flickerIntensity: number;
    tint: number[];
  };
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Log when settings change
  useEffect(() => {
    if (materialRef.current) {
      console.log("Settings changed:", settings);
    }
  }, [settings]);

  // Update time and other uniforms in each frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();

      // Update all settings in each frame
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

      // Force update
      materialRef.current.needsUpdate = true;
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
          curvature: { value: settings.curvature },
          scanlineIntensity: { value: settings.scanlineIntensity },
          scanlineCount: { value: 800 },
          vignetteIntensity: { value: 1.3 },
          noiseIntensity: { value: settings.noiseIntensity },
          flickerIntensity: { value: settings.flickerIntensity },
          rgbOffset: { value: 0.002 },
          brightness: { value: 1.3 },
          contrast: { value: 1.5 },
          tint: {
            value: new THREE.Vector3(
              settings.tint[0],
              settings.tint[1],
              settings.tint[2]
            ),
          },
        }}
      />
    </mesh>
  );
}
