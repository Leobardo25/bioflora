import { Droplet, Leaf } from 'lucide-react';
import {
    getLightLevel,
    getWateringLevel,
    getSubstratePreset,
    getDifficultyLevel,
    SUBSTRATE_ICON,
} from '../../constants/careGuide';

// Fila de gotas/hojas rellenas según nivel (1 a 3), usada tanto en la ficha completa como compacta.
function LevelIcons({ Icon, level, max = 3, size = 12, activeColor = '#00A7D0', inactiveColor = '#D1D5DB' }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <Icon
                    key={i}
                    width={size}
                    height={size}
                    fill={i < level ? activeColor : 'none'}
                    stroke={i < level ? activeColor : inactiveColor}
                    strokeWidth={2}
                />
            ))}
        </div>
    );
}

/**
 * Ficha completa de cuidados: grid de 4 celdas (ícono + texto), para el ProductDrawer.
 */
export function CareGuideFull({ careGuide }) {
    if (!careGuide) return null;

    const light = getLightLevel(careGuide.light);
    const watering = getWateringLevel(careGuide.watering);
    const substrate = getSubstratePreset(careGuide.substrate);
    const difficulty = getDifficultyLevel(careGuide.difficulty);

    const cells = [];

    if (light) {
        const LightIcon = light.icon;
        cells.push({
            key: 'light',
            title: 'Luminosidad',
            icon: <LightIcon width={20} height={20} color="#00A7D0" />,
            label: careGuide.lightLabel || light.label,
        });
    }
    if (watering) {
        cells.push({
            key: 'watering',
            title: 'Riego',
            icon: <LevelIcons Icon={Droplet} level={watering.drops} size={14} />,
            label: careGuide.wateringLabel || watering.label,
        });
    }
    if (substrate) {
        const SubstrateIcon = SUBSTRATE_ICON;
        cells.push({
            key: 'substrate',
            title: 'Sustrato',
            icon: <SubstrateIcon width={20} height={20} color="#69358C" />,
            label: careGuide.substrateLabel || substrate.label,
        });
    }
    if (difficulty) {
        cells.push({
            key: 'difficulty',
            title: 'Dificultad',
            icon: <LevelIcons Icon={Leaf} level={difficulty.value} size={14} activeColor="#22C55E" />,
            label: difficulty.label,
        });
    }

    if (cells.length === 0) return null;

    return (
        <div className="grid grid-cols-2 gap-2.5 mb-4 flex-shrink-0">
            {cells.map(cell => (
                <div key={cell.key} className="flex flex-col gap-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-sans font-bold tracking-[0.15em] uppercase text-gray-400">{cell.title}</span>
                        {cell.icon}
                    </div>
                    <span className="text-[11px] font-sans font-medium text-gray-700 leading-snug">{cell.label}</span>
                </div>
            ))}
        </div>
    );
}

/**
 * Fila compacta de solo íconos (con tooltip nativo), para las tarjetas del catálogo.
 */
export function CareGuideCompact({ careGuide, size = 13 }) {
    if (!careGuide) return null;

    const light = getLightLevel(careGuide.light);
    const watering = getWateringLevel(careGuide.watering);
    const substrate = getSubstratePreset(careGuide.substrate);
    const difficulty = getDifficultyLevel(careGuide.difficulty);

    if (!light && !watering && !substrate && !difficulty) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {light && (
                <span title={`Luminosidad: ${careGuide.lightLabel || light.label}`} className="flex items-center">
                    <light.icon width={size} height={size} color="#00A7D0" />
                </span>
            )}
            {watering && (
                <span title={`Riego: ${careGuide.wateringLabel || watering.label}`} className="flex items-center">
                    <LevelIcons Icon={Droplet} level={watering.drops} size={size} />
                </span>
            )}
            {substrate && (
                <span title={`Sustrato: ${careGuide.substrateLabel || substrate.label}`} className="flex items-center">
                    <SUBSTRATE_ICON width={size} height={size} color="#69358C" />
                </span>
            )}
            {difficulty && (
                <span title={`Dificultad: ${difficulty.label}`} className="flex items-center">
                    <LevelIcons Icon={Leaf} level={difficulty.value} size={size} activeColor="#22C55E" />
                </span>
            )}
        </div>
    );
}
