import jwt from "jsonwebtoken";
import crypto from "crypto";

// Short-lived token used by protect middleware.
const createAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "15m",
            issuer: "capstone-auth-project-api",
            audience: "capstone-auth-project-client",
        }
    );
};

// Long-lived token used only by /refresh and /logout.
const createRefreshToken = (userId, sessionId) => {
    return jwt.sign(
        {
            id: userId,
            sessionId,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d",
            issuer: "capstone-auth-project-api",
            audience: "capstone-auth-project-client",
        }
    );
};

// Converts the refresh token into a one-way hash for database storage.
const hashRefreshToken = (refreshToken) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
};

export default {
    createAccessToken,
    createRefreshToken,
    hashRefreshToken,
};