const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const { emitUpdate } = require("../utils/socket");
const { validationResult } = require("express-validator");

exports.createBooking = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { eventId } = req.body;

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

        if ((event.bookingsCount || 0) >= event.capacity) {
            return res.status(400).json({ message: "This event is fully booked" });
        }

        const booking = new Booking({
            event: eventId,
            user: req.user.id,
            status: "confirmed"
        });

        await booking.save();

        // Atomically increment booking count
        await Event.findByIdAndUpdate(eventId, { $inc: { bookingsCount: 1 } });

        // Emit real-time update
        emitUpdate("bookingUpdated", { eventId });

        res.status(201).json({ 
            message: "Booking confirmed successfully!", 
            booking 
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate("event")
            .sort({ createdAt: -1 });

        // Filter out bookings where event was deleted
        const validBookings = bookings.filter(booking => booking.event !== null);

        res.json(validBookings);
    } catch (error) {
        next(error);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
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

        // Permanently delete the booking
        await Booking.findByIdAndDelete(req.params.id);

        // Atomically decrement booking count
        await Event.findByIdAndUpdate(booking.event, { $inc: { bookingsCount: -1 } });

        // Emit real-time update
        emitUpdate("bookingUpdated", { eventId: booking.event });

        res.json({ message: "Registration removed and booking cancelled successfully!" });
    } catch (error) {
        next(error);
    }
};
