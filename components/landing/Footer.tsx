'use client';

import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

interface FooterProps {
    onAboutClick?: () => void;
}

export default function Footer({ onAboutClick }: FooterProps) {
    return (
        <footer className="bg-gray-900 text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <img src="/logo.png" alt="Malut" className="w-10 h-10" />
                        <span className="font-bold text-xl">GRUPO MALUT</span>
                    </div>
                    <p className="text-gray-400 leading-relaxed">
                        Soluções completas em peças, pneus e manutenção automotiva.
                        <strong className="text-white block mt-2">&quot;Atenção que vira solução&quot;</strong>
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">Navegação</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li><a href="#" className="hover:text-indigo-400 transition-colors">Início</a></li>
                        <li><a href="#serviços" className="hover:text-indigo-400 transition-colors">Serviços</a></li>
                        <li><button onClick={onAboutClick} className="hover:text-indigo-400 transition-colors text-left">Sobre Nós</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">Contato</h4>
                    <ul className="space-y-4 text-gray-400">
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-indigo-400" />
                            (11) 99999-9999
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-indigo-400" />
                            contato@malut.com.br
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-indigo-400 mt-1" />
                            BR-010, 910<br />Açailândia - MA, 65930-000
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">Redes Sociais</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
                            <Instagram size={24} />
                        </a>
                        <a href="#" className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-all">
                            <Facebook size={24} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-gray-800 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Malut Oficina. Todos os direitos reservados.
            </div>
        </footer>
    );
}
