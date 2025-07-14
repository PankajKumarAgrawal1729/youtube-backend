// require("dotenv").config({path : './env'}); // Load environment variables from .env file

import dotenv from "dotenv";
import connectDB from "./db/index.js"; // Import the connectDB function
import { app } from "./app.js";

app.on("error", (error) => {
  console.error("Error occurred:", error);
  throw error; // Re-throw the error to be caught by the outer catch block
});
app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running at PORT : ${process.env.PORT}`);
});
// dotenv.config({ path: "./env" }); // Load environment variables from .env file
// connectDB()
//   .then(() => {
//     app.on("error", (error) => {
//       console.error("Error occurred:", error);
//       throw error; // Re-throw the error to be caught by the outer catch block
//     });
//     app.listen(process.env.PORT || 8000, () => {
//       console.log(`Server is running at PORT : ${process.env.PORT}`);
//     });
//     console.log("Database connection established successfully");
//   })
//   .catch((error) => {
//     console.error("Failed to connect to the mongo database:", error);
//     process.exit(1); // Exit the process with failure
//   });

/*
import mongoose  from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";

const app = express();

;(async () => {
    try {
        const dbUri = process.env.MONGODB_URI;
        await mongoose.connect(`${dbUri}/${DB_NAME}`);
        app.on('error', (error) => {
            console.error('Error occurred:', error);
            throw error; // Re-throw the error to be caught by the outer catch block
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
        console.log('Database connected successfully');
    }catch (error) {
        console.error('Database connection failed:', error);
        throw error; // Re-throw the error to be caught by the outer catch block
        process.exit(1); // Exit the process with failure
    }
})();  // IIFE to avoid top-level await
*/
