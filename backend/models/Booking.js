const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" }
}, { timestamps: true });

BookingSchema.index({ event: 1 });
BookingSchema.index({ user: 1 });
BookingSchema.index({ event: 1, user: 1 }, { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } }); // Prevent duplicate active bookings

module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
