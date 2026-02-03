import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";
import Button from "../components/Button";
import Card from "../components/Card";
import {
    MapPin,
    Calendar,
    Clock,
    ChevronLeft,
    Share2,
    Info,
    Users,
    AlertTriangle,
    CheckCircle,
    Tag as TagIcon,
    ListTodo,
    Sparkles,
    Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { useSocket } from "../hooks/useSocket";
import { cn } from "../utils/cn";
import { useToast } from "../context/ToastContext";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = getUser();
    const { showToast } = useToast();

    useSocket("bookingUpdated", ({ eventId }) => {
        if (eventId === id) fetchEventDetails();
    });

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const { data } = await API.get(`/events/${id}`);
            setEvent(data);
        } catch (error) {
            setError("The event you're looking for doesn't exist or could not be loaded.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            await API.post("/bookings", { eventId: id });
            showToast("event booked successfully", "success");
            fetchEventDetails();
        } catch (err) {
            showToast(err.response?.data?.message || "Registration failed.", "error");
        }
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted font-medium">Gathering event intelligence...</p>
        </div>
    );

    if (error || !event) return (
        <Card className="max-w-xl mx-auto p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={40} />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Event Not Found</h2>
                <p className="text-text-muted">{error}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
                <ChevronLeft size={18} /> Back to Discover
            </Button>
        </Card>
    );

    const remainingSpots = event.capacity - (event.bookingsCount || 0);
    const isFull = remainingSpots <= 0;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header / Nav */}
            <div className="flex justify-between items-center px-2">
                <Link to="/" className="group flex items-center gap-3 text-sm font-black text-text-muted hover:text-primary transition-all">
                    <div className="p-2.5 glass-hover rounded-2xl group-hover:-translate-x-1 transition-transform border border-border/50">
                        <ChevronLeft size={20} />
                    </div>
                    BACK TO EVENTS
                </Link>
                <div className="flex gap-4">
                    <button className="p-3 glass-hover rounded-2xl text-text-muted hover:text-primary transition-all border border-border/50">
                        <Share2 size={20} />
                    </button>
                    {(user && (user.role === "admin" || user.id === (event.createdBy?._id || event.createdBy))) && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/edit-event/${event._id}`)}
                            className="rounded-2xl border-primary text-primary"
                        >
                            Edit Intelligence
                        </Button>
                    )}
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Main Content (8 cols) */}
                <div className="lg:col-span-8 space-y-10">
                    <Card className="p-0 overflow-hidden border-white/5 rounded-[40px] shadow-2xl">
                        <div className="aspect-video relative group">
                            {event.image ? (
                                <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-surface-hover flex items-center justify-center text-text-muted/10">
                                    <Sparkles size={160} />
                                </div>
                            )}
                            <div className="absolute top-8 left-8 flex gap-3">
                                <span className="glass-hover px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest text-white border-white/20 backdrop-blur-3xl">
                                    {event.category || "General"}
                                </span>
                                {event.pendingUpdates && (
                                    <span className="bg-accent text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl animate-pulse">
                                        Pending Changes
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-10 md:p-14 space-y-12">
                            {/* Title & Stats */}
                            <div className="space-y-6">
                                <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                                    {event.name}
                                </h1>
                                <div className="flex flex-wrap gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary font-bold"><MapPin size={22} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Location</p>
                                            <p className="font-bold text-lg">{event.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-accent/10 rounded-2xl text-accent font-bold"><Calendar size={22} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Date</p>
                                            <p className="font-bold text-lg">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-secondary/10 rounded-2xl text-secondary font-bold"><Clock size={22} /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Start Time</p>
                                            <p className="font-bold text-lg">{event.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-surface-hover border border-border text-text-muted text-sm font-bold">
                                            <TagIcon size={14} className="text-primary/50" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* About Section */}
                            <div className="space-y-6 pt-10 border-t border-border/50">
                                <h3 className="text-2xl font-black flex items-center gap-3">
                                    <Info className="text-primary" size={24} />
                                    The Story
                                </h3>
                                <p className="text-text-muted leading-relaxed text-xl whitespace-pre-wrap font-medium">
                                    {event.description}
                                </p>
                            </div>

                            {/* Agenda Section */}
                            {event.agenda && (
                                <div className="space-y-6 pt-10 border-t border-border/50">
                                    <h3 className="text-2xl font-black flex items-center gap-3">
                                        <ListTodo className="text-primary" size={24} />
                                        The Agenda
                                    </h3>
                                    <div className="p-8 bg-surface-hover/50 rounded-[32px] border border-border/50">
                                        <p className="text-text-muted leading-relaxed text-lg whitespace-pre-wrap font-medium italic">
                                            {event.agenda}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="sticky top-28 p-10 space-y-10 border-primary/20 bg-primary/5 backdrop-blur-xl rounded-[40px] shadow-2xl">
                        <div className="space-y-2 text-center">
                            <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mb-2">Access Cost</p>
                            <div className="flex flex-col items-center">
                                <span className="text-5xl font-black text-primary">NRS {event.price || "Free"}</span>
                                {event.price > 0 && <span className="text-text-muted text-sm font-bold mt-1 opacity-60">PER PERSON</span>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 bg-white/50 dark:bg-black/20 rounded-3xl border border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Users size={20} /></div>
                                    <span className="font-bold">Capacity</span>
                                </div>
                                <span className="font-black text-text-muted uppercase text-xs">{event.capacity} total</span>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/50 dark:bg-black/20 rounded-3xl border border-white/20">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-2.5 rounded-xl",
                                        isFull ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                                    )}>
                                        {isFull ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                                    </div>
                                    <span className="font-bold">Status</span>
                                </div>
                                <span className={cn(
                                    "font-black text-xs tracking-wider uppercase",
                                    isFull ? "text-red-500" : "text-green-500"
                                )}>
                                    {isFull ? "SOLD OUT" : `${remainingSpots} LEFT`}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleBook}
                                disabled={isFull}
                                className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-primary/20"
                                variant={isFull ? "outline" : "primary"}
                            >
                                {isFull ? "Waitlist Full" : "Reserve Now"}
                            </Button>
                            <p className="text-center text-[10px] text-text-muted font-black uppercase tracking-widest opacity-50">
                                Secure booking • Instant confirmation
                            </p>
                        </div>

                        <div className="pt-8 border-t border-border/50 flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-inner border border-white/10">
                                {event.createdBy?.name?.charAt(0) || "H"}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em]">Organizer</p>
                                <p className="font-black text-lg">{event.createdBy?.name || "Verified Host"}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="text-primary" size={20} />
                            <h4 className="font-black text-sm uppercase tracking-widest">Guaranteed Access</h4>
                        </div>
                        <p className="text-xs opacity-70 leading-relaxed font-bold">
                            All events on our platform are verified for authenticity. Your booking data is encrypted and secure.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
