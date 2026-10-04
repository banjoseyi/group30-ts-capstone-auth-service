import "dotenv/config";
import dns from "node:dns";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { swaggerUi, swaggerSpec } from "./src/swagger/swagger.js";

import DataBase from "./src/config/database.js";
import UserRoutes from "./src/routes/UserRoutes.js";
import AdminRoutes from "./src/routes/AdminRoutes.js";
import errorHandler from "./src/middleware/ErrorHandler.js";

const PORT = process.env.PORT || 2000;

const app = express();

// Middleware
app.use(helmet());

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Group 30 Authentication Service is running",
    });
});

// API routes
app.use("/api/auth", UserRoutes);
app.use("/api/admin", AdminRoutes);


app.use( "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
            persistAuthorization: true,
            withCredentials: true,
        },
    })
);

// Error handler must come after the routes
app.use(errorHandler);

// Local DNS workaround for MongoDB Atlas
if (process.env.NODE_ENV !== "production") {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

// Start server
const startServer = async () => {
    try {
        await DataBase.connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        server.on("error", (error) => {
            console.error("Server error:", error);
            process.exit(1);
        });
    } catch (err) {
        console.error("Server startup failed:", err);
        process.exit(1);
    }
};

startServer();