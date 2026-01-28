import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = getUser();

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const { data } = await API.get(`/events/${id}`);
            setEvent(data);
        } catch (error) {
            console.error("Fetch event details error:", error);
            setError("Event not found or failed to load.");
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!user) {
            alert("Please login to book an event!");
            navigate("/login");
            return;
        }
        try {
            await API.post("/bookings", { eventId: id });
            alert("Booking successful!");
            fetchEventDetails(); // Refresh to update spots
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error || !event) return (
        <div className="px-6 py-12 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">{error || "Event not found"}</h2>
            <button onClick={() => navigate("/")} className="text-primary hover:underline">Back to Events</button>
        </div>
    );

    return (
        <div className="px-6 py-12 max-w-4xl mx-auto">
            <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-64 md:h-96 bg-slate-200 relative">
                    {event.image ? (
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-8xl text-slate-400">📅</div>
                    )}
                    {event.pendingUpdates && (
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl animate-pulse">
                            Update Pending Approval
                        </div>
                    )}
                </div>

                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
                            <div className="flex flex-wrap gap-4 text-text-muted">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary">📍</span> {event.location}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-primary">⏰</span> {new Date(event.date).toLocaleDateString()} at {event.time}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-primary">👤</span> Hosted by {event.createdBy?.name || "Unknown"}
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-col items-center">
                            <div className="bg-surface/50 backdrop-blur-md border border-primary/20 text-primary px-6 py-2 rounded-full text-lg font-black shadow-xl mb-4">
                                NRS {event.price}
                            </div>
                            <button
                                onClick={handleBook}
                                disabled={event.capacity - (event.bookingsCount || 0) <= 0}
                                className="text-primary hover:text-primary-dark font-bold transition-colors disabled:opacity-50"
                            >
                                {event.capacity - (event.bookingsCount || 0) <= 0 ? "Event Full" : "Book Now"}
                            </button>

                            {(user && (user.role === "admin" || user.id === event.createdBy?._id)) && (
                                <button
                                    onClick={() => navigate(`/edit-event/${event._id}`)}
                                    className="mt-4 text-text-muted hover:text-text font-bold transition-colors"
                                >
                                    Edit Event
                                </button>
                            )}
                            <p className="text-center text-sm text-text-muted mt-2">{event.capacity - (event.bookingsCount || 0)} spots remaining</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-300 pt-8 mt-8">
                        <h2 className="text-2xl font-bold mb-4">About this event</h2>
                        <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                            {event.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
