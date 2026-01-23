'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import Stats from '@/components/landing/Stats';
import About from '@/components/landing/About';
import AboutModal from '@/components/landing/AboutModal';
import Footer from '@/components/landing/Footer';

export default function Home() {
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

    return (
        <main className="min-h-screen bg-white dark:bg-black">
            <Navbar onAboutClick={() => setIsAboutModalOpen(true)} />
            <Hero />
            <Stats />
            <About onLearnMoreClick={() => setIsAboutModalOpen(true)} />
            <Services />
            <Footer onAboutClick={() => setIsAboutModalOpen(true)} />
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
        </main>
    );
}

