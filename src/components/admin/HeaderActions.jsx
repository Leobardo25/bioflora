import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function HeaderActions({ children }) {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        const el = document.getElementById('global-header-actions');
        if (el) {
            setContainer(el);
        }
    }, []);

    if (!container) return null;
    
    return createPortal(children, container);
}
