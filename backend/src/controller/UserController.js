import User from "../model/User.js";
import Session from "../model/Session.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import TokenUtils from "../utils/TokenUtils.js";
import uploadImage from "../utils/UploadImage.js";
import cloudinary from "../config/cloudinary.js";
import sendEmail from "../utils/SendEmail.js";


const {
    createAccessToken,
    createRefreshToken,
    hashRefreshToken
} = TokenUtils;

const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, userName, email, password } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { userName }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? "email" : "userName";

            throw new AppError(`An account with this ${field} already exists`, 409, "DUPLICATE_ACCOUNT_FIELD");
        }

        const user = await User.create({
            firstName,
            lastName,
            userName,
            email,
            password
        })

        return res.status(201).json({
            success: true,
            message: "Account registered successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email,
            }
        })
    } catch (error) {
        next(error);
    }
}



const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");


        if (!user) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }

        if (user.status === "suspended") {
            throw new AppError("This account has been suspended", 403, "ACCOUNT_SUSPENDED");
        }

        const passwordMatches = await user.comparePassword(password);

        if (!passwordMatches) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }



        // Generating Tokens and Session IDs
        const sessionId = new mongoose.Types.ObjectId();

        const accessToken = createAccessToken(
            user._id.toString()
        );

        const refreshToken = createRefreshToken(
            user._id.toString(),
            sessionId.toString()
        );




        // Creating a Database Session Record
        await Session.create({
            _id: sessionId,
            user: user._id,
            refreshTokenHash: hashRefreshToken(refreshToken),

            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ),

            userAgent: req.get("user-agent") || null,
            ipAddress: req.ip || null,
        });

        // Setting the Refresh Token Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,

            secure: process.env.NODE_ENV === "production",

            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        next(error);
    }
}


const logoutUser = async (req, res, next) => {

    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET,
                    {
                        issuer: "capstone-auth-project-api",
                        audience: "capstone-auth-project-client",
                    }
                );

                await Session.findOneAndUpdate(
                    {
                        _id: decoded.sessionId,
                        user: decoded.id,
                        revokedAt: null,
                    },
                    {
                        $set: {
                            revokedAt: new Date(),
                        },
                    }
                );
            } catch (tokenError) {
                console.error("Logout token error:", tokenError);
            }
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};


const refreshAccessToken = async (req, res, next) => {

    try {
        const oldRefreshToken = req.cookies?.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET,
            {
                issuer: "capstone-auth-project-api",
                audience: "capstone-auth-project-client",
            }
        );

        /*
        refreshTokenHash has select: false in the Session model,
        so it must be explicitly selected.
        */

        const session = await Session.findOne({
            _id: decoded.sessionId,
            user: decoded.id,
        }).select("+refreshTokenHash");

        if (!session || session.revokedAt || session.expiresAt <= new Date()) {
            return res.status(401).json({
                success: false,
                message: "Session is invalid or expired",
            });
        }

        const submittedTokenHash = hashRefreshToken(oldRefreshToken);

        if (session.refreshTokenHash !== submittedTokenHash) {

            /*
            A different refresh token was presented for this
            session, so revoke the session.
            */

            session.revokedAt = new Date();
            await session.save();

            return res.status(401).json({
                success: false,
                message: "Refresh token is invalid",
            });
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            session.revokedAt = new Date();
            await session.save();

            throw new AppError("User no longer exists", 401, "USER_NOT_FOUND");
        }


        if (user.status === "suspended") {
            session.revokedAt = new Date();
            await session.save();

            throw new AppError("This account has been suspended", 403, "ACCOUNT_SUSPENDED");
        }


        const newAccessToken = createAccessToken(user._id.toString());

        const newRefreshToken = createRefreshToken(
            user._id.toString(),
            session._id.toString()
        );


        session.refreshTokenHash = hashRefreshToken(newRefreshToken);

        session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await session.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Access token refreshed",
            accessToken: newAccessToken,
        });


    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return next(new AppError("Refresh token is invalid or expired", 401));
        }

        console.error("Refresh-token error:", error);

        next(error);
    }
}


const getCurrentUser = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            userName: req.user.userName,
            email: req.user.email,
            role: req.user.role,
            status: req.user.status,
            profileImage: req.user.profileImage
        },
    });
};


const getSessionHistory = async (req, res, next) => {

    try {
        const sessions = await Session.find({
            user: req.user._id,
        })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions,
        })
    } catch (error) {
        next(error);
    }
};


const updateProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError("Profile image is required", 400, "PROFILE_IMAGE_REQUIRED");
        }

        const user = req.user;

        const uploadResult = await uploadImage(req.file.buffer);

        if (user.profileImage?.publicId) {
            await cloudinary.uploader.destroy(user.profileImage.publicId);
        }

        user.profileImage = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            profileImage: user.profileImage
        });

    } catch (error) {
        next(error);
    }
};


const deleteProfileImage = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user.profileImage?.publicId) {
            throw new AppError("No profile image to delete", 404, "PROFILE_IMAGE_NOT_FOUND");
        }

        await cloudinary.uploader.destroy(
            user.profileImage.publicId
        );

        user.profileImage = {
            url: null,
            publicId: null
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile image deleted successfully",
            profileImage: user.profileImage
        });

    } catch (error) {
        next(error);
    }
};


const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        const genericResponse = {
            success: true,
            message: "If an account exists for that email, a password reset link has been sent."
        };

        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.passwordResetToken = resetTokenHash;

        user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "Reset your password",
                html: `
                    <h2>Password Reset Request</h2>

                    <p>You requested to reset your password.</p>

                    <p>
                        <a href="${resetUrl}">
                            Reset Password
                        </a>
                    </p>

                    <p>This link will expire in 15 minutes.</p>

                    <p>
                        If you did not request this password reset,
                        you can ignore this email.
                    </p>
                `,
            });
        } catch (emailError) {
            user.passwordResetToken = undefined;
            user.passwordResetExpiresAt = undefined;

            await user.save();

            throw new AppError("Unable to send password reset email", 500, "EMAIL_SEND_FAILED");
        }

        return res.status(200).json(genericResponse);

    } catch (error) {
        next(error);
    }
};


const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: resetTokenHash,
            passwordResetExpiresAt: { $gt: new Date() }
        }).select("+passwordResetToken +passwordResetExpiresAt");

        if (!user) {
            throw new AppError("Password reset token is invalid or has expired", 400, "INVALID_RESET_TOKEN");
        }

        user.password = password;
        user.passwordChangedAt = new Date();
        user.passwordResetToken = undefined;
        user.passwordResetExpiresAt = undefined;

        await user.save();

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

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in again."
        });

    } catch (error) {
        next(error);
    }
};


const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            throw new AppError("User no longer exists", 401, "USER_NOT_FOUND");
        }

        const passwordMatches =
            await user.comparePassword(currentPassword);

        if (!passwordMatches) {
            throw new AppError("Current password is incorrect", 401, "INVALID_CURRENT_PASSWORD");
        }

        const samePassword =
            await user.comparePassword(newPassword);

        if (samePassword) {
            throw new AppError("New password must be different from the current password", 400, "SAME_PASSWORD");
        }

        user.password = newPassword;
        user.passwordChangedAt = new Date();

        await user.save();

        // Revoke all current refresh sessions
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

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            success: true,
            message:
                "Password changed successfully. Please log in again."
        });

    } catch (error) {
        next(error);
    }
};




const revokeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            throw new AppError("Invalid session ID", 400, "INVALID_SESSION_ID");
        }

        const session = await Session.findOne({
            _id: sessionId,
            user: req.user._id
        });

        if (!session) {
            throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
        }

        if (session.revokedAt) {
            throw new AppError("Session has already been revoked", 400, "SESSION_ALREADY_REVOKED");
        }

        session.revokedAt = new Date();

        await session.save();

        return res.status(200).json({
            success: true,
            message: "Session revoked successfully"
        });

    } catch (error) {
        next(error);
    }
};

const revokeAllSessions = async (req, res, next) => {
    try {
        await Session.updateMany(
            {
                user: req.user._id,
                revokedAt: null
            },
            {
                $set: {
                    revokedAt: new Date()
                }
            }
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            success: true,
            message:
                "All active sessions have been revoked. Please log in again."
        });

    } catch (error) {
        next(error);
    }
};



export default {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getSessionHistory,
    updateProfileImage,
    deleteProfileImage,
    forgotPassword,
    resetPassword,
    changePassword,
    revokeSession,
    revokeAllSessions
};