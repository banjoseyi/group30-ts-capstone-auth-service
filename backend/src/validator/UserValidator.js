import Joi from "joi";

const registerSchema = Joi.object(
    {
        firstName: Joi.string()
            .trim()
            .min(2)
            .max(30)
            .required()
            .messages({
                "string.base": "First name must be text",
                "string.empty": "First name is required",
                "string.min": "First name must contain at least 2 characters",
                "string.max": "First name cannot exceed 30 characters",
                "any.required": "First name is required",
            }),
        lastName: Joi.string()
            .trim()
            .min(2)
            .max(30)
            .required()
            .messages({
                "string.base": "Last name must be text",
                "string.empty": "Last name is required",
                "string.min": "Last name must contain at least 2 characters",
                "string.max": "Last name cannot exceed 30 characters",
                "any.required": "Last name is required",
            }),
        userName: Joi.string()
            .trim()
            .lowercase()
            .min(3)
            .max(20)
            .required()
            .pattern(/^[a-zA-Z0-9_]+$/)
            .messages({
                "string.base": "UserName must be text",
                "string.empty": "userName is required",
                "string.min": "userName must contain at least 3 characters",
                "string.max": "userName cannot exceed 20 characters",
                "any.required": "userName is required",
            }),
        email: Joi.string()
            .trim()
            .lowercase()
            .email()
            .required()
            .messages({
                "string.base": "Email must be text",
                "string.empty": "Email is required",
                "string.email": "Please provide a valid email address",
                "any.required": "Email is required",
            }),

        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
            .required()
            .messages({
                "string.empty": "Password is required",
                "string.min": "Password must contain at least 8 characters",
                "string.max": "Password cannot exceed 128 characters",
                "string.pattern.base": "Password must contain at least one letter and one number",
                "any.required": "Password is required",
            }),
    }
).options({
    abortEarly: false,
    allowUnknown: false,
});

const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .required(),
}).options({
    abortEarly: false,
    allowUnknown: false,
});


const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required"
        })
});


const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must contain at least 8 characters",
            "string.max": "Password cannot exceed 128 characters",
            "string.pattern.base": "Password must contain at least one letter and one number",
            "any.required": "Password is required"
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Please confirm your password"
        })
});


const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            "string.empty": "Current password is required",
            "any.required": "Current password is required"
        }),

    newPassword: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
        .required()
        .messages({
            "string.empty": "New password is required",
            "string.min": "New password must contain at least 8 characters",
            "string.max": "New password cannot exceed 128 characters",
            "string.pattern.base": "New password must contain at least one letter and one number",
            "any.required": "New password is required"
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
            "any.only": "Passwords do not match",
            "any.required": "Please confirm your new password"
        })
});

export default {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema
}