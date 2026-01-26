import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { saveUser } from "../utils/auth";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await API.post("/auth/register", formData);
            saveUser(data.user, data.token);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="glass w-full max-w-md p-8 rounded-2xl shadow-2xl">
                <h2 className="text-3xl font-bold text-center mb-8 gradient-text">Create Account</h2>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-muted">Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-muted">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-muted">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-surface border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-text"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/30"
                    >
                        {loading ? "Creating account..." : "Register Now"}
                    </button>
                </form>
                <p className="text-center mt-6 text-text-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
