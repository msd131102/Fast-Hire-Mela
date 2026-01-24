import React, { useState, useEffect } from 'react';

// Import all images from the logo directory
// keys will be relative paths, values will be the image URL string
const logoFiles = import.meta.glob('../../logo/logo_*.png', { eager: true, import: 'default' });

// Sort keys to ensure correct order (logo_000.png, logo_001.png, etc.)
const frameKeys = Object.keys(logoFiles).sort((a, b) => {
    const numA = parseInt(a.match(/logo_(\d+)/)?.[1] || "0");
    const numB = parseInt(b.match(/logo_(\d+)/)?.[1] || "0");
    return numA - numB;
});
const frames = frameKeys.map(key => logoFiles[key]);

const AntiGravityLogo = ({ variant = 'full', className = "" }) => {
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        // 30 FPS playback for the image sequence
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % frames.length);
        }, 33);

        return () => clearInterval(interval);
    }, []);

    if (frames.length === 0) {
        if (variant === 'compact') return null;
        return <div className="text-white">No logo frames found</div>;
    }

    // COMPACT VARIANT (For Header/Navigation)
    if (variant === 'compact') {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                <div className="animate-float-compact">
                    <img
                        src={frames[currentFrame]}
                        alt="Fast Hire Mela"
                        className="w-full h-full object-contain filter brightness-110 contrast-105 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                    />
                </div>

                <style>{`
            @keyframes float-compact {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); } 
            }
            .animate-float-compact {
                animation: float-compact 4s ease-in-out infinite;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `}</style>
            </div>
        );
    }

    // FULL PREVIEW VARIANT (Cinematic Splash Screen)
    return (
        <div className={`flex items-center justify-center min-h-screen bg-[#050510] overflow-hidden relative font-sans ${className}`}>
            {/* Dark gradient background with cinematic lighting */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f2c] via-[#050510] to-black opacity-90"></div>

            {/* Top light source */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-blue-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>

            {/* Floating container */}
            <div className="relative z-10 animate-float">
                {/* Subtle glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/20 blur-[60px] rounded-full animate-pulse-slow pointer-events-none"></div>

                <img
                    src={frames[currentFrame]}
                    alt="Anti Gravity Logo"
                    className="w-full max-w-[500px] h-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] filter brightness-110 contrast-105"
                    style={{
                        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                    }}
                />

                {/* Shadow on the "floor" */}
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[200px] h-[20px] bg-black/40 blur-xl rounded-[100%] animate-shadow-scale"></div>
            </div>

            {/* Text overlay */}
            <div className="absolute bottom-12 text-center z-10">
                <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white/60 font-light text-3xl tracking-[0.2em] uppercase drop-shadow-lg">
                    Fast Hire Mela
                </h1>
                <p className="text-blue-200/50 text-xs tracking-[0.5em] mt-2 uppercase">Future of Hiring</p>
            </div>

            <style>{`
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-40px) rotate(1deg); } 
            }
            .animate-float {
                animation: float 8s ease-in-out infinite;
            }
             @keyframes pulse-slow {
                0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.1); }
            }
            .animate-pulse-slow {
                animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes shadow-scale {
                0%, 100% { opacity: 0.4; transform: translate(-50%, 0) scale(1); }
                50% { opacity: 0.2; transform: translate(-50%, 0) scale(0.8); }
            }
            .animate-shadow-scale {
                animation: shadow-scale 8s ease-in-out infinite;
            }
        `}</style>
        </div>
    );
};

export default AntiGravityLogo;
