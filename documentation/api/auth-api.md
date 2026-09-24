# Group 30 Authentication Service — API Documentation

## Overview

A REST API for authentication, authorization, password recovery, session management, profile images, and admin user management.

**Base URL**
```text
http://localhost:2000
```

**Protected routes**
```http
Authorization: Bearer <access_token>
```

Access tokens expire after **15 minutes**. Refresh tokens expire after **7 days**, are stored in an HTTP-only cookie, and are represented in MongoDB only by a SHA-256 hash.

---

# Endpoint Summary

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Refresh cookie |
| POST | `/api/auth/logout` | Public / refresh cookie |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/auth/me/sessions` | Authenticated |
| PATCH | `/api/auth/me/profile-image` | Authenticated |
| DELETE | `/api/auth/me/profile-image` | Authenticated |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password/:token` | Public |
| PATCH | `/api/auth/me/password` | Authenticated |
| DELETE | `/api/auth/me/sessions/:sessionId` | Authenticated |
| DELETE | `/api/auth/me/sessions` | Authenticated |
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/users/:userId` | Admin |
| PATCH | `/api/admin/users/:userId/role` | Admin |
| PATCH | `/api/admin/users/:userId/status` | Admin |
| DELETE | `/api/admin/users/:userId/sessions` | Admin |

---

# Authentication

## Register

```http
POST /api/auth/register
```

Creates a new user. New accounts default to `role: user` and `status: active`.

```json
{
  "firstName": "Test",
  "lastName": "User",
  "userName": "testuser",
  "email": "test@example.com",
  "password": "Password123"
}
```

**Success:** `201`

```json
{
  "success": true,
  "message": "Account registered successfully",
  "user": {
    "id": "...",
    "firstName": "Test",
    "lastName": "User",
    "userName": "testuser",
    "email": "test@example.com"
  }
}
```

**Important errors:** validation error, `409 DUPLICATE_ACCOUNT_FIELD`.

---

## Login

```http
POST /api/auth/login
```

Authenticates a user, creates a database session, returns an access token, and sets the refresh token cookie.

```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

**Success:** `200`

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "<jwt>",
  "user": {
    "id": "...",
    "firstName": "Test",
    "lastName": "User",
    "userName": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**Errors:** `401 INVALID_CREDENTIALS`, `403 ACCOUNT_SUSPENDED`.

---

## Refresh Access Token

```http
POST /api/auth/refresh
```

Reads the `refreshToken` cookie, validates the session, rotates the refresh token, and returns a new access token.

**Success:** `200`

```json
{
  "success": true,
  "message": "Access token refreshed",
  "accessToken": "<new_jwt>"
}
```

**Errors:** missing, expired, revoked, mismatched, or invalid refresh token; suspended or missing user.

---

## Logout

```http
POST /api/auth/logout
```

Revokes the matching refresh session if present and clears the refresh-token cookie.

**Success:** `200`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

# Current User

## Get Current User

```http
GET /api/auth/me
```

Requires Bearer token.

```json
{
  "success": true,
  "user": {
    "id": "...",
    "firstName": "Test",
    "lastName": "User",
    "userName": "testuser",
    "email": "test@example.com",
    "role": "user",
    "status": "active",
    "profileImage": {
      "url": null,
      "publicId": null
    }
  }
}
```

Possible auth errors include expired/invalid token, suspended account, missing user, or a token issued before the latest password change.

---

# Profile Image

## Upload / Replace

```http
PATCH /api/auth/me/profile-image
```

Requires Bearer token and `multipart/form-data`.

**Field**
```text
profileImage
```

Allowed: JPG, PNG, WEBP. Maximum size: **5 MB**.

**Success:** returns the Cloudinary `url` and `publicId`.

---

## Delete

```http
DELETE /api/auth/me/profile-image
```

Deletes the image from Cloudinary and resets profile image fields to `null`.

**Error:** `404 PROFILE_IMAGE_NOT_FOUND` when no image exists.

---

# Password Management

## Forgot Password

```http
POST /api/auth/forgot-password
```

```json
{
  "email": "test@example.com"
}
```

If the account exists, the API generates a random reset token, stores only its SHA-256 hash, gives it a **15-minute expiry**, and emails the reset link.

The response is intentionally generic:

```json
{
  "success": true,
  "message": "If an account exists for that email, a password reset link has been sent."
}
```

This prevents account enumeration.

---

## Reset Password

```http
POST /api/auth/reset-password/:token
```

```json
{
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

The API verifies the token, changes the password, clears reset fields, records the password-change time, and revokes active sessions.

**Success:** `200`

```json
{
  "success": true,
  "message": "Password reset successfully. Please log in again."
}
```

**Error:** `400 INVALID_RESET_TOKEN`.

---

## Change Password

```http
PATCH /api/auth/me/password
```

Requires Bearer token.

```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

The current password is verified, reuse of the same password is blocked, `passwordChangedAt` is updated, all refresh sessions are revoked, and the refresh cookie is cleared.

**Errors:** `401 INVALID_CURRENT_PASSWORD`, `400 SAME_PASSWORD`.

---

# Sessions

## Get Session History

```http
GET /api/auth/me/sessions
```

Returns all sessions belonging to the authenticated user, newest first.

A session contains:

```text
user
expiresAt
revokedAt
userAgent
ipAddress
createdAt
updatedAt
```

The refresh-token hash is hidden from normal query results.

---

## Revoke One Session

```http
DELETE /api/auth/me/sessions/:sessionId
```

Revokes one session belonging to the current user.

**Errors:** `400 INVALID_SESSION_ID`, `404 SESSION_NOT_FOUND`, `400 SESSION_ALREADY_REVOKED`.

---

## Revoke All Sessions

```http
DELETE /api/auth/me/sessions
```

Revokes every active refresh session for the current user and clears the refresh cookie.

---

# Admin / RBAC

All admin routes require:

```text
valid access token
+
role = admin
```

Normal users receive `403 FORBIDDEN`.

## List Users

```http
GET /api/admin/users
```

Supports:

```text
?page=1
&limit=10
&role=user
&status=active
&search=test
```

Search checks `firstName`, `lastName`, `userName`, and `email`.

Maximum page size: **100**.

---

## Get User

```http
GET /api/admin/users/:userId
```

Returns one user together with that user's session history.

**Errors:** `400 INVALID_USER_ID`, `404 USER_NOT_FOUND`.

---

## Change User Role

```http
PATCH /api/admin/users/:userId/role
```

```json
{
  "role": "admin"
}
```

Allowed roles:

```text
user
admin
```

An admin cannot remove their own admin role through this endpoint.

---

## Change User Status

```http
PATCH /api/admin/users/:userId/status
```

```json
{
  "status": "suspended"
}
```

Allowed statuses:

```text
active
suspended
```

Suspending a user also revokes their active sessions. An admin cannot suspend their own account.

---

## Revoke User Sessions

```http
DELETE /api/admin/users/:userId/sessions
```

Revokes all active sessions belonging to the selected user.

---

# Security Notes

The service uses:

- bcrypt password hashing
- Joi request validation
- short-lived JWT access tokens
- refresh-token rotation
- SHA-256 refresh-token storage
- HTTP-only refresh cookies
- database-backed sessions
- session revocation
- role-based access control
- account suspension
- password-reset token hashing
- password-change access-token invalidation
- rate limiting
- Helmet security headers
- environment variables for secrets
- Multer file filtering and size limits
- Cloudinary image storage

---

# Environment Variables

```env
PORT=2000
MONGO_URI=...

ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASSWORD=...
EMAIL_FROM=...

NODE_ENV=development
```

Never commit `.env`.

---

# Main User Model Fields

```text
firstName
lastName
userName
email
password
passwordChangedAt
passwordResetToken
passwordResetExpiresAt
profileImage
status
role
createdAt
updatedAt
```

Roles:

```text
user | admin
```

Statuses:

```text
active | suspended
```

---

# Main Session Fields

```text
user
refreshTokenHash
expiresAt
revokedAt
userAgent
ipAddress
createdAt
updatedAt
```

Expired sessions are automatically removed through MongoDB TTL indexing.

---

# Common Error Codes

```text
DUPLICATE_ACCOUNT_FIELD
INVALID_CREDENTIALS
ACCOUNT_SUSPENDED
ACCESS_TOKEN_REQUIRED
ACCESS_TOKEN_EXPIRED
INVALID_ACCESS_TOKEN
PASSWORD_RECENTLY_CHANGED
USER_NOT_FOUND
INVALID_RESET_TOKEN
EMAIL_SEND_FAILED
INVALID_CURRENT_PASSWORD
SAME_PASSWORD
INVALID_SESSION_ID
SESSION_NOT_FOUND
SESSION_ALREADY_REVOKED
FORBIDDEN
INVALID_USER_ID
INVALID_ROLE
INVALID_ACCOUNT_STATUS
SELF_ROLE_CHANGE_NOT_ALLOWED
SELF_SUSPENSION_NOT_ALLOWED
PROFILE_IMAGE_REQUIRED
PROFILE_IMAGE_NOT_FOUND
INVALID_IMAGE_TYPE
```