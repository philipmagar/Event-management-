const Event = require("../models/Event");
const Booking = require("../models/Booking");
const { validationResult } = require("express-validator");

exports.getEvents = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        let query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        } else if (!status) {
            query.status = "approved";
        }

        if (search) {
            query.$text = { $search: search };
        }

        const events = await Event.find(query)
            .populate("createdBy", "name email")
            .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
            .lean();
        
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
        next(error);
    }
};

exports.getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate("createdBy", "name email").lean();
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Add booking count
        const bookingsCount = await Booking.countDocuments({ event: event._id });
        
        res.json({ ...event, bookingsCount });
    } catch (error) {
        next(error);
    }
};

exports.createEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, date, time, location, capacity, price, image, category, agenda, tags } = req.body;

        const event = new Event({
            name,
            description,
            date: new Date(date),
            time,
            location,
            capacity: Number(capacity),
            price: Number(price) || 0,
            category: category || "General",
            agenda,
            tags: Array.isArray(tags) ? tags : [],
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
        next(error);
    }
};

exports.approveEvent = async (req, res, next) => {
    try {
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
        next(error);
    }
};

exports.rejectEvent = async (req, res, next) => {
    try {
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
        next(error);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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

        const { name, description, date, time, location, capacity, price, image, category, agenda, tags } = req.body;
        
        // Filter out undefined fields to avoid overwriting with undefined
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (date !== undefined) updates.date = date;
        if (time !== undefined) updates.time = time;
        if (location !== undefined) updates.location = location;
        if (capacity !== undefined) updates.capacity = capacity;
        if (price !== undefined) updates.price = price;
        if (image !== undefined) updates.image = image;
        if (category !== undefined) updates.category = category;
        if (agenda !== undefined) updates.agenda = agenda;
        if (tags !== undefined) updates.tags = tags;

        // Admin can update directly
        if (isAdmin) {
            Object.assign(event, updates);
            event.pendingUpdates = null; // Clear any pending updates
            await event.save();
            return res.json({ message: "Event updated successfully!", event });
        }

        // Non-admin: store as pending updates for approved events
        if (event.status === "approved") {
            // Merge existing pending updates with new updates if any
            event.pendingUpdates = { ...(event.pendingUpdates || {}), ...updates };
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
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Delete all associated bookings first
        await Booking.deleteMany({ event: req.params.id });
        
        await Event.findByIdAndDelete(req.params.id);
        
        res.json({ message: "Event and associated bookings deleted successfully!" });
    } catch (error) {
        next(error);
    }
};

exports.getMyEvents = async (req, res, next) => {
    try {
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
        next(error);
    }
};
