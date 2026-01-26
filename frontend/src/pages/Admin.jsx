import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";

const Admin = () => {
    const [liveEvents, setLiveEvents] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = getUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/");
            return;
        }
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [liveRes, pendingRes] = await Promise.all([
                API.get("/events?status=approved"),
                API.get("/events?status=pending")
            ]);
            setLiveEvents(liveRes.data);
            setPendingEvents(pendingRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await API.patch(`/events/${id}/approve`);
            alert("Event approved!");
            fetchAdminData();
        } catch (error) {
            console.error("Approval error:", error);
            alert("Failed to approve event.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject/delete this event?")) return;
        try {
            await API.patch(`/events/${id}/reject`);
            alert("Event rejected.");
            fetchAdminData();
        } catch (error) {
            console.error("Rejection error:", error);
            alert("Failed to reject event.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this event?")) return;
        try {
            await API.delete(`/events/${id}`);
            alert("Event deleted.");
            fetchAdminData();
        } catch (error) {
            console.error("Deletion error:", error);
            alert("Failed to delete event.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="px-6 pb-12 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-12">Admin <span className="gradient-text">Dashboard</span></h1>

            <div className="space-y-12">
                {/* Pending Events Section */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold">Pending Approval</h2>
                        <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/20">
                            {pendingEvents.length}
                        </span>
                    </div>

                    <div className="glass p-8 rounded-3xl min-h-[100px]">
                        {pendingEvents.length === 0 ? (
                            <p className="text-text-muted text-center py-4">No pending events to review.</p>
                        ) : (
                            <div className="grid gap-4">
                                {pendingEvents.map((event) => (
                                    <div key={event._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl bg-surface border border-slate-300 group hover:border-yellow-500/50 transition-all gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-3xl">
                                                {event.image ? <img src={event.image} alt={event.name} className="w-full h-full object-cover rounded-xl" /> : "📅"}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{event.name}</h4>
                                                <p className="text-sm text-text-muted">By {event.createdBy?.name} • {new Date(event.date).toLocaleDateString()}</p>
                                                <p className="text-sm text-primary mt-1">{event.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button
                                                onClick={() => navigate(`/edit-event/${event._id}`)}
                                                className="flex-1 md:flex-none bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleApprove(event._id)}
                                                className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-green-500/20"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(event._id)}
                                                className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-red-500/20"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Pending Updates Section */}
                {liveEvents.some(e => e.pendingUpdates) && (
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold">Pending Updates</h2>
                            <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/20">
                                {liveEvents.filter(e => e.pendingUpdates).length}
                            </span>
                        </div>

                        <div className="glass p-8 rounded-3xl min-h-[100px]">
                            <div className="grid gap-6">
                                {liveEvents.filter(e => e.pendingUpdates).map((event) => (
                                    <div key={event._id} className="p-6 rounded-2xl bg-surface border border-slate-300 group hover:border-blue-500/50 transition-all">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg mb-2">{event.name} <span className="text-text-muted text-sm font-normal">(Current)</span></h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-100 p-4 rounded-xl">
                                                    <div><span className="font-bold">Proposed Changes:</span></div>
                                                    <div className="md:col-span-2 border-t border-slate-200 mt-2 pt-4 space-y-4">
                                                        {Object.entries(event.pendingUpdates).map(([key, value]) => {
                                                            let displayValue = value;
                                                            let currentValue = event[key];
                                                            let hasChanged = value !== currentValue;

                                                            if (key === 'date') {
                                                                const vDate = new Date(value).toDateString();
                                                                const cDate = new Date(currentValue).toDateString();
                                                                hasChanged = vDate !== cDate;
                                                                displayValue = new Date(value).toLocaleDateString();
                                                                currentValue = new Date(event[key]).toLocaleDateString();
                                                            }

                                                            if (hasChanged && value !== "" && value !== undefined) {
                                                                return (
                                                                    <div key={key} className="flex flex-col p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                                        <span className="capitalize text-text-muted font-bold text-xs mb-2">{key}</span>
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <div className="flex-1">
                                                                                <p className="text-[10px] text-text-muted uppercase font-bold mb-1">Current</p>
                                                                                {key === 'image' ? (
                                                                                    <div className="h-10 w-10 bg-slate-200 rounded-md overflow-hidden">
                                                                                        {currentValue && <img src={currentValue} className="w-full h-full object-cover" />}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-sm text-red-500 line-through truncate">{currentValue}</p>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-slate-400">→</span>
                                                                            <div className="flex-1 text-right">
                                                                                <p className="text-[10px] text-text-muted uppercase font-bold mb-1">New</p>
                                                                                {key === 'image' ? (
                                                                                    <div className="h-10 w-10 bg-blue-50 rounded-md overflow-hidden border border-blue-200 float-right">
                                                                                        <img src={value} className="w-full h-full object-cover" />
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-sm text-green-600 font-bold truncate">{displayValue}</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col gap-3 justify-center">
                                                <button
                                                    onClick={() => navigate(`/edit-event/${event._id}`)}
                                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-6 py-2 rounded-xl transition-all shadow-md"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(event._id)}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(event._id)}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Live Events Section */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold">Live Events</h2>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold border border-primary/20">
                            {liveEvents.length}
                        </span>
                    </div>

                    <div className="glass p-8 rounded-3xl min-h-[100px]">
                        {liveEvents.length === 0 ? (
                            <p className="text-text-muted text-center py-4">No live events at the moment.</p>
                        ) : (
                            <div className="grid gap-4">
                                {liveEvents.map((event) => (
                                    <div key={event._id} className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-slate-300 group hover:border-primary/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-primary">
                                                {event.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold">{event.name}</h4>
                                                <p className="text-sm text-text-muted">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/edit-event/${event._id}`)}
                                                className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                                title="Edit Event"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event._id)}
                                                className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                                title="Delete Event"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Admin;
