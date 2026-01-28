import { Link, useNavigate } from "react-router-dom";
import { getUser, clearUser } from "../utils/auth";

const Navbar = ({ theme, onToggleTheme }) => {
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        clearUser();
        navigate("/login");
    };

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center mb-8">
            <div className="flex gap-6 items-center">
                <Link to="/" className="hover:text-primary transition-colors">Events</Link>
                {user && (
                    <>
                        {user.role !== "admin" && (
                            <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        )}
                        <Link to="/add-event" className="hover:text-primary transition-colors">Add Event</Link>
                        {user.role === "admin" && (
                            <Link to="/admin" className="hover:text-primary transition-colors">Admin Panel</Link>
                        )}
                    </>
                )}
            </div>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={onToggleTheme}
                    className={[
                        "p-2 rounded-lg border transition-colors shadow-sm",
                        theme === "dark"
                            ? "border-slate-600/70 bg-slate-800 hover:bg-slate-700 text-slate-100"
                            : "border-slate-300/60 bg-slate-100 hover:bg-slate-200 text-slate-800",
                    ].join(" ")}
                    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                    {theme === "dark" ? (
                        // Sun icon (switch to light)
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2" />
                            <path d="M12 20v2" />
                            <path d="M4.93 4.93l1.41 1.41" />
                            <path d="M17.66 17.66l1.41 1.41" />
                            <path d="M2 12h2" />
                            <path d="M20 12h2" />
                            <path d="M4.93 19.07l1.41-1.41" />
                            <path d="M17.66 6.34l1.41-1.41" />
                        </svg>
                    ) : (
                        // Moon icon (switch to dark)
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
                        </svg>
                    )}
                </button>
                {user ? (
                    <button
                        onClick={handleLogout}
                        className="text-secondary hover:text-secondary/80 font-bold transition-colors"
                    >
                        Logout
                    </button>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
                        <Link to="/register" className="hover:text-primary transition-colors">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
