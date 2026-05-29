import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingCart, User, Search, SlidersHorizontal, LayoutGrid, AlignJustify, Store } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { NAV_LINKS } from '../../constants'
import { VALEX_TRANSITION } from '../../constants/motion'

import Logo from '../ui/Logo'
import NavbarMobileMenu from './Navbar/NavbarMobileMenu'
import NavbarFilterOverlay from './Navbar/NavbarFilterOverlay'
import NavbarMobileToolbar from './Navbar/NavbarMobileToolbar'
import NavbarDesktopActions from './Navbar/NavbarDesktopActions'

export default function Navbar({ 
    menuOpen, 
    setMenuOpen, 
    shopSearchQuery = '', 
    setShopSearchQuery = () => {}, 
    onToggleMobileFilters = () => {}, 
    hasActiveFilters = false,
    isFilterMenuOpen = false,
    mobileFiltersNode = null,
    isCompactView = false,
    setIsCompactView = () => {}
}) {
    const [scrolled, setScrolled] = useState(false)
    const { currentUser, userData, logout } = useAuth()
    const { cartItems, setIsCartDrawerOpen } = useCart()
    const [isHoveringUser, setIsHoveringUser] = useState(false)
    const hoverTimeoutRef = useRef(null)
    const location = useLocation()
    const isShopPage = location.pathname === '/tienda'

    // Comprobar si estamos en la Landing (hash links funcionan localmente) de lo contrario redirigir a /#hash
    const isHomePage = location.pathname === '/'

    const showSolid = scrolled || !isHomePage

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = (menuOpen || isFilterMenuOpen) ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [menuOpen, isFilterMenuOpen])

    const getLinkHref = (hash) => {
        return isHomePage ? hash : `/${hash}`
    }

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    const handleNavClick = (e, link) => {
        if (link.href === '#inicio') {
            e.preventDefault()
            if (isHomePage) {
                scrollToTop()
            } else {
                window.location.href = '/'
            }
        }
        setMenuOpen(false)
    }

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        setIsHoveringUser(true)
    }

    const handleMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => setIsHoveringUser(false), 250)
    }

    return (
        <>
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={VALEX_TRANSITION}
            >
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        backgroundColor: showSolid ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0)',
                        backdropFilter: showSolid ? 'blur(12px)' : 'blur(0px)',
                        borderBottom: showSolid ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(0, 0, 0, 0)',
                    }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />

                <div className="relative max-w-[96%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`flex items-center justify-between h-20 relative transition-colors duration-300 ${showSolid ? 'text-gray-900' : 'text-valex-hueso'}`}>
                        {/* Mobile left: Hamburger Menu */}
                        <div className="lg:hidden flex items-center">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={`p-2 -ml-2 rounded-lg transition-colors z-50 ${
                                    showSolid ? 'text-gray-800 hover:text-bioflora-fucsia' : 'text-valex-gris hover:text-valex-hueso'
                                }`}
                                aria-label="Toggle menu"
                            >
                                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Mobile center: Logo | Desktop left: Logo */}
                        <div className="lg:hidden absolute left-1/2 -translate-x-1/2 mt-1">
                            <Link to="/" onClick={scrollToTop} className="group">
                                <Logo className="h-11" />
                            </Link>
                        </div>
                        <div className="hidden lg:block">
                            <Link to="/" className="group">
                                <Logo className="h-14" />
                            </Link>
                        </div>

                        <div className="hidden lg:flex items-center gap-1">
                            {NAV_LINKS.map((link, i) => (
                                <motion.a
                                    key={link.href}
                                    href={getLinkHref(link.href)}
                                    onClick={(e) => handleNavClick(e, link)}
                                    className={`relative font-sans font-medium text-sm tracking-wide px-4 py-2 rounded-lg transition-colors duration-300 ${
                                        showSolid 
                                            ? 'text-gray-700 hover:text-bioflora-fucsia hover:bg-gray-100/50' 
                                            : 'text-valex-hueso/80 hover:text-white hover:bg-white/5'
                                    }`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ ...VALEX_TRANSITION, delay: 0.1 + i * 0.05 }}
                                >
                                    {link.label}
                                </motion.a>
                            ))}
                                {/* Extracted Desktop Actions (Search, Cart, User) */}
                                <NavbarDesktopActions
                                    scrolled={showSolid}
                                    isShopPage={isShopPage}
                                    shopSearchQuery={shopSearchQuery}
                                    setShopSearchQuery={setShopSearchQuery}
                                    onToggleMobileFilters={onToggleMobileFilters}
                                    isFilterMenuOpen={isFilterMenuOpen}
                                    hasActiveFilters={hasActiveFilters}
                                    cartItems={cartItems}
                                    setIsCartDrawerOpen={setIsCartDrawerOpen}
                                    currentUser={currentUser}
                                    userData={userData}
                                    isHoveringUser={isHoveringUser}
                                    handleMouseEnter={handleMouseEnter}
                                    handleMouseLeave={handleMouseLeave}
                                    logout={logout}
                                />
                        </div>

                        {/* Mobile right: Shortcut Icons */}
                        <div className="lg:hidden flex items-center gap-2">
                            <button onClick={() => { setIsCartDrawerOpen(true); setMenuOpen(false); }} className="relative text-bioflora-naranja hover:text-bioflora-fucsia transition-colors p-2" aria-label="Carrito">
                                <ShoppingCart className="w-[20px] h-[20px]" />
                                <AnimatePresence>
                                    {cartItems.length > 0 && (
                                        <motion.span 
                                            key={cartItems.length}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                            className="absolute -top-0.5 -right-0.5 bg-bioflora-fucsia text-bioflora-arena text-[9px] w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold shadow-[0_0_8px_rgba(214,12,140,0.4)]"
                                        >
                                            {cartItems.length}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                            <Link to={currentUser ? (userData?.role === 'admin' ? '/admin' : '/') : '/login'} className="text-bioflora-naranja hover:text-bioflora-fucsia transition-colors p-2 -mr-1" aria-label="Cuenta">
                                <User className="w-[20px] h-[20px]" />
                            </Link>
                        </div>
                    </div>
                    {/* Extracted Mobile Toolbar */}
                    {location.pathname === '/tienda' && !menuOpen && (
                        <NavbarMobileToolbar
                            shopSearchQuery={shopSearchQuery}
                            setShopSearchQuery={setShopSearchQuery}
                            onToggleMobileFilters={onToggleMobileFilters}
                            isFilterMenuOpen={isFilterMenuOpen}
                            hasActiveFilters={hasActiveFilters}
                            isCompactView={isCompactView}
                            setIsCompactView={setIsCompactView}
                        />
                    )}

                    {/* Extracted Filter Overlay */}
                    {location.pathname === '/tienda' && (
                        <AnimatePresence>
                            <NavbarFilterOverlay
                                isFilterMenuOpen={isFilterMenuOpen}
                                onToggleMobileFilters={onToggleMobileFilters}
                                mobileFiltersNode={mobileFiltersNode}
                            />
                        </AnimatePresence>
                    )}
                </div>
            </motion.nav>

            {/* Extracted Mobile menu */}
            <AnimatePresence>
                <NavbarMobileMenu
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    scrollToTop={scrollToTop}
                    getLinkHref={getLinkHref}
                    handleNavClick={handleNavClick}
                />
            </AnimatePresence>
        </>
    )
}
