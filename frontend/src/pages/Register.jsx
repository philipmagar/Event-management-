import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { saveUser } from "../utils/auth";
import Button from "../components/Button";
import Card from "../components/Card";
import { Mail, Lock, User, ArrowRight, AlertCircle, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (!/\d/.test(formData.password)) {
            setError("Password must contain at least one number.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await API.post("/auth/register", formData);
            saveUser(data.user, data.token);
            showToast("Welcome to Eventify! Account created successfully.", "success");
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-surface-hover border border-border px-10 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-text-muted/50";

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-primary/10 rounded-2xl text-primary mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">Join <span className="gradient-text">Eventify</span></h2>
                    <p className="text-text-muted mt-2">Start your journey into the world of amazing events</p>
                </div>

                <Card className="p-8 shadow-premium border-white/5">
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className={inputClasses}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className={inputClasses}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className={inputClasses}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-text-muted ml-1 italic">Minimum 8 characters with at least one number.</p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-4 gap-2 text-lg mt-4"
                            isLoading={loading}
                        >
                            Create Account <ArrowRight size={20} />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border/50 text-center">
                        <p className="text-text-muted">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;
