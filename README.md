# Group 30 Authentication Service

A full-stack authentication and user-management project built for the TS Academy capstone. It includes a Node.js + Express backend for authentication, session management, password recovery, and role-based admin controls, plus a React + Vite frontend for the user experience.

## Overview

This project provides a secure account system with:

- User registration and login
- JWT-based access and refresh tokens
- Refresh-token rotation with database-backed session tracking
- Password reset and change flows via email
- Profile image upload using Cloudinary
- Session management and revocation
- Admin user management and role/status controls
- Protected frontend routes and role-aware access

The backend exposes authenticated and public API routes under `/api/auth` and `/api/admin`, while the frontend consumes these endpoints and manages user state through React context.

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Joi for validation
- Helmet, CORS, rate limiting, and cookie parsing for security
- Nodemailer for reset emails
- Cloudinary + Multer for profile image uploads

### Frontend
- React
- Vite
- React Router DOM
- Axios
- Framer Motion
- Lucide React

## Repository Structure

```text
.
├── backend/
│   ├── app.js
│   ├── src/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── model/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── validator/
├── documentation/
│   ├── api/
│   ├── architecture/
│   ├── database/
│   ├── design-system/
│   └── user-flows/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.*
├── .gitignore
├── package.json
├── README.md
└── package-lock.json
```

## Features

### Authentication
- User registration with validation
- Login with password verification
- Access token issuance for API authorization
- Secure refresh-token cookies with rotation
- Logout and session invalidation
- Password reset email workflow
- Password change for authenticated users

### User Management
- View current authenticated user
- Manage profile information and avatar image
- Review active sessions
- Revoke individual sessions or all sessions

### Admin Features
- List users
- View user details
- Update user role
- Update user status
- Revoke a user’s active sessions

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=2000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=your_email@example.com
```

Note: for local frontend requests, the frontend app may also need its own `VITE_API_URL` setting in `frontend/.env` if you are using a custom API base URL.

## Getting Started

### 1) Install dependencies

From the project root:

```bash
npm install
```

Then install the frontend dependencies:

```bash
cd frontend
npm install
```

### 2) Start the backend

At the project root:

```bash
npm run dev
```

The API server runs on:

```text
http://localhost:2000
```

### 3) Start the frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend dev server typically runs on:

```text
http://localhost:5173
```

## API Overview

The backend exposes the main authentication and admin endpoints:

### Public Auth Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`

### Protected User Routes
- `GET /api/auth/me`
- `GET /api/auth/me/sessions`
- `PATCH /api/auth/me/password`
- `PATCH /api/auth/me/profile-image`
- `DELETE /api/auth/me/profile-image`
- `DELETE /api/auth/me/sessions/:sessionId`
- `DELETE /api/auth/me/sessions`

### Admin Routes
- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId/role`
- `PATCH /api/admin/users/:userId/status`
- `DELETE /api/admin/users/:userId/sessions`

More endpoint details and examples are available in the documentation folder, especially under `documentation/api/`.

## Documentation

This repository includes supporting documentation for:

- API structure and endpoints
- System architecture
- Database model and collections
- User flows
- Design system

See the `documentation/` directory for deeper project details.

## Notes

- Access tokens are short-lived.
- Refresh tokens are stored securely as HTTP-only cookies and tracked in the database.
- Refresh-token rotation is used to improve session security.
- Admin-only routes require an authenticated user with the correct role.

## License

This project is currently configured with the ISC license in the root package.json.
