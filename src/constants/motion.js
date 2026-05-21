/**
 * Caribbean Botanical Garden — Motion Constants
 * Curvas y transiciones de "Lujo Silencioso".
 * Movimiento pesado y deliberado, como el crecimiento de una especie de colección.
 */

// Core transition — used across all components
export const VALEX_TRANSITION = {
    duration: 0.8,
    ease: [0.4, 0, 0.2, 1],
}

// Slower variant for hero/cinematic reveals
export const VALEX_SLOW = {
    duration: 1.0,
    ease: [0.4, 0, 0.2, 1],
}

// Fast variant for micro-interactions
export const VALEX_MICRO = {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
}

// Fade-in from below (reusable variant)
export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
}

// Fade-in only
export const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

// Staggered container
export const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
}

// Hero-specific slow reveal
export const heroReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
}
