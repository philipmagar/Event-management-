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

router.get("/", getEvents);
router.get("/my-events", auth, getMyEvents);
router.get("/:id", getEventById);
router.post("/", auth, createEvent); // All logged in users can create
router.patch("/:id/approve", auth, role("admin"), approveEvent);
router.patch("/:id/reject", auth, role("admin"), rejectEvent);
router.put("/:id", auth, updateEvent);
router.delete("/:id", auth, role("admin"), deleteEvent);

module.exports = router;
