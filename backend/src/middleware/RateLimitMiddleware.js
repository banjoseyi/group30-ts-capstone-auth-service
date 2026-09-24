import rateLimit from "express-rate-limit";

const createLimiter = ({ windowMs, limit, message, keyGenerator }) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        keyGenerator,
        handler: (req, res) => {
            return res.status(429).json({
                success: false,
                code: "TOO_MANY_REQUESTS",
                message,
            });
        },
    });


//Limit too many req on registration
const registerLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: "Too many registration attempts. Please try again later.",
});

//Limit too many logins
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per window
    message: { success: false, message: "Too many login attempts, please try again later." }
});

// Limit too many refresh
const refreshLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: "Too many refresh attempts. Please try again shortly.",
});

// Limit too many forgot password requests
const forgotPasswordLimiter = createLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: "Too many password reset attempts. Please try again later.",
});

export default {
    loginLimiter,
    registerLimiter,
    refreshLimiter,
    forgotPasswordLimiter,
};