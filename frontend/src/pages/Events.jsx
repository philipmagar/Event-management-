import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = getUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await API.get("/events");
            setEvents(data);
        } catch (error) {
            console.error("Fetch events error:", error);
            setError("Failed to fetch events.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (eventId) => {
        if (!user) {
            alert("Please login to book an event!");
            return;
        }
        try {
            await API.post("/bookings", { eventId });
            alert("Booking successful!");
            fetchEvents(); // Refresh to update capacity/status
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="px-6 pb-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-4">Discover <span className="gradient-text">Upcoming Events</span></h1>
                <p className="text-text-muted max-w-2xl">Find and book the best events happening around you. From workshops to concerts, we've got you covered.</p>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8">
                    {error}
                </div>
            )}

            {events.length === 0 ? (
                <div className="glass p-12 rounded-3xl text-center">
                    <p className="text-text-muted text-lg">No events found. Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.isArray(events) && events.map((event) => (
                        <div key={event._id} className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl">
                            <div className="h-48 bg-slate-200 relative overflow-hidden text-center">
                                {event.image ? (
                                    <img src={event.image} alt={event.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <span className="text-4xl">📅</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4 text-center">
                                    <h3 className="text-xl font-bold flex-1">{event.name}</h3>
                                </div>

                                <p className="text-text-muted text-sm mb-6 line-clamp-2">{event.description}</p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-text-muted">
                                        <span className="text-primary font-bold">📍</span>
                                        {event.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-text-muted">
                                        <span className="text-primary font-bold">⏰</span>
                                        {new Date(event.date).toLocaleDateString()} at {event.time}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-text-muted">Spots Left</span>
                                            <span className="font-bold text-primary">{event.capacity - (event.bookingsCount || 0)}</span>
                                        </div>
                                        <Link
                                            to={`/events/${event._id}`}
                                            className="text-primary hover:underline text-sm font-bold"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg text-center">
                                            NRS {event.price}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleBook(event._id)}
                                                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-primary/20"
                                            >
                                                Book Now
                                            </button>
                                            {(user && (user.role === "admin" || user.id === event.createdBy?._id || user.id === event.createdBy)) && (
                                                <button
                                                    onClick={() => navigate(`/edit-event/${event._id}`)}
                                                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-2xl transition-all"
                                                    title="Edit Event"
                                                >
                                                    ✏️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Events;
