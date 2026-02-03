import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import { useToast } from "../context/ToastContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children, role }) => {
    const user = getUser();
    const { showToast } = useToast();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // We can't use hooks inside the return block effectively with effects, 
        // but for a simple redirect this component logic works.
        // Ideally we'd show a toast here too, but that requires useEffect.
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
