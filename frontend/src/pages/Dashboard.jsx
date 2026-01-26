import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("bookings");
    const [bookings, setBookings] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = getUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [bookingsRes, eventsRes] = await Promise.all([
                API.get("/bookings/my-bookings"),
                API.get("/events/my-events")
            ]);
            setBookings(bookingsRes.data);
            setMyEvents(eventsRes.data);
        } catch (error) {
            console.error("Dashboard data error:", error);
            setError("Failed to fetch dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await API.delete(`/bookings/${bookingId}`);
            alert("Booking cancelled successfully!");
            fetchDashboardData(); // Refresh both
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel booking.");
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
                <h1 className="text-4xl font-bold mb-4">User <span className="gradient-text">Dashboard</span></h1>
                <p className="text-text-muted max-w-2xl">Manage your event bookings and the events you've created.</p>
            </header>

            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("bookings")}
                    className={`pb-4 px-2 font-bold transition-all ${activeTab === "bookings" ? "border-b-2 border-primary text-primary" : "text-text-muted hover:text-text"}`}
                >
                    My Bookings ({bookings.length})
                </button>
                <button
                    onClick={() => setActiveTab("events")}
                    className={`pb-4 px-2 font-bold transition-all ${activeTab === "events" ? "border-b-2 border-primary text-primary" : "text-text-muted hover:text-text"}`}
                >
                    My Events ({myEvents.length})
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8">
                    {error}
                </div>
            )}

            {activeTab === "bookings" ? (
                bookings.length === 0 ? (
                    <div className="glass p-12 rounded-3xl text-center">
                        <p className="text-text-muted text-lg mb-4">You haven't booked any events yet.</p>
                        <Link to="/" className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20">
                            Browse Events
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {bookings.map((booking) => {
                            const event = booking.event;
                            if (!event) return null;
                            return (
                                <div key={booking._id} className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl">
                                    <div className="h-48 bg-slate-200 relative overflow-hidden text-center">
                                        {event.image ? <img src={event.image} alt={event.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>}
                                        <div className="absolute top-4 right-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">NRS {event.price}</div>
                                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg capitalize">{booking.status}</div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-4">{event.name}</h3>
                                        <div className="space-y-2 mb-6 text-sm text-text-muted">
                                            <p>📍 {event.location}</p>
                                            <p>⏰ {new Date(event.date).toLocaleDateString()} at {event.time}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Link to={`/events/${event._id}`} className="flex-1 text-center bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3 rounded-xl transition-all">Details</Link>
                                            <button onClick={() => handleCancelBooking(booking._id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                myEvents.length === 0 ? (
                    <div className="glass p-12 rounded-3xl text-center">
                        <p className="text-text-muted text-lg mb-4">You haven't created any events yet.</p>
                        <Link to="/add-event" className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20">
                            Create Event
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myEvents.map((event) => (
                            <div key={event._id} className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl">
                                <div className="h-48 bg-slate-200 relative overflow-hidden text-center">
                                    {event.image ? <img src={event.image} alt={event.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>}
                                    <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg capitalize ${event.status === 'approved' ? 'bg-green-500' : event.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                        {event.status} {event.pendingUpdates ? '(Update Pending)' : ''}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-4">{event.name}</h3>
                                    <div className="space-y-2 mb-6 text-sm text-text-muted">
                                        <p>📍 {event.location}</p>
                                        <p>⏰ {new Date(event.date).toLocaleDateString()} at {event.time}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Link to={`/events/${event._id}`} className="flex-1 text-center bg-primary/10 hover:bg-primary/20 text-primary font-bold py-3 rounded-xl transition-all">View</Link>
                                        <button onClick={() => navigate(`/edit-event/${event._id}`)} className="flex-1 bg-slate-800 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg">Edit Event</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default Dashboard;

