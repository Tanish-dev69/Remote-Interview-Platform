import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        if(!process.env.DB_URL) {
            throw new Error("DB_URL is not defined in environment variables");
        }
        const connection = await mongoose.connect(process.env.DB_URL); 
        console.log("✅ Connected to MongoDB successfully", connection.connection.host);
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1); // 0 means success, 1 means failure
    }
};