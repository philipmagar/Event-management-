import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";
import Button from "../components/Button";
import Card from "../components/Card";
import Modal from "../components/Modal";
import { useToast } from "../context/ToastContext";
import {CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Trash2,
    Edit3,
    ExternalLink,
    Shield,
    FileText,
    TrendingUp,
    Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";

const Admin = () => {
    const [liveEvents, setLiveEvents] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionConfig, setActionConfig] = useState(null); // { type, event }
    const { showToast } = useToast();
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

    const handleAction = async () => {
        if (!actionConfig) return;
        const { type, event } = actionConfig;

        try {
            if (type === "approve") {
                await API.patch(`/events/${event._id}/approve`);
            } else if (type === "reject") {
                await API.patch(`/events/${event._id}/reject`);
            } else if (type === "delete") {
                await API.delete(`/events/${event._id}`);
            }
            setActionConfig(null);
            showToast(`Event ${type}d successfully!`, "success");
            fetchAdminData();
        } catch (error) {
            console.error(`${type} error:`, error);
            showToast(`Failed to ${type} event.`, "error");
        }
    };

    const stats = [
        { label: "Live Events", value: liveEvents.length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Pending Reviews", value: pendingEvents.length, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Total Revenue", value: "NRS 0", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    ];

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted font-medium">Loading admin intelligence...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Action Modal */}
            <Modal
                isOpen={!!actionConfig}
                onClose={() => setActionConfig(null)}
                title={actionConfig?.type === 'delete' ? 'Delete Event' : 'Review Event'}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setActionConfig(null)}>Cancel</Button>
                        <Button
                            variant={actionConfig?.type === 'reject' || actionConfig?.type === 'delete' ? 'danger' : 'primary'}
                            onClick={handleAction}
                        >
                            Confirm {actionConfig?.type}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-text-muted">
                        Are you sure you want to <strong>{actionConfig?.type}</strong> the event:
                    </p>
                    <div className="p-4 bg-surface/50 rounded-2xl border border-border/50">
                        <h4 className="font-bold text-lg">{actionConfig?.event?.name}</h4>
                        <p className="text-sm text-text-muted">{actionConfig?.event?.location}</p>
                    </div>
                    {actionConfig?.type === 'reject' && (
                        <p className="text-xs text-red-500">Note: This action will notify the organizer that their event was not approved.</p>
                    )}
                </div>
            </Modal>

            {/* Header */}
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="text-primary" size={24} />
                    <span className="text-sm font-black uppercase tracking-widest text-primary">System Admin</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Admin <span className="gradient-text">Console</span></h1>
                <p className="text-text-muted mt-2">Oversee all events, monitor updates, and manage platform integrity.</p>
            </header>

            {/* Stats Overview */}
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

            <div className="space-y-12">
                {/* Pending Approvals */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="text-yellow-500" size={20} />
                            <h2 className="text-2xl font-bold">Pending Reviews</h2>
                            <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">
                                {pendingEvents.length} ACTION REQUIRED
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {pendingEvents.length === 0 ? (
                            <Card className="p-12 text-center text-text-muted bg-surface/30">
                                <FileText className="mx-auto mb-4 opacity-20" size={48} />
                                <p>Queue is empty. All current events are reviewed.</p>
                            </Card>
                        ) : (
                            pendingEvents.map((event) => (
                                <Card key={event._id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-yellow-500/10">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="w-20 h-20 bg-slate-200 rounded-2xl overflow-hidden shrink-0">
                                            {event.image ? (
                                                <img src={event.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">📅</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{event.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={14} /> {event.createdBy?.name || "Anonymous"}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <AlertCircle size={14} /> Created {new Date(event.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <p className="text-primary font-medium text-sm mt-2">{event.location} • NRS {event.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/edit-event/${event._id}`)}
                                            className="gap-2"
                                        >
                                            <Edit3 size={16} /> Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="text-green-500 border-green-500/20 hover:bg-green-500"
                                            onClick={() => setActionConfig({ type: "approve", event })}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 bg-red-500/5 hover:bg-red-500"
                                            onClick={() => setActionConfig({ type: "reject", event })}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                {/* Live Events Table/List */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="text-green-500" size={20} />
                        <h2 className="text-2xl font-bold">Platform Events</h2>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                            {liveEvents.length} ACTIVE
                        </span>
                    </div>

                    <div className="glass overflow-hidden rounded-3xl border-white/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface/50 border-b border-border/50">
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-muted tracking-widest">Event</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-muted tracking-widest">Date & Time</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-muted tracking-widest">Organizer</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-muted tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-text-muted tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {liveEvents.map((event) => (
                                        <tr key={event._id} className="hover:bg-surface/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                                                        {event.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{event.name}</p>
                                                        <p className="text-xs text-text-muted">{event.location}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-muted">
                                                {new Date(event.date).toLocaleDateString()}<br />
                                                {event.time}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                {event.createdBy?.name || "System"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-[10px] font-black uppercase">
                                                    Approved
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/events/${event._id}`)}
                                                        className="p-2 glass-hover rounded-lg text-text-muted hover:text-primary transition-all"
                                                        title="View"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/edit-event/${event._id}`)}
                                                        className="p-2 glass-hover rounded-lg text-text-muted hover:text-accent transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setActionConfig({ type: "delete", event })}
                                                        className="p-2 glass-hover rounded-lg text-text-muted hover:text-red-500 transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {liveEvents.length === 0 && (
                                <div className="p-12 text-center text-text-muted">
                                    No live events found on the platform.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Admin;
