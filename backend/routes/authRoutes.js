const router = require("express").Router();
const { register, login, getProfile } = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const { check } = require("express-validator");

router.post("/register", [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 })
], register);

router.post("/login", [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
], login);

router.get("/profile", auth, getProfile);

module.exports = router;