const router = require("express").Router();
const { 
    createBooking, 
    getUserBookings, 
    cancelBooking 
} = require("../controllers/bookingController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, createBooking);
router.get("/my-bookings", auth, getUserBookings);
router.delete("/:id", auth, cancelBooking);

module.exports = router;