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
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
