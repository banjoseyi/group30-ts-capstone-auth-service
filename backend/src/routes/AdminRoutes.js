import express from "express";

import AdminController from "../controller/AdminController.js";
import AdminValidator from "../validator/AdminValidator.js";

import AuthMiddleware from "../middleware/AuthMiddleware.js";
import allowRoles from "../middleware/RoleMiddleware.js";
import Validate from "../middleware/validate.js";

const router = express.Router();

const { protect } = AuthMiddleware;

const { updateRoleSchema, updateStatusSchema } = AdminValidator;


// Everything below requires authentication + admin role
router.use(protect);
router.use(allowRoles("admin"));

router.get("/users", AdminController.getAllUsers);
router.get("/users/:userId", AdminController.getUserById);
router.patch("/users/:userId/role", Validate(updateRoleSchema), AdminController.updateUserRole);
router.patch("/users/:userId/status", Validate(updateStatusSchema), AdminController.updateUserStatus);
router.delete("/users/:userId/sessions", AdminController.revokeUserSessions);

export default router;