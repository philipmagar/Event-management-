import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Twitter, MapPin, Phone, ArrowRight, Zap } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-auto border-t border-border/50 bg-surface/30 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 bg-primary rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
                                <Zap className="text-white fill-white" size={20} />
                            </div>
                            <span className="text-xl font-black font-display tracking-tight">EVENT<span className="gradient-text">FLOW</span></span>
                        </Link>
                        <p className="text-text-muted text-sm leading-relaxed">
                            Empowering communities to discover, create, and manage meaningful experiences through cutting-edge event intelligence.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Github, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="p-3 glass-hover rounded-2xl text-text-muted hover:text-primary transition-all border border-border/50">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Discover</h4>
                        <ul className="space-y-4">
                            {['Upcoming Events', 'Popular Genres', 'Global Meetups', 'Workshops'].map((link) => (
                                <li key={link}>
                                    <Link to="/" className="text-text-muted hover:text-primary text-sm font-bold transition-colors flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Support</h4>
                        <ul className="space-y-4 text-sm font-bold text-text-muted">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                <span>123 Intelligence Square, Tech District</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                <span>+1 (555) 000-TECH</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                <span>hello@eventflow.ai</span>
                            </li>
                        </ul>
                    </div>

                    {}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Intelligence Hub</h4>
                        <p className="text-text-muted text-sm leading-relaxed">
                            Stay ahead of the curve with our weekly curation of top-tier events.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                            />
                            <button className="px-4 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-text-muted text-xs font-bold">
                        © 2026 EventFlow AI. All rights reserved. Built for Pioneers.
                    </p>
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
