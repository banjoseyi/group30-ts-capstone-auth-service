# Database Collections

The authentication service uses two main MongoDB collections.

## Users Collection

Stores account and security information.

Main fields:

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

Important rules:

- `email` is unique.
- `userName` is unique.
- passwords are hashed with bcrypt.
- password and reset-token fields are hidden from normal queries.
- `role` is either `user` or `admin`.
- `status` is either `active` or `suspended`.

---

## Sessions Collection

Stores refresh-token sessions created during login.

Main fields:

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

Important rules:

- `user` references the User collection.
- raw refresh tokens are never stored.
- only the SHA-256 token hash is stored.
- `revokedAt` marks a session as inactive.
- expired sessions are automatically removed using a TTL index on `expiresAt`.

---

## Relationship

```text
User
  │
  └── has many Sessions
```

A single user can have multiple active sessions from different devices or browsers.
