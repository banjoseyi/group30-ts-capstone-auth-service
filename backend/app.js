import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";

//Routes
import DataBase from "./src/config/database.js";
import UserRoutes from "./src/routes/UserRoutes.js"

dotenv.config();
const PORT = process.env.PORT || 2000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

//User
app.use("/api/auth", UserRoutes);

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
