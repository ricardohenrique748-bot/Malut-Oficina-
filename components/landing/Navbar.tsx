'use client';

import { motion } from 'framer-motion';
import { LogIn, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    onAboutClick?: () => void;
}

export default function Navbar({ onAboutClick }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [clickCount, setClickCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= 3) {
            router.push('/auth/login');
            setClickCount(0);
        }

        // Reset click count after 2 seconds of inactivity
        const timer = setTimeout(() => setClickCount(0), 2000);
        return () => clearTimeout(timer);
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-black/70 backdrop-blur-lg shadow-md py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <button onClick={handleLogoClick} className="flex items-center gap-2 group outline-none">
                    <img
                        src={isScrolled ? "/logo.png" : "/logo-white.png"}
                        alt="Malut"
                        className="w-10 h-10 group-active:scale-95 transition-transform"
                    />
                    <span className={`font-bold text-xl tracking-tight transition-colors ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                        GRUPO MALUT<span className="text-indigo-500">.</span>
                    </span>
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#serviços"
                        className={`text-sm font-medium transition-colors hover:text-indigo-500 ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-200'
                            }`}
                    >
                        Serviços
                    </a>
                    <button
                        onClick={onAboutClick}
                        className={`text-sm font-medium transition-colors hover:text-indigo-500 ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-200'
                            }`}
                    >
                        Sobre
                    </button>
                    <a
                        href="#contato"
                        className={`text-sm font-medium transition-colors hover:text-indigo-500 ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-gray-200'
                            }`}
                    >
                        Contato
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={28} className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} /> : <Menu size={28} className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 w-full bg-white dark:bg-neutral-900 shadow-xl border-t border-gray-100 dark:border-neutral-800 p-6 flex flex-col gap-4 md:hidden"
                >
                    <a href="#serviços" className="text-lg font-medium text-gray-700 dark:text-gray-200" onClick={() => setMobileMenuOpen(false)}>
                        Serviços
                    </a>
                    <button onClick={() => { onAboutClick?.(); setMobileMenuOpen(false); }} className="text-lg font-medium text-gray-700 dark:text-gray-200 text-left">
                        Sobre
                    </button>
                    <a href="#contato" className="text-lg font-medium text-gray-700 dark:text-gray-200" onClick={() => setMobileMenuOpen(false)}>
                        Contato
                    </a>
                </motion.div>
            )}
        </nav>
    );
}
