"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import * as THREE from "three"

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

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
    
    // Add subtle phosphor glow
    float glow = max(max(r, g), b) * 0.3;
    color += vec3(glow * 0.3, glow * 0.2, glow * 0.4);
    
    gl_FragColor = vec4(color, 1.0);
  }
`

// CRT effect component
function CRTEffect({ children, ...props }) {
  const { scene, camera, size } = useThree()
  const [renderTarget] = useState(() => new THREE.WebGLRenderTarget(size.width, size.height))
  const screenRef = useRef()
  const shaderRef = useRef()

  // Default CRT effect parameters
  const {
    curvature = 2.0,
    scanlineIntensity = 0.2,
    scanlineCount = 800,
    vignetteIntensity = 1.3,
    noiseIntensity = 0.05,
    flickerIntensity = 0.03,
    rgbOffset = 0.002,
    brightness = 1.1,
    contrast = 1.1,
  } = props

  useFrame((state) => {
    // Render scene to target
    state.gl.setRenderTarget(renderTarget)
    state.gl.render(scene, camera)
    state.gl.setRenderTarget(null)

    // Update shader uniforms
    if (shaderRef.current) {
      shaderRef.current.uniforms.time.value = state.clock.getElapsedTime()
      shaderRef.current.uniforms.tDiffuse.value = renderTarget.texture
    }
  }, 1)

  return (
    <mesh ref={screenRef} scale={[1, 1, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          tDiffuse: { value: null },
          time: { value: 0 },
          curvature: { value: curvature },
          scanlineIntensity: { value: scanlineIntensity },
          scanlineCount: { value: scanlineCount },
          vignetteIntensity: { value: vignetteIntensity },
          noiseIntensity: { value: noiseIntensity },
          flickerIntensity: { value: flickerIntensity },
          rgbOffset: { value: rgbOffset },
          brightness: { value: brightness },
          contrast: { value: contrast },
        }}
      />
      {children}
    </mesh>
  )
}

// Demo content to display on the CRT
function DemoContent() {
  const meshRef = useRef()
  const textRef = useRef()
  const clockRef = useRef()
  const [time, setTime] = useState("00:00:00")

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTime(now.toTimeString().substring(0, 8))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    }
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1 + 0.5
    }
    if (clockRef.current) {
      clockRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05 - 0.7
    }
  })

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Rotating cube */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4285F4" />
      </mesh>

      {/* Orbiting spheres */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 1.5, Math.sin((i / 5) * Math.PI * 2) * 1.5, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={["#EA4335", "#FBBC05", "#34A853", "#4285F4", "#FF00FF"][i]} />
        </mesh>
      ))}

      {/* Title text */}
      <Text ref={textRef} position={[0, 0.5, 0]} fontSize={0.2} color="#FFFFFF" anchorX="center" anchorY="middle">
        CRT SHADER
      </Text>

      {/* Clock text */}
      <Text ref={clockRef} position={[0, -0.7, 0]} fontSize={0.15} color="#00FF00" anchorX="center" anchorY="middle">
        {time}
      </Text>
    </group>
  )
}

// Main component
export default function CRTShader() {
  const [settings, setSettings] = useState({
    curvature: 2.0,
    scanlineIntensity: 0.2,
    noiseIntensity: 0.05,
    flickerIntensity: 0.03,
  })

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <DemoContent />
        <CRTEffect {...settings} />
        <OrbitControls enablePan={false} />
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
              onChange={(e) => setSettings({ ...settings, curvature: Number.parseFloat(e.target.value) })}
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
              onChange={(e) => setSettings({ ...settings, scanlineIntensity: Number.parseFloat(e.target.value) })}
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
              onChange={(e) => setSettings({ ...settings, noiseIntensity: Number.parseFloat(e.target.value) })}
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
              onChange={(e) => setSettings({ ...settings, flickerIntensity: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

