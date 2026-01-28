const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in .env");
            return;
        }

        const info = await transporter.sendMail({
            from: `"Event Management" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Email sending error:", error);
    }
};

const sendBookingConfirmation = async (user, event) => {
    const subject = `Booking Confirmed: ${event.name}`;
    const date = new Date(event.date);
    const dateStr = date.toLocaleDateString();
    
    // Format date for Google Calendar (YYYYMMDDTHHmmSSZ)
    const startGCal = date.toISOString().replace(/-|:|\.\d+/g, "");
    const endGCal = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, ""); // Assume 2 hours duration
    const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${startGCal}/${endGCal}&details=${encodeURIComponent(event.description || "Event booking")}&location=${encodeURIComponent(event.location)}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #4CAF50;">Booking Confirmed!</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your booking for the event <strong>${event.name}</strong> has been successfully confirmed.</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                <p><strong>Event Details:</strong></p>
                <p>📅 Date: ${dateStr}</p>
                <p>📍 Location: ${event.location}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${gCalUrl}" target="_blank" style="background-color: #4285F4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">📅 Add to Google Calendar</a>
            </div>
            
            <p>We look forward to seeing you there!</p>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated email. Please do not reply.</p>
        </div>
    `;
    
    return sendEmail(user.email, subject, html);
};

const sendEventReminder = async (user, event) => {
    const subject = `Reminder: ${event.name} starts tomorrow!`;
    const date = new Date(event.date).toLocaleDateString();

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fff3e0;">
            <h2 style="color: #e65100;">Event Reminder</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>This is a reminder that the event <strong>${event.name}</strong> is starting tomorrow!</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                <p><strong>Event Details:</strong></p>
                <p>📅 Date: ${date}</p>
                <p>📍 Location: ${event.location}</p>
            </div>
            
            <p>Don't forget to mark your calendar!</p>
            <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated email. Please do not reply.</p>
        </div>
    `;

    return sendEmail(user.email, subject, html);
};

module.exports = {
    sendBookingConfirmation,
    sendEventReminder
};
