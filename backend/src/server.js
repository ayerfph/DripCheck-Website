import express from "express";
import cors from "cors";

import { config } from "./config/env.js";
import { connectToDatabase } from "./config/database.js";
import weatherRoutes from "./routes/weather.routes.js";

const app = express();

app.use(express.json());

app.use(cors({
    origin: config.frontendUrl,
}));

app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        next(error);
    }
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Weather API is running.",
    });
});

app.use("/api/weather", weatherRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found.",
    });
});

app.use((err, req, res, next) => {
    console.error("API Error:", err);

    res.status(500).json({
        success: false,
        message: "Unable to process weather request.",
    });
});

export default app;

if (!process.env.VERCEL) {
    try {
        await connectToDatabase();

        app.listen(config.port, () => {
            console.log(`Weather API running on port ${config.port}`);
        });
    } catch (error) {
        console.error("Unable to start server:", error);
        process.exitCode = 1;
    }
}