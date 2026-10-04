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

## UI/UX Design (Figma)

The application's user interface and experience were designed in Figma before development. I led the design process, from planning the application layout and user flows to creating the interface and translating the designs into the functional frontend.

**Design deliverables include:**

- User interface design and page layouts.
- Authentication screens and user flows.
- Reusable components and visual consistency.
- Responsive design considerations.
- Translation of Figma designs into the frontend implementation.

[View the Figma Design](https://www.figma.com/design/0eyCti9bOE5qWj7R0nzWcu/Group-30?node-id=1374-13133&t=6XwXBHCBRVvOU2wL-1)

**Design & implementation:** Oluwaseyifunmi Oluwatunmise Banjo, Lead Developer & UI/UX Designer.

## Project Team & Contributions

**TS Academy | Group 30 Capstone Project**

This project was developed as part of the TS Academy capstone program. While it was a group assignment, the core technical implementation was independently completed by the lead developer, with support from team members through collaborative coding and knowledge-sharing sessions.

### Lead Developer & Project Architect

**Oluwaseyifunmi Oluwatunmise Banjo**  
*Full-Stack Developer | Backend Engineer | UI/UX Designer*

Responsible for the end-to-end technical development and delivery of the project, including:

- Designing the application's UI/UX using Figma.
- Developing the frontend and integrating it with the backend.
- Architecting and implementing the RESTful API using Node.js and Express.
- Implementing authentication, authorization, password recovery, role-based access control, and session management.
- Integrating MongoDB and third-party services.
- Creating Swagger/OpenAPI documentation.
- Managing version control, testing, and production deployment on Render and Vercel.
- Leading collaborative coding sessions and explaining implementation decisions to team members.

### Technical Collaborators

**Chidozie Jesson Emeribe**<br>
*Technical Contributor | Collaborative Development & Knowledge Sharing*

**Hameedah Omojoju Adamo**<br>
*Technical Contributor | Collaborative Development & Knowledge Sharing*

The collaborators participated in coding sessions, implementation discussions, and knowledge-sharing activities during selected stages of development.

### Teamwork & Project Delivery

The project combined independent technical ownership with collaborative learning and team engagement. As lead developer, I managed the implementation while facilitating development sessions to share technical knowledge and encourage team participation.

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
