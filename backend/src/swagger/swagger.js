
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Reusable OpenAPI helpers
const json = (schema, required = true) => ({
    required,
    content: {
        "application/json": { schema }
    }
});

const ref = (name) => ({
    $ref: `#/components/schemas/${name}`
});

const object = (properties, required) => ({
    type: "object",
    properties,
    ...(required ? { required } : {})
});

const str = (description, extra = {}) => ({
    type: "string",
    ...(description ? { description } : {}),
    ...extra
});

const success = (description, schema) => ({
    description,
    ...(schema
        ? { content: { "application/json": { schema } } }
        : {})
});

const error = (description) =>
    success(description, ref("ErrorResponse"));

const bearer = [{ bearerAuth: [] }];
const cookie = [{ refreshTokenCookie: [] }];

const userId = {
    name: "userId",
    in: "path",
    required: true,
    description: "MongoDB user ObjectId",
    schema: {
        type: "string",
        example: "507f1f77bcf86cd799439011"
    }
};

const sessionId = {
    name: "sessionId",
    in: "path",
    required: true,
    description: "MongoDB session ObjectId",
    schema: {
        type: "string",
        example: "507f1f77bcf86cd799439012"
    }
};

const authError = {
    401: error("Authentication is missing or invalid"),
    403: error("Access is forbidden")
};

const adminError = { ...authError };

// =====================================================
// API ENDPOINTS
// =====================================================

const paths = {

    // HEALTH CHECK

    "/health": {
        get: {
            tags: ["Health"],
            summary: "Check service health",
            responses: {
                200: success(
                    "Authentication service is running",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: str(undefined, {
                            example:
                                "Group 30 Authentication Service is running"
                        })
                    })
                )
            }
        }
    },

    // ===================================================
    // AUTHENTICATION
    // ===================================================

    "/api/auth/register": {
        post: {
            tags: ["Authentication"],
            summary: "Register a new user",
            description:
                "Create a new account using first name, last name, username, email and password.",

            requestBody: json(ref("RegisterRequest")),

            responses: {
                201: success(
                    "Account registered successfully",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: str(undefined, {
                            example:
                                "Account registered successfully"
                        }),
                        user: ref("PublicUser")
                    })
                ),

                400: error("Request validation failed"),

                409: error(
                    "Email or username already exists"
                ),

                429: error(
                    "Registration rate limit exceeded"
                )
            }
        }
    },

    "/api/auth/login": {
        post: {
            tags: ["Authentication"],
            summary: "Log in and create a session",

            description:
                "Authenticates a user, returns a JWT access token and sets an HTTP-only refreshToken cookie.",

            requestBody: json(ref("LoginRequest")),

            responses: {
                200: {
                    ...success(
                        "Login successful",
                        object({
                            success: {
                                type: "boolean",
                                example: true
                            },

                            message: str(undefined, {
                                example: "Login successful"
                            }),

                            accessToken: str(
                                "JWT access token used to access protected endpoints."
                            ),

                            user: ref("LoggedInUser")
                        })
                    ),

                    headers: {
                        "Set-Cookie": {
                            description:
                                "HTTP-only refreshToken cookie. Cookie attributes depend on the environment.",

                            schema: {
                                type: "string"
                            }
                        }
                    }
                },

                400: error("Request validation failed"),

                401: error(
                    "Invalid email or password"
                ),

                403: error("Account suspended"),

                429: error(
                    "Login rate limit exceeded"
                )
            }
        }
    },

    "/api/auth/refresh": {
        post: {
            tags: ["Authentication"],

            summary: "Refresh the access token",

            description:
                "Uses the HTTP-only refreshToken cookie to generate a new JWT access token and rotate the refresh token. Log in first in the same browser.",

            security: cookie,

            responses: {
                200: success(
                    "Access token refreshed. A rotated refreshToken cookie is set.",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        message: str(undefined, {
                            example: "Access token refreshed"
                        }),

                        accessToken: str()
                    })
                ),

                401: error(
                    "Missing, invalid or expired refresh token or session"
                ),

                403: error("Account suspended"),

                429: error(
                    "Refresh rate limit exceeded"
                )
            }
        }
    },

    "/api/auth/logout": {
        post: {
            tags: ["Authentication"],

            summary: "Log out the current user",

            description:
                "Revokes the current refresh session when a valid refreshToken cookie exists. Clears the cookie even when it is absent or invalid.",

            security: cookie,

            responses: {
                200: success(
                    "Logged out successfully",
                    ref("MessageResponse")
                )
            }
        }
    },

    // ===================================================
    // PASSWORD MANAGEMENT
    // ===================================================

    "/api/auth/forgot-password": {
        post: {
            tags: ["Password"],

            summary: "Request a password reset email",

            description:
                "Sends a password reset link when the supplied email belongs to an account. The response is the same whether or not the account exists. The reset link expires after 15 minutes.",

            requestBody: json(
                object(
                    {
                        email: str(undefined, {
                            format: "email",
                            example: "ada@example.com"
                        })
                    },
                    ["email"]
                )
            ),

            responses: {
                200: success(
                    "Request processed",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        message: str(undefined, {
                            example:
                                "If an account exists for that email, a password reset link has been sent."
                        })
                    })
                ),

                400: error("Request validation failed"),

                429: error(
                    "Password reset rate limit exceeded"
                ),

                500: error(
                    "Unable to send password reset email"
                )
            }
        }
    },

    "/api/auth/reset-password/{token}": {
        post: {
            tags: ["Password"],

            summary: "Reset password using the emailed token",

            description:
                "Resets the password using a valid reset token. Requires a password and matching confirmPassword. A successful reset revokes all active refresh sessions.",

            parameters: [
                {
                    name: "token",
                    in: "path",
                    required: true,

                    schema: str(
                        "Password reset token from the emailed URL"
                    )
                }
            ],

            requestBody: json(
                ref("ResetPasswordRequest")
            ),

            responses: {
                200: success(
                    "Password reset successfully. Log in again.",
                    ref("MessageResponse")
                ),

                400: error(
                    "Invalid or expired reset token, or request validation failed"
                )
            }
        }
    },

    "/api/auth/me/password": {
        patch: {
            tags: ["Password"],

            summary: "Change password while signed in",

            description:
                "Requires the current password, a different new password and matching confirmPassword. Revokes all active refresh sessions and clears the refresh-token cookie.",

            security: bearer,

            requestBody: json(
                ref("ChangePasswordRequest")
            ),

            responses: {
                200: success(
                    "Password changed. Log in again.",
                    ref("MessageResponse")
                ),

                400: error(
                    "Invalid request or the new password matches the current password"
                ),

                401: error(
                    "Authentication failed or current password is incorrect"
                ),

                403: error("Access forbidden")
            }
        }
    },

    // ===================================================
    // USER PROFILE
    // ===================================================

    "/api/auth/me": {
        get: {
            tags: ["Profile"],

            summary: "Get the authenticated user's profile",

            security: bearer,

            responses: {
                200: success(
                    "Current user profile",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        user: ref("CurrentUser")
                    })
                ),

                ...authError
            }
        }
    },

    "/api/auth/me/profile-image": {
        patch: {
            tags: ["Profile"],

            summary: "Upload or replace a profile image",

            description:
                "Uploads a profile image using multipart/form-data. The image is uploaded to Cloudinary, replacing the previous profile image when one exists.",

            security: bearer,

            requestBody: {
                required: true,

                content: {
                    "multipart/form-data": {
                        schema: object(
                            {
                                profileImage: {
                                    type: "string",
                                    format: "binary",
                                    description:
                                        "Image uploaded through the profileImage form field."
                                }
                            },

                            ["profileImage"]
                        )
                    }
                }
            },

            responses: {
                200: success(
                    "Profile image updated",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        message: str(),

                        profileImage: ref("ProfileImage")
                    })
                ),

                400: error(
                    "Image is missing or the upload is rejected"
                ),

                ...authError
            }
        },

        delete: {
            tags: ["Profile"],

            summary: "Delete the current profile image",

            description:
                "Deletes the user's existing profile image from Cloudinary and clears the stored image information.",

            security: bearer,

            responses: {
                200: success(
                    "Profile image deleted",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        message: str(),

                        profileImage: ref("ProfileImage")
                    })
                ),

                404: error(
                    "There is no profile image to delete"
                ),

                ...authError
            }
        }
    },

    // ===================================================
    // SESSION MANAGEMENT
    // ===================================================

    "/api/auth/me/sessions": {
        get: {
            tags: ["Sessions"],

            summary: "List the current user's sessions",

            description:
                "Returns the authenticated user's session history, ordered from newest to oldest.",

            security: bearer,

            responses: {
                200: success(
                    "Session history",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        count: {
                            type: "integer",
                            example: 1
                        },

                        data: {
                            type: "array",
                            items: ref("Session")
                        }
                    })
                ),

                ...authError
            }
        },

        delete: {
            tags: ["Sessions"],

            summary: "Revoke all current user's sessions",

            description:
                "Revokes all active refresh sessions belonging to the authenticated user and clears the refresh-token cookie.",

            security: bearer,

            responses: {
                200: success(
                    "All active sessions revoked. Log in again.",
                    ref("MessageResponse")
                ),

                ...authError
            }
        }
    },

    "/api/auth/me/sessions/{sessionId}": {
        delete: {
            tags: ["Sessions"],

            summary: "Revoke one of the current user's sessions",

            description:
                "Revokes a specific session belonging to the authenticated user.",

            security: bearer,

            parameters: [sessionId],

            responses: {
                200: success(
                    "Session revoked",
                    ref("MessageResponse")
                ),

                400: error(
                    "Invalid session ID or session already revoked"
                ),

                404: error(
                    "Session not found for this user"
                ),

                ...authError
            }
        }
    },

    // ===================================================
    // ADMIN USER MANAGEMENT
    // ===================================================

    "/api/admin/users": {
        get: {
            tags: ["Admin"],

            summary: "List and filter users (admin only)",

            description:
                "Returns a paginated list of users. Supports filtering by role, account status and a case-insensitive search across names, username and email.",

            security: bearer,

            parameters: [
                {
                    name: "page",
                    in: "query",

                    schema: {
                        type: "integer",
                        minimum: 1,
                        default: 1
                    }
                },

                {
                    name: "limit",
                    in: "query",

                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 10
                    }
                },

                {
                    name: "role",
                    in: "query",

                    schema: str("Filter by role", {
                        enum: ["user", "admin"]
                    })
                },

                {
                    name: "status",
                    in: "query",

                    schema: str("Filter by account status", {
                        enum: ["active", "suspended"]
                    })
                },

                {
                    name: "search",
                    in: "query",

                    schema: str(
                        "Case-insensitive search across first name, last name, username and email."
                    )
                }
            ],

            responses: {
                200: success(
                    "Paginated users",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        count: {
                            type: "integer"
                        },

                        pagination: object({
                            page: {
                                type: "integer"
                            },

                            limit: {
                                type: "integer"
                            },

                            total: {
                                type: "integer"
                            },

                            totalPages: {
                                type: "integer"
                            }
                        }),

                        data: {
                            type: "array",
                            items: ref("AdminUser")
                        }
                    })
                ),

                ...adminError
            }
        }
    },

    "/api/admin/users/{userId}": {
        get: {
            tags: ["Admin"],

            summary: "Get a user and their sessions (admin only)",

            description:
                "Retrieves a specific user by MongoDB ObjectId, including the user's session history.",

            security: bearer,

            parameters: [userId],

            responses: {
                200: success(
                    "User and session history",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        user: ref("AdminUser"),

                        sessions: {
                            type: "array",
                            items: ref("Session")
                        }
                    })
                ),

                400: error("Invalid user ID"),

                404: error("User not found"),

                ...adminError
            }
        }
    },

    "/api/admin/users/{userId}/role": {
        patch: {
            tags: ["Admin"],

            summary: "Change a user's role (admin only)",

            description:
                "Changes a user's role to user or admin. An administrator cannot remove their own admin role.",

            security: bearer,

            parameters: [userId],

            requestBody: json(
                object(
                    {
                        role: {
                            type: "string",
                            enum: ["user", "admin"]
                        }
                    },

                    ["role"]
                )
            ),

            responses: {
                200: success(
                    "Role updated",
                    ref("AdminMutationResponse")
                ),

                400: error(
                    "Invalid ID, role or prohibited self-role change"
                ),

                404: error("User not found"),

                ...adminError
            }
        }
    },

    "/api/admin/users/{userId}/status": {
        patch: {
            tags: ["Admin"],

            summary: "Suspend or reactivate a user (admin only)",

            description:
                "Changes a user's account status. An administrator cannot suspend their own account. Suspending a user revokes their active refresh sessions.",

            security: bearer,

            parameters: [userId],

            requestBody: json(
                object(
                    {
                        status: {
                            type: "string",
                            enum: ["active", "suspended"]
                        }
                    },

                    ["status"]
                )
            ),

            responses: {
                200: success(
                    "Account status updated",
                    ref("AdminMutationResponse")
                ),

                400: error(
                    "Invalid ID, status or prohibited self-suspension"
                ),

                404: error("User not found"),

                ...adminError
            }
        }
    },

    "/api/admin/users/{userId}/sessions": {
        delete: {
            tags: ["Admin"],

            summary:
                "Revoke all active sessions for a user (admin only)",

            description:
                "Revokes all active refresh sessions belonging to a specified user.",

            security: bearer,

            parameters: [userId],

            responses: {
                200: success(
                    "Active sessions revoked",
                    object({
                        success: {
                            type: "boolean",
                            example: true
                        },

                        message: str(),

                        revokedCount: {
                            type: "integer",
                            example: 2
                        }
                    })
                ),

                400: error("Invalid user ID"),

                404: error("User not found"),

                ...adminError
            }
        }
    }
};

// =====================================================
// SWAGGER CONFIGURATION
// =====================================================

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.3",

        info: {
            title: "Group 30 Authentication Service API",
            version: "1.0.0",
            description:
                "TS Academy Group 30 Capstone Project. " +
                "Designed, developed, documented and deployed " +
                "by Oluwaseyifunmi Oluwatunmise Banjo, Lead Full-Stack Developer.",

            contact: {
                name: "Oluwaseyifunmi Oluwatunmise Banjo",
                email: "Banjoseyi2@gmail.com",
                url: "https://github.com/your-username"
            }
        },

        servers: [
            {
                url: "https://group30-ts-capstone-auth-service.onrender.com",
                description: "Production Server - Render"
            },
            {
                url: "http://localhost:2000",
                description: "Local Development Server"
            }
        ],

        tags: [
            {
                name: "Health",
                description: "Service availability"
            },

            {
                name: "Authentication",
                description:
                    "Registration, login, refresh and logout"
            },

            {
                name: "Password",
                description:
                    "Password recovery and changes"
            },

            {
                name: "Profile",
                description:
                    "Authenticated user profile"
            },

            {
                name: "Sessions",
                description:
                    "Current user's session management"
            },

            {
                name: "Admin",
                description:
                    "Administrator-only user management"
            }
        ],

        // =================================================
        // AUTHENTICATION SECURITY
        // =================================================

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",

                    scheme: "bearer",

                    bearerFormat: "JWT",

                    description:
                        "Paste the accessToken returned from /api/auth/login."
                },

                refreshTokenCookie: {
                    type: "apiKey",

                    in: "cookie",

                    name: "refreshToken",

                    description:
                        "HTTP-only cookie automatically set by the login endpoint. Browser JavaScript cannot set it manually."
                }
            },

            // ===============================================
            // REQUEST AND RESPONSE SCHEMAS
            // ===============================================

            schemas: {

                // PASSWORD REQUIREMENTS

                NewPassword: str(
                    "8–128 characters, including at least one letter and one digit",
                    {
                        format: "password",

                        minLength: 8,

                        maxLength: 128,

                        pattern:
                            "^(?=.*[A-Za-z])(?=.*\\d).*$",

                        example: "Capstone123"
                    }
                ),

                // RESET PASSWORD

                ResetPasswordRequest: object(
                    {
                        password: ref("NewPassword"),

                        confirmPassword: str(
                            "Must match password",
                            {
                                format: "password",

                                example: "Capstone123"
                            }
                        )
                    },

                    ["password", "confirmPassword"]
                ),

                // CHANGE PASSWORD

                ChangePasswordRequest: object(
                    {
                        currentPassword: str(undefined, {
                            format: "password"
                        }),

                        newPassword: ref("NewPassword"),

                        confirmPassword: str(
                            "Must match newPassword",
                            {
                                format: "password",

                                example: "Capstone123"
                            }
                        )
                    },

                    [
                        "currentPassword",
                        "newPassword",
                        "confirmPassword"
                    ]
                ),

                // REGISTER USER

                RegisterRequest: object(
                    {
                        firstName: str(undefined, {
                            minLength: 2,

                            maxLength: 30,

                            example: "Ada",

                            description: "Trimmed name"
                        }),

                        lastName: str(undefined, {
                            minLength: 2,

                            maxLength: 30,

                            example: "Okafor",

                            description: "Trimmed name"
                        }),

                        userName: str(undefined, {
                            minLength: 3,

                            maxLength: 20,

                            pattern: "^[a-zA-Z0-9_]+$",

                            example: "ada_okafor",

                            description:
                                "Trimmed and converted to lowercase"
                        }),

                        email: str(undefined, {
                            format: "email",

                            example: "ada@example.com",

                            description:
                                "Trimmed and converted to lowercase"
                        }),

                        password: ref("NewPassword")
                    },

                    [
                        "firstName",
                        "lastName",
                        "userName",
                        "email",
                        "password"
                    ]
                ),

                // LOGIN USER

                LoginRequest: object(
                    {
                        email: str(undefined, {
                            format: "email",

                            example: "ada@example.com"
                        }),

                        password: str(undefined, {
                            format: "password"
                        })
                    },

                    ["email", "password"]
                ),

                // PROFILE IMAGE

                ProfileImage: object({
                    url: {
                        type: "string",

                        nullable: true,

                        format: "uri"
                    },

                    publicId: {
                        type: "string",

                        nullable: true
                    }
                }),

                // PUBLIC USER RESPONSE

                PublicUser: object({
                    id: str(),

                    firstName: str(),

                    lastName: str(),

                    userName: str(),

                    email: str(undefined, {
                        format: "email"
                    })
                }),

                // LOGGED-IN USER RESPONSE

                LoggedInUser: object({
                    id: str(),

                    firstName: str(),

                    lastName: str(),

                    userName: str(),

                    email: str(undefined, {
                        format: "email"
                    }),

                    role: str(),

                    createdAt: str(undefined, {
                        format: "date-time"
                    }),

                    profileImage: ref("ProfileImage")
                }),

                // CURRENT USER RESPONSE

                CurrentUser: object({
                    id: str(),

                    firstName: str(),

                    lastName: str(),

                    userName: str(),

                    email: str(undefined, {
                        format: "email"
                    }),

                    role: str(),

                    status: str(),

                    profileImage: ref("ProfileImage"),

                    createdAt: str(undefined, {
                        format: "date-time"
                    })
                }),

                // ADMIN USER RESPONSE

                AdminUser: object({
                    _id: str(),

                    firstName: str(),

                    lastName: str(),

                    userName: str(),

                    email: str(undefined, {
                        format: "email"
                    }),

                    role: str(),

                    status: str(),

                    createdAt: str(undefined, {
                        format: "date-time"
                    })
                }),

                // SESSION RESPONSE

                Session: object({
                    _id: str(),

                    user: str("User ObjectId"),

                    expiresAt: str(undefined, {
                        format: "date-time"
                    }),

                    revokedAt: {
                        type: "string",

                        format: "date-time",

                        nullable: true
                    },

                    createdAt: str(undefined, {
                        format: "date-time"
                    }),

                    userAgent: {
                        type: "string",

                        nullable: true
                    },

                    ipAddress: {
                        type: "string",

                        nullable: true
                    }
                }),

                // ADMIN UPDATE RESPONSE

                AdminMutationResponse: object({
                    success: {
                        type: "boolean",

                        example: true
                    },

                    message: str(),

                    user: object({
                        id: str(),

                        firstName: str(),

                        lastName: str(),

                        userName: str(),

                        email: str(undefined, {
                            format: "email"
                        }),

                        role: str(),

                        status: str()
                    })
                }),

                // GENERIC SUCCESS RESPONSE

                MessageResponse: object({
                    success: {
                        type: "boolean",

                        example: true
                    },

                    message: str()
                }),

                // GENERIC ERROR RESPONSE

                ErrorResponse: object(
                    {
                        success: {
                            type: "boolean",

                            example: false
                        },

                        message: str("Error message")
                    },

                    ["success", "message"]
                )
            }
        },

        paths
    },

    apis: []
});

// =====================================================
// EXPORT SWAGGER
// =====================================================

export {
    swaggerUi,
    swaggerSpec
};
