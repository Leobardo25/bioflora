import { createContext, useContext, useState, useEffect } from 'react';
import { subscribeSiteConfig } from '../services/siteConfigService';
import { BRAND } from '../constants';

const DEFAULTS = {
    whatsapp: '506',
    instagram: '',
    facebook: '',
    tiktok: '',
    brandName: 'Caribbean Botanical Garden',
    brandTagline: 'Vivero Boutique & Especies Exóticas',
    storeCurrency: 'CRC',
    heroTitle: 'Exóticas Colecciones Botánicas',
    heroSubtitle: '',
    collectionTitle: 'Especies Selectas',
    collectionText: 'Explore las orquídeas y plantas exóticas más exclusivas de nuestra colección, cultivadas con paciencia y rigor técnico.',
    missionTitle: 'Misión',
    missionText: 'Caribbean Botanical Garden, es una empresa agro-turística innovadora la cual contribuye con la conservación del medio ambiente mediante la bio-alfabetización de nuestros visitantes y utilizando agro-tecnologías sostenibles.',
    visionTitle: 'Visión',
    visionText: 'Caribbean Botanical Garden, será un empresa agro-turística líder en Costa Rica que promoverá mediante la bio-alfabetización y la recreación sana, contribuir a la conservación del medio ambiente, mitigar el cambio climático, preservar y reproducir especies de plantas tropicales en riesgo de extinción, especialmente orquídeas. Creando actividades productivas que fomenten un trabajo justo y solidarias el cual contribuya al crecimiento personal de nuestros colaboradores y el retorno del capital a sus accionistas.'
};

const SiteConfigContext = createContext(DEFAULTS);

export function SiteConfigProvider({ children }) {
    const [config, setConfig] = useState(DEFAULTS);

    useEffect(() => {
        let globalData = {};
        let landingData = {};

        const updateState = () => {
            setConfig({ ...DEFAULTS, ...globalData, ...landingData });
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
