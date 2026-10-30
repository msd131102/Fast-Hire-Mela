import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Text, Icosahedron, Torus, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

// Soft "Spline-like" material
const SplineMaterial = ({ color, ...props }) => (
    <meshPhysicalMaterial
        color={color}
        roughness={0.2}
        metalness={0.1}
        transmission={0}
        clearcoat={1}
        clearcoatRoughness={0.2}
        {...props}
    />
);

// A data particle that orbits
const DataParticle = ({ position, color = "#60a5fa", speed = 1 }) => {
    const ref = useRef();
    const randomOffset = useMemo(() => Math.random() * 100, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * speed + randomOffset;
        if (ref.current) {
            // Simple orbital motion
            ref.current.position.y += Math.sin(t) * 0.002;
            ref.current.rotation.x = t * 0.5;
            ref.current.rotation.y = t * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={2} floatIntensity={1}>
            <mesh ref={ref} position={position}>
                <octahedronGeometry args={[0.3, 0]} />
                <SplineMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
        </Float>
    );
};

// "Job Chip" - a small card-like object
const JobChip = ({ position, rotation }) => {
    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={position} rotation={rotation}>
                <Box args={[1.2, 0.8, 0.1]}>
                    <SplineMaterial color="#e0e7ff" metalness={0.5} roughness={0.1} />
                </Box>
                {/* Simulated "Text" lines on the chip */}
                <Box args={[0.8, 0.1, 0.15]} position={[0, 0.2, 0]}>
                    <meshStandardMaterial color="#3b82f6" />
                </Box>
                <Box args={[0.6, 0.1, 0.15]} position={[-0.1, -0.1, 0]}>
                    <meshStandardMaterial color="#94a3b8" />
                </Box>
            </group>
        </Float>
    )
}

const AiCore = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.2;
            meshRef.current.rotation.z = t * 0.1;
            // Pulsating scale
            const scale = 1 + Math.sin(t * 2) * 0.05;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group position={[-3, 1, -2]}>
            <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
                <Icosahedron ref={meshRef} args={[1.2, 0]}>
                    <SplineMaterial color="#4f46e5" emissive="#312e81" emissiveIntensity={0.2} />
                </Icosahedron>
            </Float>
            {/* Orbiting Ring */}
            <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
                <Torus args={[1.8, 0.05, 16, 100]} rotation={[1.5, 0, 0]}>
                    <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} toneMapped={false} />
                </Torus>
            </Float>
        </group>
    );
};

const FloatingText = ({ text, position, rotation, color = "white", fontSize = 1 }) => {
    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <Text
                position={position}
                rotation={rotation}
                fontSize={fontSize}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                color={color}
                anchorX="center"
                anchorY="middle"
            >
                {text}
                <meshStandardMaterial color={color} />
            </Text>
        </Float>
    );
}

const OrbitalSystem = () => {
    return (
        <group>
            {/* The "AI Brain" / Core */}
            <AiCore />

            {/* Floating "Job Chips" */}
            <JobChip position={[3.5, 2, -2]} rotation={[0.2, -0.4, 0.1]} />
            <JobChip position={[4, -2, -3]} rotation={[-0.1, -0.6, -0.2]} />

            {/* Connectivity Nodes (Data Particles) */}
            <DataParticle position={[-1, 3, -1]} color="#22d3ee" />
            <DataParticle position={[0, -2, 1]} color="#818cf8" />
            <DataParticle position={[-5, -1, -3]} color="#c084fc" />
            <DataParticle position={[5, 1, -5]} color="#34d399" />

            {/* 3D Typography - "Icons" as requested */}
            <FloatingText text="AI" position={[-2.8, 1, -0.8]} fontSize={0.6} color="#e0e7ff" />
            <FloatingText text="JOBS" position={[3.5, 1.2, -1.8]} rotation={[0, -0.2, 0]} fontSize={0.8} color="#93c5fd" />
            <FloatingText text="{ }" position={[-4.5, 2.5, -3]} rotation={[0, 0.5, 0.2]} fontSize={0.8} color="#f472b6" /> {/* Code/Dev Icon */}

            {/* Abstract Background Element */}
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
                <Sphere args={[2, 32, 32]} position={[6, -4, -10]}>
                    <SplineMaterial color="#172554" roughness={0.8} />
                </Sphere>
            </Float>
        </group>
    );
};

const Hero3DScene = () => {
    return (
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
            <Canvas gl={{ antialias: true, alpha: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 9]} fov={45} />

                {/* Lighting Setup */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <spotLight position={[-5, 5, 0]} intensity={2} color="#6366f1" penumbra={1} distance={20} />
                <pointLight position={[5, -5, -5]} intensity={1} color="#0ea5e9" />

                <OrbitalSystem />

                {/* Environment Reflections */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};

export default Hero3DScene;
