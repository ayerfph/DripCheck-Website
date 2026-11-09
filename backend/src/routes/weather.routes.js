import express from "express";

import {
    getWeather
} from "../controllers/weather.controllers.js";

const router = express.Router();

// GET /api/weather?city=Manila
router.get("/", getWeather);

export default router;