const Event = require("../models/Event");
const Booking = require("../models/Booking");

const connectDB = require("../config/db");

exports.getEvents = async (req, res) => {
    try {
        await connectDB();
        const { status } = req.query;
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = "approved";
        }
        // If status is 'all', we don't add the status filter (returns everything)

        console.log("Fetching events with query:", JSON.stringify(query));

        const events = await Event.find(query).populate("createdBy", "name email").lean();
        
        if (!events) {
             return res.json([]);
        }

        // Add booking count for each event
        const eventsWithBookings = await Promise.all(events.map(async (event) => {
            const bookingsCount = await Booking.countDocuments({ event: event._id });
            return { ...event, bookingsCount };
        }));

        res.json(eventsWithBookings);
    } catch (error) {
        console.error("getEvents Error details:", error);
        res.status(500).json({ 
            message: "Error fetching events", 
            error: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
};

exports.getEventById = async (req, res) => {
    try {
        await connectDB();
        const event = await Event.findById(req.params.id).populate("createdBy", "name email").lean();
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Add booking count
        const bookingsCount = await Booking.countDocuments({ event: event._id });
        
        res.json({ ...event, bookingsCount });
    } catch (error) {
        console.error("getEventById Error:", error);
        res.status(500).json({ message: "Error fetching event", error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        await connectDB();
        const { name, description, date, time, location, capacity, price, image } = req.body;

        // Validation
        if (!name || !description || !date || !time || !location || !capacity) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const event = new Event({
            name,
            description,
            date: new Date(date),
            time,
            location,
            capacity: Number(capacity),
            price: Number(price) || 0,
            image,
            createdBy: req.user.id,
            status: req.user.role === "admin" ? "approved" : "pending"
        });

        await event.save();

        res.status(201).json({ 
            message: req.user.role === "admin" 
                ? "Event created and approved!" 
                : "Event submitted for approval!",
            event 
        });
    } catch (error) {
        console.error("createEvent Error:", error);
        res.status(500).json({ message: "Error creating event", error: error.message });
    }
};

exports.approveEvent = async (req, res) => {
    try {
        await connectDB();
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // If there are pending updates, apply them
        if (event.pendingUpdates) {
            Object.assign(event, event.pendingUpdates);
            event.pendingUpdates = null;
        }

        event.status = "approved";
        await event.save();

        res.json({ message: "Event approved successfully!", event });
    } catch (error) {
        console.error("approveEvent Error:", error);
        res.status(500).json({ message: "Error approving event", error: error.message });
    }
};

exports.rejectEvent = async (req, res) => {
    try {
        await connectDB();
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // If it's a pending new event, delete it
        if (event.status === "pending" && !event.pendingUpdates) {
            await Event.findByIdAndDelete(req.params.id);
            return res.json({ message: "Event rejected and deleted." });
        }

        // If it has pending updates, just clear them
        if (event.pendingUpdates) {
            event.pendingUpdates = null;
            await event.save();
            return res.json({ message: "Pending updates rejected.", event });
        }

        event.status = "rejected";
        await event.save();

        res.json({ message: "Event rejected.", event });
    } catch (error) {
        console.error("rejectEvent Error:", error);
        res.status(500).json({ message: "Error rejecting event", error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        await connectDB();
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check authorization
        const isOwner = event.createdBy.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to update this event" });
        }

        const { name, description, date, time, location, capacity, price, image } = req.body;
        const updates = { name, description, date, time, location, capacity, price, image };

        // Admin can update directly
        if (isAdmin) {
            Object.assign(event, updates);
            event.pendingUpdates = null; // Clear any pending updates
            await event.save();
            return res.json({ message: "Event updated successfully!", event });
        }

        // Non-admin: store as pending updates for approved events
        if (event.status === "approved") {
            event.pendingUpdates = updates;
            await event.save();
            return res.json({ 
                message: "Update submitted for admin approval!", 
                event 
            });
        }

        // For pending events, update directly
        Object.assign(event, updates);
        await event.save();
        res.json({ message: "Event updated!", event });
    } catch (error) {
        console.error("updateEvent Error:", error);
        res.status(500).json({ message: "Error updating event", error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        await connectDB();
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Delete all associated bookings first
        await Booking.deleteMany({ event: req.params.id });
        
        await Event.findByIdAndDelete(req.params.id);
        
        res.json({ message: "Event and associated bookings deleted successfully!" });
    } catch (error) {
        console.error("deleteEvent Error:", error);
        res.status(500).json({ message: "Error deleting event", error: error.message });
    }
};

exports.getMyEvents = async (req, res) => {
    try {
        await connectDB();
        const events = await Event.find({ createdBy: req.user.id })
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 })
            .lean();

        // Add booking count for each event
        const eventsWithBookings = await Promise.all(events.map(async (event) => {
            const bookingsCount = await Booking.countDocuments({ event: event._id });
            return { ...event, bookingsCount };
        }));

        res.json(eventsWithBookings);
    } catch (error) {
        console.error("getMyEvents Error:", error);
        res.status(500).json({ message: "Error fetching your events", error: error.message });
    }
};
