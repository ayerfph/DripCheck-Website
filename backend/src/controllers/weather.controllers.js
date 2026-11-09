import {
    getCurrentWeather,
} from "../services/weather.service.js";

import {
    weatherCollection,
} from "../config/database.js";

export async function getWeather(req, res, next) {
    try {
        const city = req.query.city?.trim();

        if (!city) {
            return res.status(400).json({
                success: false,
                message: "City is required.",
            });
        }

        if (city.length > 100) {
            return res.status(400).json({
                success: false,
                message: "City name is too long.",
            });
        }

        const weatherData = await getCurrentWeather(city);

        await weatherCollection().insertOne({
            searchedCity: city,
            weather: weatherData,
            createdAt: new Date(),
        });

        return res.status(200).json({
            success: true,
            data: weatherData,
        });
    } catch (error) {
        next(error);
    }
}