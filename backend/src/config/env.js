import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    weatherstack: process.env.WEATHERSTACK,
    frontendUrl: process.env.FRONTEND || "http://localhost:5173",
    mongodbUri: process.env.MONGODB_URI,
    mongodbDatabase: process.env.MONGODB_DATABASE || "weather_app",
};

if (!config.weatherstack) {
    throw new Error("Weatherstack API key is missing.");
}

if (!config.mongodbUri) {
    throw new Error("MONGODB_URI is missing.");
}