const cron = require("node-cron");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { sendEventReminder } = require("./emailService");
const connectDB = require("../config/db");

const sendReminders = async () => {
    console.log("Running event reminder task...");
    try {
        await connectDB();
        
        // Calculate date for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Find events happening tomorrow
        const eventsTomorrow = await Event.find({
            date: {
                $gte: tomorrow,
                $lt: dayAfterTomorrow
            },
            status: "approved"
        });

        console.log(`Found ${eventsTomorrow.length} events happening tomorrow.`);

        let count = 0;
        for (const event of eventsTomorrow) {
            // Find all confirmed bookings for this event
            const bookings = await Booking.find({
                event: event._id,
                status: "confirmed"
            }).populate("user");

            for (const booking of bookings) {
                if (booking.user && booking.user.email) {
                    console.log(`Sending reminder to ${booking.user.email} for event ${event.name}`);
                    await sendEventReminder(booking.user, event);
                    count++;
                }
            }
        }
        return { success: true, eventsFound: eventsTomorrow.length, remindersSent: count };
    } catch (error) {
        console.error("Reminder task error:", error);
        throw error;
    }
};

const initCronJobs = () => {
    // node-cron is only effective in long-running environments (like VPS/Docker)
    // For Vercel, use the /api/cron/reminders route with Vercel Cron
    if (process.env.VERCEL) {
        console.log("Vercel environment detected. node-cron skipped. Use /api/cron/reminders route.");
        return;
    }

    // Run every day at 00:00 (midnight)
    cron.schedule("0 0 * * *", async () => {
        await sendReminders();
    });

    console.log("Cron jobs initialized.");
};

module.exports = { initCronJobs, sendReminders };
