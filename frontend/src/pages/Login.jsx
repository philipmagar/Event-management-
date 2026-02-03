import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { saveUser } from "../utils/auth";
import Button from "../components/Button";
import Card from "../components/Card";
import { Mail, Lock, ArrowRight, AlertCircle, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../context/ToastContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await API.post("/auth/login", { email, password });
            saveUser(data.user, data.token);
            showToast(`Welcome back, ${data.user.name || "friend"}!`, "success");
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
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
                        <LogIn size={32} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight">Welcome <span className="gradient-text">Back</span></h2>
                    <p className="text-text-muted mt-2">Sign in to manage your events and bookings</p>
                </div>

                <Card className="p-8 shadow-premium border-white/5">
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className={inputClasses}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium">Password</label>
                                <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className={inputClasses}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-4 gap-2 text-lg"
                            isLoading={loading}
                        >
                            Sign In <ArrowRight size={20} />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-border/50 text-center">
                        <p className="text-text-muted">
                            New here?{" "}
                            <Link to="/register" className="text-primary font-bold hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
