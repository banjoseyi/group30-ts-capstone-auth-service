import jwt from "jsonwebtoken";
import User from "../model/User.js";
import AppError from "../utils/AppError.js";

const protect = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {
            throw new AppError("Access token is required", 401, "ACCESS_TOKEN_REQUIRED");
        }

        const accessToken = authorization.split(" ")[1];

        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            {
                issuer: "capstone-auth-project-api",
                audience: "capstone-auth-project-client"
            }
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            throw new AppError("User no longer exists", 401, "USER_NOT_FOUND");
        }

        // Reject access tokens created before password change
        if (user.passwordChangedAt) {

            const passwordChangedTimestamp = Math.floor(
                user.passwordChangedAt.getTime() / 1000
            );

            if (decoded.iat < passwordChangedTimestamp) {
                throw new AppError("Password was recently changed. Please log in again", 401, "PASSWORD_RECENTLY_CHANGED");
            }
        }

        if (user.status === "suspended") {
            throw new AppError("This account has been suspended", 403, "ACCOUNT_SUSPENDED");
        }

        req.user = user;

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return next(
                new AppError("Access token has expired", 401, "ACCESS_TOKEN_EXPIRED")
            );
        }

        if (error.name === "JsonWebTokenError") {
            return next(
                new AppError("Access token is invalid", 401, "INVALID_ACCESS_TOKEN")
            );
        }

        next(error);
    }
};

export default {
    protect
};