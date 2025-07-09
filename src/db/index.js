import mongoose  from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const dbUri = process.env.MONGODB_URI;
        const connectionInstance = await mongoose.connect(`${dbUri}/${DB_NAME}`);

        console.log('Database connected successfully at: ', connectionInstance.connection.host);
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectDB;