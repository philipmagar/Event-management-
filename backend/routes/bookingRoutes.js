const router = require("express").Router();
const { 
    createBooking, 
    getUserBookings, 
    cancelBooking 
} = require("../controllers/bookingController");
const auth = require("../middleware/authMiddleware");
const { check } = require("express-validator");

router.post("/", auth, [
    check("eventId", "Event ID is required").not().isEmpty(),
    check("eventId", "Invalid Event ID format").isMongoId()
], createBooking);

router.get("/my-bookings", auth, getUserBookings);
router.delete("/:id", auth, cancelBooking);

module.exports = router;