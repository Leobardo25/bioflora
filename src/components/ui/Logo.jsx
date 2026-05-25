import React from 'react';

export default function Logo({ className = "" }) {
    return (
        <div className={`relative inline-flex items-center group ${className}`}>
            {/* Resplandor cálido animado detrás del logo */}
            <div 
                className="absolute inset-0 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 35% 50%, rgba(0,167,208,0.35) 0%, rgba(139,25,138,0.15) 50%, transparent 75%)',
                    filter: 'blur(14px)',
                    animation: 'logoGlow 3s ease-in-out infinite',
                }}
            />
            <img 
                src="/Logo Bioflora CMYK.png" 
                alt="Bioflora Garden Center Logo" 
                className="relative w-auto h-full object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_8px_rgba(0,167,208,0.25)]" 
            />
            <style>{`
                @keyframes logoGlow {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.08); opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
