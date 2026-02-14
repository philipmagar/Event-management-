const router = require("express").Router();
const {
  register,
  login,
  getProfile,
  refreshToken,
  logout,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const { check } = require("express-validator");

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  register,
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login,
);

router.get("/refresh", refreshToken);
router.post("/logout", logout);

router.get("/profile", auth, getProfile);

module.exports = router;
