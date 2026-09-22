import express from "express";
import Validate from "../middleware/validate.js";
import UserValidator from "../validator/UserValidator.js"
import UserController from "../controller/UserController.js"

const { registerSchema, loginSchema } = UserValidator;

const router = express.Router();

router.post("/register", Validate(registerSchema), UserController.registerUser);

export default router;