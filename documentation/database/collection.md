# Database Collections

## 1. Users
Stores all registered users.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Unique identifier |
| name | String | Yes | Full name |
| email | String | Yes | Unique email address |
| password | String | Yes | Hashed password |
| role | String | Yes | "user" or "admin" |
| resetPasswordToken | String | No | Token for password reset |
| resetPasswordExpires | Date | No | Token expiry time |
| createdAt | Date | auto | Timestamp |
| updatedAt | Date | auto | Timestamp |

---

## 2. Tokens (Refresh Tokens)
Stores refresh tokens for maintaining sessions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Unique identifier |
| userId | ObjectId | Yes | Ref → Users |
| token | String | Yes | Refresh token string |
| expiresAt | Date | Yes | Token expiry time |
| createdAt | Date | auto | Timestamp |

---

## Relationships
- One User → Many Tokens (one per session/device)

## Example User Document
{
  "_id": "64b1f1c2e4b0a1c2d3e4f5a6",
  "name": "Authentication Group30",
  "email": "group30@email.com",
  "password": "$2b$10$hashedpassword",
  "role": "user",
  "resetPasswordToken": null,
  "resetPasswordExpires": null,
  "createdAt": "2026-09-20T10:00:00Z",
  "updatedAt": "2026-09-20T10:00:00Z"
}