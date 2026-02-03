import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, clearUser } from "../utils/auth";
import { Sun, Moon, LogOut, Plus, LayoutDashboard, Calendar, Settings, Ticket, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";

const Navbar = ({ theme, onToggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const user = getUser();
    const handleLogout = () => {
        clearUser();
        navigate("/login");
        setIsMobileMenuOpen(false);
    };
    const navLinks = [
        { name: "Events", path: "/", icon: Calendar },
        ...(user ? [
            { name: "Booked Events", path: "/dashboard", icon: Ticket },
            { name: "Add Event", path: "/add-event", icon: Plus },
            { name: "Admin Panel", path: "/admin", icon: Settings, show: user.role === "admin" }
        ].filter(link => link.show !== false) : [])
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 px-4 py-3">
            <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg border-white/10 relative">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                            <Calendar size={20} />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Eventify
                        </span>
                    </Link>
                    {/* Desktop Nav */}
                    <div className="hidden md:flex gap-1 items-center">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link key={link.path} to={link.path} className={cn(
                                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    isActive ? "text-primary" : "text-text-muted hover:text-text hover:bg-surface/50"
                                )}>
                                    <Icon size={16} />
                                    {link.name}
                                    {isActive && (
                                        <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary/10 rounded-lg -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onToggleTheme} className="p-2.5 rounded-xl glass-hover text-text-muted hover:text-primary transition-all active:scale-95" title={theme === "dark" ? "Light Mode" : "Dark Mode"}>
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <div className="h-6 w-[1px] bg-border mx-1 hidden md:block" />

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm font-medium text-text-muted">
                                    Hi, <span className="text-text">{user.name || "User"}</span>
                                </span>
                                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-medium text-sm">
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors">Sign In</Link>
                                <Link to="/register" className="btn-primary px-5 py-2 text-sm">Get Started</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-xl hover:bg-surface/50 text-text-muted"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="absolute top-20 left-4 right-4 bg-surface border border-white/10 rounded-2xl shadow-xl p-4 md:hidden flex flex-col gap-2 z-40"
                    >
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={closeMobileMenu}
                                    className={cn(
                                        "px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                                        isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-surface-hover hover:text-text"
                                    )}
                                >
                                    <Icon size={18} />
                                    {link.name}
                                </Link>
                            );
                        })}
                        <div className="h-[1px] bg-border my-2" />
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 text-red-500 hover:bg-red-500/10"
                            >
                                <LogOut size={18} />
                                Logout ({user.name})
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link to="/login" onClick={closeMobileMenu} className="w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:bg-surface-hover transition-colors">Sign In</Link>
                                <Link to="/register" onClick={closeMobileMenu} className="w-full text-center btn-primary px-5 py-3 text-sm rounded-xl">Get Started</Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
