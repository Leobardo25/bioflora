/**
 * BIOFLORA — Caribbean Botanical Garden
 * Centralized data for the landing page.
 * Prepared for integration with the Admin Panel.
 */

export const NAV_LINKS = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#colecciones', label: 'Colecciones' },
    { href: '#nosotros', label: 'Sobre Nosotros' },
    { href: '#actividades', label: 'Actividades' },
    { href: '#faq', label: 'Preguntas' },
]

export const HERO_CONTENT = {
    title: 'El Esplendor del Trópico en su Hogar',
    cta: 'Explorar Catálogo',
    ctaHref: '#colecciones',
}

export const HERO_STATS = [
    { value: '100+', label: 'Especies' },
    { value: '15K+', label: 'Visitantes' },
    { value: '25+', label: 'Años' },
]

export const PRODUCTS = [
    {
        id: 'guaria-morada',
        name: 'Guaria Morada (Guarianthe skinneri)',
        category: 'Orquídeas',
        notes: 'Sombra parcial · Riego 2 veces/semana · Alta humedad',
        description: 'La flor nacional de Costa Rica. Una orquídea majestuosa con pétalos morados vibrantes que florece en ramilletes espectaculares.',
    },
    {
        id: 'monstera-variegata',
        name: 'Monstera Deliciosa Variegata',
        category: 'Exóticas',
        notes: 'Luz indirecta · Riego moderado · Sustrato drenante',
        description: 'Una joya botánica altamente codiciada. Sus hojas presentan patrones de variegación blanco puro únicos que evocan el lujo natural.',
    },
    {
        id: 'anturio-negro',
        name: 'Anturio Negro (Anthurium Black)',
        category: 'Flores Tropicales',
        notes: 'Sombra húmeda · Riego regular · Pet-friendly',
        description: 'Elegancia gótica natural. Sus espatas oscuras de aspecto encerado ofrecen un contraste minimalista y sofisticado de larga duración.',
    },
]

export const MOODBOARD_IMAGES = [
    { id: 'mood-orchids', alt: 'Colección de orquídeas exóticas cultivadas en Limón, Costa Rica' },
    { id: 'mood-garden', alt: 'Senderos naturales de nuestro jardín botánico' },
    { id: 'mood-care', alt: 'Propagación cuidadosa en invernaderos agro-tecnológicos' },
]

export const BRAND = {
    name: 'Caribbean Botanical Garden',
    tagline: 'Vivero Boutique & Especies Exóticas',
    description: 'Costa Rican Orchids and Tropical Flowers. Conservación ambiental y bio-alfabetización mediante tecnologías agrícolas sostenibles y turismo ecológico.',
    copyright: `© ${new Date().getFullYear()} Caribbean Botanical Garden. Todos los derechos reservados.`,
}
