const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const { sendBookingConfirmation } = require("../utils/emailService");

const connectDB = require("../config/db");

exports.createBooking = async (req, res) => {
    try {
        await connectDB();
        const { eventId } = req.body;

        if (!eventId) {
            return res.status(400).json({ message: "Event ID is required" });
        }

        // Check if event exists and is approved
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if user already booked this event
        const existingBooking = await Booking.findOne({ 
            event: eventId, 
            user: req.user.id,
            status: { $ne: "cancelled" }
        });
        
        if (existingBooking) {
            return res.status(400).json({ message: "You have already booked this event" });
        }

        // Check capacity
        const bookingsCount = await Booking.countDocuments({ 
            event: eventId, 
            status: { $ne: "cancelled" } 
        });
        
        if (bookingsCount >= event.capacity) {
            return res.status(400).json({ message: "This event is fully booked" });
        }

        const booking = new Booking({
            event: eventId,
            user: req.user.id,
            status: "confirmed"
        });

        await booking.save();

        // Send confirmation email
        try {
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                await sendBookingConfirmation(user, event);
            }
        } catch (emailError) {
            console.error("Failed to send booking email:", emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({ 
            message: "Booking confirmed successfully!", 
            booking 
        });
    } catch (error) {
        console.error("createBooking Error:", error);
        res.status(500).json({ message: "Error creating booking", error: error.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        await connectDB();
        const bookings = await Booking.find({ user: req.user.id })
            .populate("event")
            .sort({ createdAt: -1 });

        // Filter out bookings where event was deleted
        const validBookings = bookings.filter(booking => booking.event !== null);

        res.json(validBookings);
    } catch (error) {
        console.error("getUserBookings Error:", error);
        res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        await connectDB();
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if user owns this booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to cancel this booking" });
        }

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        booking.status = "cancelled";
        await booking.save();

        res.json({ message: "Booking cancelled successfully!", booking });
    } catch (error) {
        console.error("cancelBooking Error:", error);
        res.status(500).json({ message: "Error cancelling booking", error: error.message });
    }
};
