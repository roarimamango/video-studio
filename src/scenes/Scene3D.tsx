import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * IMPORTANT: In Remotion, drive ALL animation from useCurrentFrame(),
 * never from @react-three/fiber's useFrame() or clocks — otherwise
 * renders won't be deterministic and frames will be out of sync.
 */
export const Scene3D: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12 } });
  const rotation = frame * 0.02;
  const cameraZ = interpolate(frame, [0, 300], [6, 4], { extrapolateRight: "clamp" });

  return (
    <ThreeCanvas linear width={width} height={height} camera={{ fov: 50, position: [0, 0, cameraZ] }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#ff4fa3" />

      <mesh rotation={[rotation, rotation * 1.3, 0]} scale={pop * 1.4}>
        <torusKnotGeometry args={[1, 0.32, 256, 32]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.25} />
      </mesh>

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + frame * 0.01;
        return (
          <mesh key={i} position={[Math.cos(angle) * 3, Math.sin(angle * 2) * 0.5, Math.sin(angle) * 3]} scale={0.15}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="white" emissive={color} emissiveIntensity={0.6} />
          </mesh>
        );
      })}
    </ThreeCanvas>
  );
};
