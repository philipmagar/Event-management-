const router = require("express").Router();
const { 
    getEvents, 
    getEventById, 
    createEvent, 
    updateEvent, 
    deleteEvent,
    approveEvent,
    rejectEvent,
    getMyEvents
} = require("../controllers/eventController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { check } = require("express-validator");

const createEventValidation = [
    check("name", "Name is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("date", "Valid date is required").isISO8601().toDate(),
    check("time", "Time is required").not().isEmpty(),
    check("location", "Location is required").not().isEmpty(),
    check("capacity", "Capacity must be a number").isNumeric()
];

const updateEventValidation = [
    check("name", "Name is required").optional().not().isEmpty(),
    check("description", "Description is required").optional().not().isEmpty(),
    check("date", "Valid date is required").optional().isISO8601().toDate(),
    check("capacity", "Capacity must be a number").optional().isNumeric()
];

router.get("/", getEvents);
router.get("/my-events", auth, getMyEvents);
router.get("/:id", getEventById);
router.post("/", auth, createEventValidation, createEvent); 
router.patch("/:id/approve", auth, role("admin"), approveEvent);
router.patch("/:id/reject", auth, role("admin"), rejectEvent);
router.put("/:id", auth, updateEventValidation, updateEvent);
router.delete("/:id", auth, role("admin"), deleteEvent);

module.exports = router;
