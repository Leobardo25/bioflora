/** @type {import('tailwindcss').Config} */

/*
 * ========================================
 *  🎨 VALEX PERFUMERÍA — THEME
 *  Concepto: "Lujo Silencioso"
 * ========================================
 *  Paleta de colores:
 *  ─────────────────
 *  Negro Mate    #1A1A1B  (fondos, texto base)
 *  Bronce        #A68966  (acentos, logo, CTAs)
 *  Gris Piedra   #D1D1D1  (texto secundario, bordes)
 *  Blanco Hueso  #F5F5F5  (secciones de respiro)
 * ========================================
 */

const THEME = {
    negro: '#070F0A',        // Verde Bosque Nocturno ultra-oscuro
    bronce: '#00A94F',       // Verde Principal Jardín (Pantone 355C)
    grisPiedra: '#A3B899',   // Verde Salvia Elegante (Texto secundario)
    blancoHueso: '#F9F9F6',  // Arena / Blanco Hueso (Zonas de respiro)
    fucsiaOrquidea: '#D60C8C', // Rosa/Fucsia Orquídea (Acento premium)
    moradoOrquidea: '#662D91', // Morado Orquídea
    naranjaTucan: '#F8971D',  // Naranja Tucán (Acento dinámico)
    tarjetaBosque: '#0D1C13'  // Fondo de tarjetas
}

export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic tokens — Bioflora Vivero Boutique (aliases to preserve layout stability)
                'valex-negro': THEME.negro,
                'valex-bronce': THEME.bronce,
                'valex-gris': THEME.grisPiedra,
                'valex-hueso': THEME.blancoHueso,

                // Functional aliases mapped to the tropical palette
                'valex-bronce-dark': '#066E34',          // Verde Selva Oscuro (hover principal)
                'valex-bronce-light': THEME.fucsiaOrquidea, // Rosa Fucsia Orquídea (acento dinámico / hover alt)
                'valex-negro-alt': THEME.tarjetaBosque,   // Fondo de tarjetas

                // Native Bioflora colors for new features
                'bioflora-verde': THEME.bronce,
                'bioflora-fucsia': THEME.fucsiaOrquidea,
                'bioflora-morado': THEME.moradoOrquidea,
                'bioflora-naranja': THEME.naranjaTucan,
                'bioflora-bosque': THEME.negro,
                'bioflora-tarjeta': THEME.tarjetaBosque,
                'bioflora-arena': THEME.blancoHueso,
            },
            fontFamily: {
                serif: ['Playfair Display', 'Georgia', 'serif'],
                sans: ['Poppins', 'Outfit', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
            animation: {
                'slide-in-right': 'slide-in-right 0.25s ease-out',
            },
        },
    },
    plugins: [],
}
