const mongoose = require("mongoose");
const EventSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    price: { type: Number, default: 0 },
    image: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    pendingUpdates: {
        type: Object,
        default: null
    },
}, { timestamps: true });

module.exports = mongoose.models.Event || mongoose.model("Event", EventSchema);
