import { useState } from "react";

const ActionModal = ({ action, onConfirm, onCancel, title, description }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!action) return null;

    const getActionColor = (type) => {
        switch (type) {
            case "approve":
            case "book": return "text-green-500 hover:text-green-600";
            case "reject":
            case "delete":
            case "cancel": return "text-red-500 hover:text-red-600";
            default: return "text-primary hover:text-primary-dark";
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            {/* 3D Card Container */}
            <div className="flip-btn-wrapper scale-150 md:scale-[2]">
                <div className={`flip-btn ${isFlipped ? "is-open" : ""}`}>
                    {/* Front: Initial Action Label */}
                    <button
                        onClick={() => setIsFlipped(true)}
                        className={`flip-btn-front glass !bg-surface font-bold capitalize ${getActionColor(action.type)}`}
                    >
                        {action.type === "book" ? "Book Now" : action.type}
                    </button>

                    {/* Back: Confirmation Form */}
                    <div className="flip-btn-back glass">
                        <p className="text-center px-4 leading-tight">
                            {title || `${action.type} event:`} <br />
                            <span className="text-primary truncate block max-w-[150px] mx-auto mt-1">
                                {description || `"${action.eventName}"`}
                            </span>
                        </p>
                        <div className="btn-group mt-2">
                            <button
                                onClick={onConfirm}
                                className="btn-yes"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={onCancel}
                                className="btn-no"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionModal;
