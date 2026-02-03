import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";
import Button from "../components/Button";
import Card from "../components/Card";
import {
    Calendar,
    Clock,
    MapPin,
    Image as ImageIcon,
    Users,
    Type,
    AlignLeft,
    DollarSign,
    X,
    UploadCloud,
    Save,
    Tag,
    Layers,
    ListChecks
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { useToast } from "../context/ToastContext";

const categories = [
    "General", "Workshop", "Conference", "Meetup", "Festival", "Concert", "Sports", "Other"
];

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
        category: "General",
        agenda: "",
        tags: "",
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const user = getUser();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (isEditMode) {
            fetchEventData();
        }
    }, [id]);

    const fetchEventData = async () => {
        try {
            const { data } = await API.get(`/events/${id}`);
            const displayData = data.pendingUpdates ? { ...data, ...data.pendingUpdates } : data;
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
                category: displayData.category || "General",
                agenda: displayData.agenda || "",
                tags: Array.isArray(displayData.tags) ? displayData.tags.join(", ") : "",
            });
        } catch (err) {
            console.error(err);
            navigate("/dashboard");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const submissionData = {
            ...formData,
            tags: formData.tags.split(",").map(t => t.trim()).filter(t => t !== "")
        };

        try {
            if (isEditMode) {
                const { data } = await API.put(`/events/${id}`, submissionData);
                showToast(user.role !== "admin" ? data.message : "Event updated successfully!", "success");
            } else {
                await API.post("/events", submissionData);
                showToast("Event submitted! Waiting for admin approval.", "info");
            }
            navigate(user.role === "admin" ? "/admin" : "/dashboard");
        } catch (err) {
            showToast(err.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast("Image size must be less than 2MB for faster loading.", "error");
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
        <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted font-medium">Fetching event details...</p>
        </div>
    );

    const inputClasses = "w-full bg-surface-hover border border-border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted/50";

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        {isEditMode ? "Edit" : "Host a New"} <span className="gradient-text">Event</span>
                    </h1>
                    <p className="text-text-muted mt-2">
                        {isEditMode
                            ? "Fine-tune your event details. Some changes may require admin review."
                            : "Share your vision with the community and get people excited!"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                                <AlignLeft size={16} /> Core Information
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1">Event Title</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            placeholder="Add a catchy name..."
                                            className={cn(inputClasses, "pl-12")}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                        <Layers size={16} className="text-primary" /> Category
                                    </label>
                                    <select
                                        className={cn(inputClasses, "appearance-none")}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Summary / Description</label>
                                <textarea
                                    placeholder="What makes this event special?"
                                    className={cn(inputClasses, "h-24 resize-none")}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                    <ListChecks size={16} className="text-primary" /> Detailed Agenda
                                </label>
                                <textarea
                                    placeholder="Outline the schedule (optional)..."
                                    className={cn(inputClasses, "h-40 resize-none")}
                                    value={formData.agenda}
                                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                    <Tag size={16} className="text-primary" /> Tags
                                </label>
                                <input placeholder="tech, networking, workshop (separated by commas)" className={inputClasses} value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/50">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                    <Calendar size={16} className="text-primary" /> Date
                                </label>
                                <input
                                    type="date"
                                    className={inputClasses}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                    <Clock size={16} className="text-primary" /> Time
                                </label>
                                <input
                                    type="time"
                                    className={inputClasses}
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                <MapPin size={16} className="text-primary" /> Location
                            </label>
                            <input
                                placeholder="Where is it happening?"
                                className={inputClasses}
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                    <Users size={16} className="text-primary" /> Max Capacity
                                </label>
                                <input
                                    type="number"
                                    placeholder="Available spots"
                                    className={inputClasses}
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1 flex items-center gap-2">
                                    <DollarSign size={16} className="text-primary" /> Price (NRS)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0 for free"
                                    className={inputClasses}
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-border/50">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                                <ImageIcon size={16} /> Media
                            </div>

                            {!formData.image ? (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:bg-surface-hover hover:border-primary/50 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-3 bg-primary/10 rounded-xl text-primary mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud size={32} />
                                        </div>
                                        <p className="text-sm font-medium">Click to upload cover image</p>
                                        <p className="text-xs text-text-muted mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden border border-border group">
                                    <img src={formData.image} alt="Preview" className="w-full h-64 object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                            className="gap-2"
                                        >
                                            <X size={16} /> Remove Image
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-[2] gap-2"
                            isLoading={loading}
                        >
                            <Save size={20} />
                            {isEditMode ? "Save Changes" : "Create Event"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddEvent;
