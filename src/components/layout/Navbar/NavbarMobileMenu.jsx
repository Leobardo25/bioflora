import { motion } from 'framer-motion';
import { X, Store } from 'lucide-react';
import { FaInstagram, FaFacebook, FaWhatsapp, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../../../constants';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import Logo from '../../ui/Logo';

function SocialIcons() {
    const { instagram, facebook, tiktok, whatsapp } = useSiteConfig();
    return (
        <>
            {instagram && (
                <a href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-bioflora-fucsia transition-colors duration-200">
                    <FaInstagram size={26} />
                </a>
            )}
            {facebook && (
                <a href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-bioflora-fucsia transition-colors duration-200">
                    <FaFacebook size={26} />
                </a>
            )}
            {tiktok && (
                <a href={tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${tiktok}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-bioflora-fucsia transition-colors duration-200">
                    <FaTiktok size={26} />
                </a>
            )}
            {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-bioflora-fucsia transition-colors duration-200">
                    <FaWhatsapp size={26} />
                </a>
            )}
        </>
    );
}

export default function NavbarMobileMenu({ menuOpen, setMenuOpen, scrollToTop, getLinkHref, handleNavClick }) {
    if (!menuOpen) return null;
    
    return (
        <motion.div
            className="lg:hidden fixed inset-0 z-[100] flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setMenuOpen(false)}
            />
            
            <motion.div
                className="relative w-[75vw] max-w-[320px] h-full bg-white shadow-2xl flex flex-col border-r border-gray-100"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="h-full flex flex-col px-5 overflow-y-auto pb-8">
                <div className="flex items-center justify-between pt-5 pb-8 border-b border-gray-100">
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="text-gray-500 hover:text-gray-950 p-2 rounded-lg transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <Link to="/" onClick={() => { setMenuOpen(false); scrollToTop(); }}>
                        <Logo className="h-10" />
                    </Link>
                </div>
 
                <nav className="flex flex-col gap-1 mt-6">
                    {NAV_LINKS.map((link, i) => (
                        <motion.a
                            key={link.href}
                            href={getLinkHref(link.href)}
                            onClick={(e) => handleNavClick(e, link)}
                            className="text-gray-700 hover:text-bioflora-fucsia font-sans font-light text-2xl tracking-[0.12em] py-4 border-b border-gray-50 transition-colors duration-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.28, delay: 0.1 + i * 0.07 }}
                        >
                            {link.label}
                        </motion.a>
                    ))}
                </nav>
 
                <motion.div
                    className="mt-14"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                >
                    <Link
                        to="/tienda"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-center gap-3 w-full bg-bioflora-morado text-white py-4 rounded-xl font-sans font-bold text-base tracking-[0.18em] uppercase shadow-lg shadow-bioflora-morado/30 hover:bg-bioflora-morado/80 transition-all duration-300"
                    >
                        <Store className="w-5 h-5" />
                        Tienda
                    </Link>
                </motion.div>
 
                <motion.div
                    className="mt-12 flex items-center justify-center gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.45 }}
                >
                    <SocialIcons />
                </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
