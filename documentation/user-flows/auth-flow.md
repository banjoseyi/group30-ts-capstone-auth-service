# Authentication User Flow

## Registration

```text
User submits registration details
        ↓
Joi validates input
        ↓
Email and userName checked for duplicates
        ↓
Password hashed with bcrypt
        ↓
User saved in MongoDB
        ↓
Account created
```

New users are created with:

```text
role: user
status: active
```

---

## Login

```text
User submits email and password
        ↓
Credentials validated
        ↓
Password compared with stored hash
        ↓
Access token created
        ↓
Refresh token created
        ↓
Refresh token hash stored in Session
        ↓
Refresh token saved as HttpOnly cookie
        ↓
Access token returned
```

---

## Protected Request

```text
Client sends Bearer access token
        ↓
Token verified
        ↓
User loaded from database
        ↓
Account status checked
        ↓
Password-change time checked
        ↓
Request allowed
```

---

## Token Refresh

```text
Refresh cookie received
        ↓
Refresh token verified
        ↓
Session found and validated
        ↓
Stored hash compared
        ↓
New access token created
        ↓
Refresh token rotated
        ↓
Session updated
```

---

## Logout

```text
Refresh token received
        ↓
Matching session revoked
        ↓
Refresh cookie cleared
```

---

## Forgot Password

```text
User submits email
        ↓
Reset token generated
        ↓
Token hash stored with 15-minute expiry
        ↓
Reset link sent by email
```

The response remains generic whether or not the email exists.

---

## Reset Password

```text
User submits reset token + new password
        ↓
Token hash verified
        ↓
Password changed
        ↓
Reset fields cleared
        ↓
passwordChangedAt updated
        ↓
All active sessions revoked
```

---

## Change Password

```text
Authenticated user submits current password
        ↓
Current password verified
        ↓
New password validated
        ↓
Password changed
        ↓
passwordChangedAt updated
        ↓
All sessions revoked
        ↓
User logs in again
```

---

## Session Management

Users can:

```text
View session history
Revoke one session
Revoke all sessions
```

Sessions store device information, IP address, expiration, and revocation status.

---

## Admin Flow

```text
Admin logs in
        ↓
Access token verified
        ↓
Role checked
        ↓
Admin route allowed
```

Admins can:

```text
View users
View user details
Change user roles
Suspend/reactivate accounts
Revoke user sessions
```

Normal users receive `403 FORBIDDEN` on admin routes.
