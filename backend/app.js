import "dotenv/config";

import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import DataBase from "./src/config/database.js";
import UserRoutes from "./src/routes/UserRoutes.js";
import errorHandler from "./src/middleware/ErrorHandler.js";


const PORT = process.env.PORT || 2000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use("/api/auth", UserRoutes);

// Always after routes
app.use(errorHandler);

const startServer = async () => {
    try {
        await DataBase.connectDB();

        const server = app.listen(PORT, () => {
            console.log(`App listening at http://localhost:${PORT}`);
        });

        server.on("error", (error) => {
            console.error("Server error:", error);
        });

    } catch (err) {
        console.error(err);
    }
};

startServer();