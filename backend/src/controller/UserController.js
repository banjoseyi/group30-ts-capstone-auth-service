import User from "../model/User.js";
import Session from "../model/Session.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import TokenUtils from "../utils/TokenUtils.js";

const { createAccessToken, createRefreshToken, hashRefreshToken } = TokenUtils;

const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            throw new AppError("An account with this email already exists", 409);
        }

        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password
        })

        return res.status(201).json({
            success: true,
            message: "Account Registerd successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
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
            throw new AppError("Invalid email or password", 404);
        }

        const passwordMatches = await bcrypt.compare(
            password, user.password
        );

        if (!passwordMatches) {
            throw new AppError("Invalid email or password", 404);
        }


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

            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
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



export default {
    registerUser,
    loginUser,
    logoutUser
};