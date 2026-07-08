import { Cloud, CloudSun, Sun, Sprout } from 'lucide-react';

// Fuente única de verdad para la Ficha de Cuidados (admin + tarjetas + drawer).

export const LIGHT_LEVELS = [
    { value: 'baja', label: 'Baja / Sombra', icon: Cloud },
    { value: 'media', label: 'Media / Sombra Ligera', icon: CloudSun },
    { value: 'alta', label: 'Alta / Luz Filtrada', icon: Sun },
];

export const WATERING_LEVELS = [
    { value: 1, label: 'Poco Riego', drops: 1 },
    { value: 2, label: 'Riego Moderado', drops: 2 },
    { value: 3, label: 'Riego Frecuente', drops: 3 },
];

export const SUBSTRATE_PRESETS = [
    { value: 'suelo-rico', label: 'Suelo Rico / Materia Orgánica' },
    { value: 'mezcla-porosa', label: 'Mezcla Porosa / Poca Tierra' },
    { value: 'musgo-turba', label: 'Mezcla de Musgo y Turba' },
    { value: 'aracea-orquidea', label: 'Mezcla de Orquídeas / Aráceas' },
    { value: 'ventilado', label: 'Sustrato Ventilado (sin retención)' },
];

export const SUBSTRATE_ICON = Sprout;

export const DIFFICULTY_LEVELS = [
    { value: 1, label: 'Cuido Fácil' },
    { value: 2, label: 'Cuido Medio' },
    { value: 3, label: 'Cuido Avanzado' },
];

export const getLightLevel = (value) => LIGHT_LEVELS.find(l => l.value === value);
export const getWateringLevel = (value) => WATERING_LEVELS.find(w => w.value === Number(value));
export const getSubstratePreset = (value) => SUBSTRATE_PRESETS.find(s => s.value === value);
export const getDifficultyLevel = (value) => DIFFICULTY_LEVELS.find(d => d.value === Number(value));
