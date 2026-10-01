# System Architecture

## Overview
The Group 30 Authentication Service is a layered REST API built with Node.js, Express, MongoDB, and Mongoose.
It separates routing, validation, authentication, authorization, controller logic, database access, and external services.

## High-Level Flow
```text
Client / Frontend
        ↓
Express Routes
        ↓
Rate Limiting
        ↓
Validation
        ↓
Authentication
        ↓
Authorization
        ↓
Controllers
        ↓
Models / Utilities
        ↓
MongoDB / Cloudinary / Email
```
Public routes such as registration and login skip authentication. Admin routes require authentication and admin authorization.

## Route Layer
Main route groups:
```text
/api/auth
/api/admin
```
Examples:
```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
GET  /api/admin/users
```
Routes connect requests to middleware and controllers.

## Validation Layer
Joi validates request data before controller logic runs.
It covers registration, login, forgot/reset password, change password, role updates, and account status updates.
Invalid requests are rejected before database operations.

## Authentication Layer
Protected routes use JWT access tokens.
The authentication middleware:
1. Reads the Bearer token.
2. Verifies the token signature.
3. Checks issuer and audience.
4. Finds the user in MongoDB.
5. Rejects missing or suspended users.
6. Rejects tokens issued before the latest password change.
7. Adds the user to `req.user`.
Access tokens expire after 15 minutes.

## Authorization Layer
Supported roles:
```text
user
admin
```
Admin routes use:
```text
protect
+
allowRoles("admin")
```
This prevents normal users from accessing administrative operations.

## Controller Layer
### UserController
Handles registration, login, logout, token refresh, current user profile, profile images, forgot/reset password, change password, session history, and session revocation.
### AdminController
Handles user listing, user details, role changes, account suspension/reactivation, and session revocation.

## Database Layer
MongoDB is accessed through Mongoose.
Main collections:
```text
users
sessions
```
### User Collection
Stores:
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
### Session Collection
Stores:
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
Expired sessions are automatically removed with a MongoDB TTL index.

## Login Flow
```text
Email + password submitted
        ↓
Input validated
        ↓
User found
        ↓
Password checked with bcrypt
        ↓
Access token created
        ↓
Refresh token created
        ↓
Refresh token hashed
        ↓
Session saved in MongoDB
        ↓
Refresh token stored in HttpOnly cookie
        ↓
Access token returned
```

## Token Design
### Access Token
```text
Purpose: protected API requests
Lifetime: 15 minutes
Transport: Authorization header
```
Example:
```http
Authorization: Bearer <access_token>
```
### Refresh Token
```text
Purpose: obtain new access tokens
Lifetime: 7 days
Storage: HttpOnly cookie
Database: SHA-256 hash only
```
Refresh tokens are rotated after successful refresh requests.

## Password Security
Passwords are hashed with bcrypt before storage.
Password-reset tokens are securely generated, hashed with SHA-256 before database storage, and expire after 15 minutes.
Reset flow:
```text
Forgot-password request
        ↓
Reset token generated
        ↓
Token hash stored
        ↓
Reset link emailed
        ↓
Token verified
        ↓
Password changed
        ↓
Sessions revoked
```
Password changes update `passwordChangedAt`, allowing older access tokens to be rejected immediately.

## Session Management
Each successful login creates a database session.
Sessions are revoked on logout, password change, password reset, account suspension, manual session removal, or admin revocation.
This provides control over refresh-token access and active devices.

## Profile Image Flow
```text
Image uploaded
        ↓
Multer validates type and size
        ↓
Image stored temporarily in memory
        ↓
Cloudinary upload
        ↓
URL and publicId returned
        ↓
Values saved in User document
```
Allowed formats: JPG, PNG, WEBP.
Maximum size: 5 MB.
MongoDB stores only the Cloudinary URL and public ID.

## Email Service
Nodemailer sends password-reset emails through SMTP.
```text
Forgot-password request
        ↓
Reset URL created
        ↓
Email sent
        ↓
User opens reset link
```
Email credentials are stored in environment variables.

## Error Handling
Errors are passed to centralized error middleware.
Typical response:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```
This keeps error responses consistent.

## Security Controls
- bcrypt password hashing
- JWT authentication
- short-lived access tokens
- refresh-token rotation
- HttpOnly cookies
- hashed refresh tokens
- database-backed sessions
- role-based access control
- Joi validation
- rate limiting
- Helmet security headers
- account suspension
- password reset expiry
- access-token invalidation after password change
- environment-variable secret storage
- image type and size validation

## External Services
```text
MongoDB → User and session storage
Cloudinary → Profile image storage
Nodemailer / Gmail SMTP → Password reset email delivery
```

## Architecture Summary
```text
Frontend
   ↓
Express API
   ↓
Validation / Rate Limiting
   ↓
Authentication / Authorization
   ↓
Controllers
   ↓
Mongoose Models
   ↓
MongoDB

Cloudinary → Profile Images
Nodemailer → Password Reset Email
```
The architecture keeps authentication, authorization, sessions, user management, and external services separated through clear application layers.