import User from "../model/User.js";
import Session from "../model/Session.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

const getAllUsers = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);

        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

        const skip = (page - 1) * limit;

        const filter = {};

        if (req.query.role) { filter.role = req.query.role; }

        if (req.query.status) { filter.status = req.query.status; }

        if (req.query.search) {
            const search = req.query.search;

            filter.$or = [
                {
                    firstName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    lastName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    userName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            User.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            count: users.length,
            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(total / limit)
            },
            data: users
        });

    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID", 400, "INVALID_USER_ID");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404, "USER_NOT_FOUND");
        }

        const sessions = await Session.find({
            user: user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            user,
            sessions
        });

    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID", 400, "INVALID_USER_ID"
            );
        }

        if (!["user", "admin"].includes(role)) {
            throw new AppError("Invalid role", 400, "INVALID_ROLE");
        }

        if (
            req.user._id.toString() === userId &&
            role !== "admin"
        ) {
            throw new AppError("You cannot remove your own admin role", 400, "SELF_ROLE_CHANGE_NOT_ALLOWED"
            );
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404, "USER_NOT_FOUND"
            );
        }

        user.role = role;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID", 400, "INVALID_USER_ID"
            );
        }

        if (!["active", "suspended"].includes(status)) {
            throw new AppError("Invalid account status", 400, "INVALID_ACCOUNT_STATUS"
            );
        }

        if (req.user._id.toString() === userId && status === "suspended") {
            throw new AppError("You cannot suspend your own account", 400, "SELF_SUSPENSION_NOT_ALLOWED"
            );
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404, "USER_NOT_FOUND"
            );
        }

        user.status = status;

        await user.save();

        if (status === "suspended") {
            await Session.updateMany(
                {
                    user: user._id,
                    revokedAt: null
                },
                {
                    $set: {
                        revokedAt: new Date()
                    }
                }
            );
        }

        return res.status(200).json({
            success: true,
            message:
                status === "suspended"
                    ? "User suspended successfully"
                    : "User reactivated successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        next(error);
    }
};

const revokeUserSessions = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError("Invalid user ID", 400, "INVALID_USER_ID"
            );
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError("User not found", 404, "USER_NOT_FOUND"
            );
        }

        const result = await Session.updateMany(
            {
                user: user._id,
                revokedAt: null
            },
            {
                $set: {
                    revokedAt: new Date()
                }
            }
        );

        return res.status(200).json({
            success: true,
            message:
                "All active sessions for this user have been revoked",
            revokedCount: result.modifiedCount
        });

    } catch (error) {
        next(error);
    }
};

export default {
    getAllUsers,
    getUserById,
    updateUserRole,
    updateUserStatus,
    revokeUserSessions
};