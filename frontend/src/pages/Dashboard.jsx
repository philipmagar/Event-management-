import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";
import Button from "../components/Button";
import Card from "../components/Card";
import {
    Calendar,
    Ticket,
    PlusCircle,
    Clock,
    MapPin,
    Trash2,
    ChevronRight,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { useToast } from "../context/ToastContext";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("bookings");
    const [bookings, setBookings] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = getUser();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const fetchDashboardData = useCallback(async () => {
        try {
            const [bookingsRes, eventsRes] = await Promise.all([
                API.get("/bookings/my-bookings"),
                API.get("/events/my-events")
            ]);
            setBookings(bookingsRes.data);
            setMyEvents(eventsRes.data);
        } catch (error) {
            console.error("Dashboard data error:", error);
            setError("Failed to fetch your dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        fetchDashboardData();
    }, [navigate, fetchDashboardData]);

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this registration?")) return;
        try {
            await API.delete(`/bookings/${bookingId}`);
            showToast("Registration cancelled.", "info");
            fetchDashboardData();
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to cancel booking.", "error");
        }
    };

    const stats = [
        { label: "Booked Events", value: bookings.length, icon: Ticket, color: "text-primary", bg: "bg-primary/10" },
        { label: "Events Created", value: myEvents.length, icon: Calendar, color: "text-accent", bg: "bg-accent/10" },
        { label: "Completion Rate", value: "100%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    ];

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted font-medium">Preparing your dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            {}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Welcome back, <span className="gradient-text">{user.name || "User"}</span>!
                    </h1>
                    <p className="text-text-muted mt-1">Here's an overview of your activity and upcoming events.</p>
                </div>
                <Button onClick={() => navigate("/add-event")} className="gap-2">
                    <PlusCircle size={20} />
                    Create New Event
                </Button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} delay={i * 0.1} className="flex items-center gap-6 p-6">
                        <div className={cn("p-4 rounded-2xl", stat.bg)}>
                            <stat.icon className={stat.color} size={28} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>
            <div className="space-y-6">
                <div className="flex gap-2 p-1 glass w-fit rounded-xl">
                    {[
                        { id: "bookings", label: "My Registrations", count: bookings.length },
                        { id: "events", label: "My Created Events", count: myEvents.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "text-text-muted hover:text-text hover:bg-surface/50"
                            )}
                        >
                            {tab.label}
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px]",
                                activeTab === tab.id ? "bg-white/20 text-white" : "bg-border/50 text-text-muted"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl font-medium">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === "bookings" ? (
                            bookings.length === 0 ? (
                                <Card className="p-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto">
                                        <Ticket className="text-text-muted/30" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold">No active registrations</h3>
                                    <p className="text-text-muted">You haven't joined any events yet. Ready to explore?</p>
                                    <Link to="/">
                                        <Button variant="outline" className="mt-2">Browse Events</Button>
                                    </Link>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {bookings.map((booking) => (
                                        <Card key={booking._id} className="p-0 overflow-hidden flex flex-col">
                                            <div className="h-32 bg-slate-200 relative">
                                                {booking.event?.image ? (
                                                    <img src={booking.event.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                                                        <Calendar className="text-text-muted/20" size={32} />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                                                        booking.status === 'confirmed' ? 'status-approved' : 'status-pending'
                                                    )}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <h3 className="font-bold text-lg leading-tight mb-4">{booking.event?.name}</h3>
                                                <div className="space-y-2 mb-6 text-sm text-text-muted">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} /> {booking.event?.location}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} /> {new Date(booking.event?.date).toLocaleDateString()} at {booking.event?.time}
                                                    </div>
                                                    {booking.event?.date && (
                                                        <div className={cn(
                                                            "mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider",
                                                            Math.ceil((new Date(booking.event.date) - new Date()) / (1000 * 60 * 60 * 24)) <= 3
                                                                ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                                                : "bg-primary/10 text-primary border border-primary/20"
                                                        )}>
                                                            <Clock size={12} className="animate-pulse" />
                                                            {Math.ceil((new Date(booking.event.date) - new Date()) / (1000 * 60 * 60 * 24)) > 0
                                                                ? `${Math.ceil((new Date(booking.event.date) - new Date()) / (1000 * 60 * 60 * 24))} Days Remaining`
                                                                : Math.abs(Math.ceil((new Date(booking.event.date) - new Date()) / (1000 * 60 * 60 * 24))) === 0
                                                                    ? "Happening Today"
                                                                    : "Past Event"
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/50">
                                                    <Link
                                                        to={`/events/${booking.event?._id}`}
                                                        className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                                                    >
                                                        Details <ChevronRight size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleCancelBooking(booking._id)}
                                                        className="text-red-500 hover:text-red-600 p-2 glass-hover rounded-lg transition-colors"
                                                        title="Cancel Registration"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )
                        ) : (
                            myEvents.length === 0 ? (
                                <Card className="p-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mx-auto">
                                        <PlusCircle className="text-text-muted/30" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold">No events created</h3>
                                    <p className="text-text-muted">Start organizing your own events today!</p>
                                    <Button onClick={() => navigate("/add-event")} variant="outline" className="mt-2">Host an Event</Button>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myEvents.map((event) => (
                                        <Card key={event._id} className="p-0 overflow-hidden flex flex-col border-white/5 shadow-premium">
                                            <div className="h-32 bg-slate-200 relative">
                                                {event.image ? (
                                                    <img src={event.image} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-surface-hover">
                                                        <Calendar className="text-text-muted/20" size={32} />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                                                        event.status === 'approved' ? 'status-approved' :
                                                            event.status === 'pending' ? 'status-pending' : 'status-rejected'
                                                    )}>
                                                        {event.status}
                                                    </span>
                                                    {event.pendingUpdates && (
                                                        <span className="bg-accent text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-lg animate-pulse">
                                                            Pending Update
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <h3 className="font-bold text-lg leading-tight mb-4">{event.name}</h3>
                                                <div className="space-y-2 mb-6 text-sm text-text-muted">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} /> {event.location}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} /> {new Date(event.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-auto pt-4 border-t border-border/50">
                                                    <Button
                                                        onClick={() => navigate(`/events/${event._id}`)}
                                                        className="flex-1 text-sm py-2"
                                                        variant="outline"
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        onClick={() => navigate(`/edit-event/${event._id}`)}
                                                        className="flex-1 text-sm py-2"
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
export default Dashboard;
