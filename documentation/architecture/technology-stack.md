# Technology Stack

The Group 30 Authentication Service is a full-stack TS Academy capstone project. It includes a React frontend, an Express REST API, a MongoDB database, and supporting services for authentication, email delivery, and profile-image storage.

## Frontend

- **React** — Component-based user interface for the public pages, authenticated dashboard, profile, security, sessions, and administration screens.
- **Vite** — Frontend development server and production build tool.
- **JavaScript (JSX)** — Frontend application logic and React component markup.
- **React Router DOM** — Client-side routing, navigation, protected routes, and role-aware page access.
- **Axios** — HTTP requests to the Express REST API, including credentialed requests and access-token refresh handling.
- **React Context API** — Shared authentication state, current-user information, and session initialization through the application's authentication context.
- **Custom CSS** — Application styling, layout, component states, and responsive desktop, tablet, and mobile presentation.
- **Lucide React** — Icons used throughout navigation, forms, dashboard cards, and account-management interfaces.
- **ESLint** — Frontend linting and code-quality checks.

### Frontend and API Integration

The frontend consumes the backend's `/api/auth` and `/api/admin` endpoints. Access tokens are held in application memory, while refresh tokens are handled by the backend in an HttpOnly cookie. Axios sends credentialed requests where required and handles access-token renewal. Protected frontend routes control navigation, while the backend remains responsible for enforcing authentication and authorization.

The API base URL is configured through Vite's `VITE_API_URL` environment variable. For local development, the project uses:

```env
VITE_API_URL=http://localhost:2000/api
```

Environment-specific values should be configured separately for deployment; no secrets should be committed to the repository or placed in public `VITE_` variables.

## Backend

- **Node.js** — JavaScript runtime.
- **Express.js** — REST API framework.
- **MongoDB** — Primary database, with MongoDB Atlas used for hosted database access.
- **Mongoose** — MongoDB object modeling.

## Security & Authentication

- **JWT** — Access and refresh tokens.
- **bcrypt** — Password hashing.
- **Joi** — Request validation.
- **Helmet** — Security headers.
- **Express Rate Limit** — Request throttling.
- **Cookie Parser** — Refresh-token cookie handling.

The backend uses short-lived access tokens, database-backed refresh sessions, refresh-token rotation, password-reset tokens, session revocation, and role-based access control.

## External Services

- **Cloudinary** — Profile image storage.
- **Multer** — Image upload handling.
- **Nodemailer / Gmail SMTP** — Password-reset email delivery.
- **MongoDB Atlas** — Hosted MongoDB database deployment.

## Development & Design Tools

- **Figma** — Frontend design and screen references.
- **Postman** — API testing.
- **Git & GitHub** — Version control and collaboration.
- **dotenv** — Backend environment-variable management.
- **npm** — Package management and project scripts.

## Frontend Quality Checks

From the `frontend` directory, the application can be checked with:

```bash
npm run lint
npm run build
```

The production frontend is built by Vite into the `dist` directory. Backend and frontend deployments should use separate, securely configured environment variables.
