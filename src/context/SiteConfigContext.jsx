import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeSiteConfig } from '../services/siteConfigService';
import { BRAND } from '../constants';

const DEFAULTS = {
    whatsapp: '506',
    instagram: '',
    facebook: '',
    tiktok: '',
    brandName: 'Bioflora Garden Center',
    brandTagline: 'Innovación Agrobiotecnológica & Soluciones Verdes',
    storeCurrency: 'CRC',
    heroTitle: 'Innovación * Agrobiotecnológica & * Soluciones Verdes',
    heroSubtitle: 'Cultivamos con Ciencia',
    collectionTitle: 'Producción Sostenible',
    collectionText: 'Nuestra operation productiva se desarrolla en La Perla de Guácimo, Limón, donde producimos orquídeas, vainilla y plantas ornamentales tropicales bajo un enfoque de innovación y bioeconomía.',
    missionTitle: 'Misión',
    missionText: 'Bioflora Centro de Jardinería es el brazo comercial de Flores y Follajes del Caribe S.A. Nuestra misión está orientada a la producción, comercialización y asesoría especializada en orquídeas, integrando investigación, innovación agrobiotecnológica y sostenibilidad.',
    visionTitle: 'Visión',
    visionText: 'Consolidarse como una plataforma agroempresarial líder e innovadora en Costa Rica, reconocida por integrar investigación, producción ornamental sostenible, agronegocios y servicios especializados de jardinería, promoviendo el desarrollo territorial rural.'
};

const SiteConfigContext = createContext(DEFAULTS);

export function SiteConfigProvider({ children }) {
    const [config, setConfig] = useState(() => {
        try {
            const cached = localStorage.getItem('site_config_cache');
            return cached ? JSON.parse(cached) : DEFAULTS;
        } catch (e) {
            return DEFAULTS;
        }
    });

    useEffect(() => {
        let globalData = {};
        let landingData = {};

        const updateState = () => {
            const cleanGlobal = Object.fromEntries(Object.entries(globalData).filter(([_, v]) => v !== ''));
            const cleanLanding = Object.fromEntries(Object.entries(landingData).filter(([_, v]) => v !== ''));
            const newConfig = { ...DEFAULTS, ...cleanGlobal, ...cleanLanding };
            setConfig(newConfig);
            try {
                localStorage.setItem('site_config_cache', JSON.stringify(newConfig));
            } catch (e) {
                // Evitar fallos de quota
            }
        };

        const unsubGlobal = subscribeSiteConfig('global', (data) => {
            if (data) globalData = data;
            updateState();
        });

        const unsubLanding = subscribeSiteConfig('landing', (data) => {
            if (data) landingData = data;
            updateState();
        });

        return () => {
            unsubGlobal();
            unsubLanding();
        };
    }, []);

    return (
        <SiteConfigContext.Provider value={config}>
            {children}
        </SiteConfigContext.Provider>
    );
}

export const useSiteConfig = () => useContext(SiteConfigContext);
