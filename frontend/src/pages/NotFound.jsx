import { Link } from "react-router-dom";
import Button from "../components/Button";
import { Home, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 p-6 rounded-full text-primary mb-6"
            >
                <AlertTriangle size={64} />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">Page Not Found</h1>
            <p className="text-xl text-text-muted mb-8 max-w-md">
                Oops! The page you are looking for seems to have wandered off into the void.
            </p>
            <Link to="/">
                <Button className="py-3 px-8 text-lg gap-2">
                    <Home size={20} />
                    Back to Home
                </Button>
            </Link>
        </div>
    );
};

export default NotFound;
