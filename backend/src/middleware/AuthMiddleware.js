import jwt from "jsonwebtoken";
import User from "../model/User.js";

const protect = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: "Access token is required",
            });
        }

        const accessToken = authorization.split(" ")[1];

        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET,
            {
                issuer: "capstone-auth-project-api",
                audience: "capstone-auth-project-client",
            }
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                code: "ACCESS_TOKEN_EXPIRED",
                message: "Access token has expired",
            });
        }

        return res.status(401).json({
            success: false,
            code: "INVALID_ACCESS_TOKEN",
            message: "Access token is invalid",
        });
    }
};



export default { protect };