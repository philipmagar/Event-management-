import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";

const AddEvent = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        date: "",
        time: "",
        location: "",
        capacity: "",
        price: "",
        image: "",
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const user = getUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (isEditMode) {
            fetchEventData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Only re-run if the event ID changes

    const fetchEventData = async () => {
        try {
            const { data } = await API.get(`/events/${id}`);

            // Prioritize pending updates if they exist, so the user sees their last changes
            const displayData = data.pendingUpdates ? { ...data, ...data.pendingUpdates } : data;

            // Format date for input type="date" (YYYY-MM-DD)
            const formattedDate = displayData.date ? new Date(displayData.date).toISOString().split('T')[0] : "";

            setFormData({
                name: displayData.name || "",
                description: displayData.description || "",
                date: formattedDate,
                time: displayData.time || "",
                location: displayData.location || "",
                capacity: displayData.capacity || "",
                price: displayData.price || 0,
                image: displayData.image || "",
            });
        } catch (err) {
            console.error(err);
            alert("Failed to load event data.");
            navigate("/dashboard");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                const { data } = await API.put(`/events/${id}`, formData);
                if (user.role !== "admin" && data.message) {
                    alert(data.message);
                } else {
                    alert("Event updated successfully!");
                }
            } else {
                await API.post("/events", formData);
                alert("Event submitted successfully! It will be visible after admin approval.");
            }
            navigate(user.role === "admin" ? "/admin" : "/dashboard");
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'submit'} event.`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("Image size must be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
        }
    };

    if (initialLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="px-6 py-12 max-w-2xl mx-auto">
            <div className="glass p-8 rounded-3xl">
                <h1 className="text-3xl font-bold mb-2">
                    {isEditMode ? "Edit" : "Create New"} <span className="gradient-text">Event</span>
                </h1>
                <p className="text-text-muted mb-8">
                    {isEditMode
                        ? "Update the details of your event. Changes may require admin approval."
                        : "Fill in the details below to submit your event for approval."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted ml-1">Event Name</label>
                        <input
                            placeholder="e.g. Tech Conference 2026"
                            className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none text-text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted ml-1">Description</label>
                        <textarea
                            placeholder="Describe what your event is about..."
                            className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:border-primary transition-colors h-32 outline-none resize-none text-text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted ml-1">Date</label>
                            <input
                                type="date"
                                className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none text-text"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted ml-1">Time</label>
                            <input
                                type="time"
                                className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none text-text"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted ml-1">Location</label>
                        <input
                            placeholder="e.g. City Hall, New York"
                            className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none text-text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted ml-1">Capacity</label>
                            <input
                                type="number"
                                placeholder="Number of attendees"
                                className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none text-text"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text-muted ml-1">Price (Nrs)</label>
                            <input
                                type="number"
                                placeholder="0 for free"
                                className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:border-primary transition-colors outline-none text-text"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted ml-1">Event Image</label>
                        <div className="flex flex-col gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-2 focus:border-primary transition-colors outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {formData.image && (
                                <div className="mt-2 relative w-full h-40 rounded-xl overflow-hidden border border-slate-300">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: "" })}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-primary hover:text-primary-dark font-bold py-4 transition-colors mt-4 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : (isEditMode ? "Save Changes" : "Submit Event")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEvent;
