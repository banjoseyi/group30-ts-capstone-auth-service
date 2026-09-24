import AppError from "../utils/AppError.js";

const allowRoles = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return next(
                new AppError("Authentication is required", 401, "AUTHENTICATION_REQUIRED"
                )
            );
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("You are not permitted to perform this action", 403, "FORBIDDEN"
                )
            );
        }

        next();
    };
};

export default allowRoles;