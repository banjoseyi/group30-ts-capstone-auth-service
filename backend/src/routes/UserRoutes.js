import express from "express";
import Validate from "../middleware/validate.js";
import UserValidator from "../validator/UserValidator.js";
import UserController from "../controller/UserController.js";
import rateLimiter from "../middleware/RateLimitMiddleware.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

const { registerSchema, loginSchema } = UserValidator;
const { loginLimiter, registerLimiter, refreshLimiter, } = rateLimiter;

const router = express.Router();

router.post("/register", registerLimiter, Validate(registerSchema), UserController.registerUser);
router.post("/login", loginLimiter, Validate(loginSchema), UserController.loginUser);
router.post("/logout", UserController.logoutUser);

export default router;