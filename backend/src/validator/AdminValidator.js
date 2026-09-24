import Joi from "joi";

const updateRoleSchema = Joi.object({
    role: Joi.string()
        .valid("user", "admin")
        .required()
        .messages({
            "any.only": "Role must be either user or admin",
            "any.required": "Role is required"
        })
});

const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid("active", "suspended")
        .required()
        .messages({
            "any.only": "Status must be either active or suspended",
            "any.required": "Status is required"
        })
});

export default {
    updateRoleSchema,
    updateStatusSchema
};