# Authentication Flows

## 1. Registration Flow
User submits name, email, password
↓
Backend validates input
↓
Check if email already exists
↓
Hash password with bcrypt
↓
Save user to database (isVerified: false)
↓
Return success response

---

## 2. Login Flow
User submits email and password
↓
Backend validates input
↓
Find user by email
↓
Compare password with bcrypt
↓
If invalid → return 401
↓
Generate JWT access token (short expiry e.g. 11min)
↓
Generate refresh token (long expiry e.g. 7 days)
↓
Save refresh token to Tokens collection
↓
Return access token + refresh token

---

## 3. Protected Route Access Flow
User sends request with JWT in Authorization header
↓
Auth middleware extracts token
↓
Verify token signature and expiry
↓
If invalid/expired → return 401
↓
Attach user to request object
↓
Pass to controller

---

## 4. Token Refresh Flow
Access token expires
↓
User sends refresh token
↓
Backend finds token in Tokens collection
↓
Verify it hasn't expired
↓
Issue new access token
↓
Return new access token

---

## 5. Password Reset Flow
User submits email
↓
Backend finds user by email
↓
Generate reset token + expiry (1 hour)
↓
Save token to user document
↓
Send reset link to email (with token)
↓
User clicks link, submits new password
↓
Backend verifies token is valid and not expired
↓
Hash new password
↓
Save new password, clear reset token
↓
Return success

---

## 6. Role-Based Access Flow
User makes request to protected/admin route
↓
Auth middleware verifies JWT
↓
Role middleware checks user.role
↓
If role !== "admin" → return 403 Forbidden
↓
If role === "admin" → allow access

---

## Roles
| Role | Access Level |
|------|-------------|
| user | Own data only |
| admin | All users data + admin routes |