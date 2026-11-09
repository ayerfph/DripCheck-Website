import { MongoClient } from "mongodb";
import { config } from "./env.js";

const client = new MongoClient(config.mongodbUri);

let database;
let connectionPromise;

export async function connectToDatabase() {
    if (database) {
        return database;
    }

    if (!connectionPromise) {
        connectionPromise = client.connect();
    }

    await connectionPromise;

    database = client.db(config.mongodbDatabase);

    await database.collection("weather_searches").createIndex({
        searchedCity: 1,
        createdAt: -1,
    });

    console.log("Connected to MongoDB.");
    return database;
}

export function weatherCollection() {
    if (!database) {
        throw new Error("MongoDB has not been connected.");
    }

    return database.collection("weather_searches");
}