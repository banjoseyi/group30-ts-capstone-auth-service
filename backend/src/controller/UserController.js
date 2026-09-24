import User from "../model/User.js";
import Session from "../model/Session.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import TokenUtils from "../utils/TokenUtils.js";
import uploadImage from "../utils/UploadImage.js";
import cloudinary from "../config/cloudinary.js";


const { createAccessToken, createRefreshToken, hashRefreshToken } = TokenUtils;

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


export default {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getSessionHistory,
    updateProfileImage,
    deleteProfileImage,
};