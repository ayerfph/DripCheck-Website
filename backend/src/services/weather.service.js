import { config } from "../config/env.js";

const URL = "https://api.weatherstack.com/current";

export async function getCurrentWeather(city) {
    const params = new URLSearchParams({
        access_key: config.weatherstack,
        query: city,
        units: "m",
    });

    const url =`${URL}?${params}`;

    const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
        throw new Error(
            "Unable to connect to Weatherstack API"
        );
    }
    
    const data = await response.json();

    if (data.error) {
        const error = new Error(data.error.info);

        error.code = data.error.code;

        throw error;
    }

    return data;
}