import express from "express";
import Validate from "../middleware/validate.js";
import UserValidator from "../validator/UserValidator.js";
import UserController from "../controller/UserController.js";
import RateLimiter from "../middleware/RateLimitMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import upload from "../middleware/UploadMiddleware.js";

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = UserValidator;

const {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  changePasswordLimiter,
} = RateLimiter;

const { protect } = AuthMiddleware;

const router = express.Router();

/* ---------- Public auth routes ---------- */
router.post("/register", registerLimiter, Validate(registerSchema), UserController.registerUser);
router.post("/login", loginLimiter, Validate(loginSchema), UserController.loginUser);
router.post("/refresh", refreshLimiter, UserController.refreshAccessToken);
router.post("/logout", UserController.logoutUser);

/* ---------- Password recovery (public) ---------- */
router.post("/forgot-password", forgotPasswordLimiter, Validate(forgotPasswordSchema), UserController.forgotPassword);
router.post("/reset-password/:token", resetPasswordLimiter, Validate(resetPasswordSchema), UserController.resetPassword);

/* ---------- Current user (protected) ---------- */
router.get("/me", protect, UserController.getCurrentUser);
router.patch("/me/password", protect, changePasswordLimiter, Validate(changePasswordSchema), UserController.changePassword);

/* ---------- Profile image ---------- */
router.patch("/me/profile-image", protect, upload.single("profileImage"), UserController.updateProfileImage);
router.delete("/me/profile-image", protect, UserController.deleteProfileImage);

/* ---------- Sessions ---------- */
router.get("/me/sessions", protect, UserController.getSessionHistory);
router.delete("/me/sessions/:sessionId", protect, UserController.revokeSession);
router.delete("/me/sessions", protect, UserController.revokeAllSessions);

export default router;
