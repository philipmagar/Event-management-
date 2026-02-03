import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";
import Button from "../components/Button";
import Card from "../components/Card";
import {
    Search,
    MapPin,
    Calendar as CalendarIcon,
    Users,
    ArrowRight,
    Filter,
    X,
    ChevronDown,
    Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../hooks/useSocket";
import { cn } from "../utils/cn";
import { useToast } from "../context/ToastContext";

const categories = ["All", "General", "Workshop", "Conference", "Meetup", "Festival", "Concert", "Sports", "Other"];

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [priceRange, setPriceRange] = useState("All"); // All, Free, Paid
    const [showFilters, setShowFilters] = useState(false);
    const { showToast } = useToast();

    const user = getUser();
    const navigate = useNavigate();

    useSocket("bookingUpdated", () => fetchEvents());

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await API.get("/events");
            setEvents(data);
        } catch (error) {
            setError("Failed to load events. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (eventId) => {
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            await API.post("/bookings", { eventId });
            showToast("event booked successfully", "success");
            fetchEvents();
        } catch (err) {
            showToast(err.response?.data?.message || "Registration failed.", "error");
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;

        const matchesPrice =
            priceRange === "All" ||
            (priceRange === "Free" && (event.price === 0 || !event.price)) ||
            (priceRange === "Paid" && event.price > 0);

        return matchesSearch && matchesCategory && matchesPrice;
    });

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted animate-pulse font-medium">Discovering events...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20">
            <section className="text-center space-y-8 py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-30 -z-10" />
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 mb-4"
                    >
                        <Zap size={14} className="fill-primary" />
                        Explore What's Happening Now
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black tracking-tight leading-none"
                    >
                        Find Your Next <br /> <span className="gradient-text">Adventure</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-text-muted text-xl max-w-2xl mx-auto"
                    >
                        Discover the best workshops, festivals, and meetups.
                        Professional networkING or weekend fun — we have it all.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl mx-auto mt-12 bg-surface/40 backdrop-blur-2xl border border-white/10 p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-3"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={22} />
                        <input
                            type="text"
                            placeholder="Events, cities, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-4 py-4 bg-transparent border-none focus:ring-0 text-lg font-medium placeholder:text-text-muted/50"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "gap-2 px-6 rounded-2xl transition-all",
                                showFilters ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 border-white/10"
                            )}
                        >
                            <Filter size={18} />
                            Filters
                            <ChevronDown size={14} className={cn("transition-transform", showFilters && "rotate-180")} />
                        </Button>
                        <Button variant="primary" className="px-10 rounded-2xl shadow-lg shadow-primary/20">
                            Explore
                        </Button>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="max-w-4xl mx-auto mt-4 overflow-hidden"
                        >
                            <div className="p-8 glass rounded-3xl border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                                <div className="space-y-4">
                                    <label className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                                        <Layers size={14} className="text-primary" /> Category
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-sm font-bold transition-all border",
                                                    selectedCategory === cat
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                        : "bg-surface-hover border-border hover:border-primary/50 text-text-muted"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                                        <DollarSign size={14} className="text-primary" /> Price Type
                                    </label>
                                    <div className="flex gap-3">
                                        {["All", "Free", "Paid"].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setPriceRange(type)}
                                                className={cn(
                                                    "flex-1 py-2.5 rounded-2xl font-bold transition-all border",
                                                    priceRange === type
                                                        ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
                                                        : "bg-surface-hover border-border text-text-muted hover:border-secondary/50"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <div className="space-y-10">
                <div className="flex items-end justify-between px-4">
                    <div>
                        <h2 className="text-3xl font-black">All <span className="gradient-text">Events</span></h2>
                        <p className="text-text-muted font-medium mt-1">
                            {filteredEvents.length} amazing events found matching your criteria
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-3xl text-center font-bold">
                        {error}
                    </div>
                )}

                {filteredEvents.length === 0 ? (
                    <div className="glass p-24 rounded-[40px] text-center space-y-6 border-white/5">
                        <div className="w-24 h-24 bg-surface-hover rounded-full flex items-center justify-center mx-auto text-5xl">🔭</div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Nothing matches your search</h3>
                            <p className="text-text-muted max-w-md mx-auto">Try resetting filters or searching for something else like "Tech" or "Music".</p>
                        </div>
                        <Button variant="primary" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setPriceRange("All"); }}>
                            Reset All Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence mode="popLayout">
                            {filteredEvents.map((event, index) => (
                                <Card key={event._id} delay={index * 0.05} className="group p-0 flex flex-col h-full border-white/5 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500">
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        {event.image ? (
                                            <img
                                                src={event.image}
                                                alt={event.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-surface-hover flex items-center justify-center">
                                                <CalendarIcon className="text-text-muted/20" size={64} />
                                            </div>
                                        )}
                                        <div className="absolute top-5 left-5">
                                            <span className="bg-white/90 backdrop-blur-md text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter">
                                                {event.category || "General"}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-5 right-5">
                                            <div className="glass px-4 py-2 rounded-2xl text-sm font-black text-primary border-primary/20 backdrop-blur-2xl shadow-xl">
                                                NRS {event.price || "Free"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6 flex-1 flex flex-col">
                                        <div className="flex-1 space-y-3">
                                            <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {event.name}
                                            </h3>
                                            <p className="text-text-muted text-sm line-clamp-2 leading-relaxed font-medium">
                                                {event.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-5 border-y border-border/50">
                                            <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                                                <div className="p-2 bg-primary/5 rounded-xl text-primary"><MapPin size={14} /></div>
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                                                <div className="p-2 bg-accent/5 rounded-xl text-accent"><CalendarIcon size={14} /></div>
                                                <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <Button
                                                onClick={() => handleBook(event._id)}
                                                className="flex-1 rounded-2xl py-3.5"
                                                variant={event.capacity - (event.bookingsCount || 0) <= 0 ? "outline" : "primary"}
                                                disabled={event.capacity - (event.bookingsCount || 0) <= 0}
                                            >
                                                {event.capacity - (event.bookingsCount || 0) <= 0 ? "Sold Out" : "Secure Spot"}
                                                <ArrowRight size={18} />
                                            </Button>
                                            <Link
                                                to={`/events/${event._id}`}
                                                className="p-4 rounded-2xl glass-hover text-text-muted hover:text-primary transition-all border border-border/50"
                                            >
                                                <Search size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};
const Layers = ({ className, size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const DollarSign = ({ className, size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

export default Events;
