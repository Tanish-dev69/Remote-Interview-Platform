import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET is MISSING");
}

export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData) => {
    try {
        await chatClient.upsertUser(userData);
        console.log("✅ Stream user upserted successfully.", userData);
    } catch (error) {
        console.error("Error upserting Stream user:", error);
        throw error;
    }
};

export const deleteStreamUser = async (userData) => {
    try {
        await chatClient.deleteUser(userData);
        console.log("✅ Stream user deleted successfully.", userData.id);
    } catch (error) {
        console.error("❌ Error deleting Stream user:", error);
    }
};

//todo:add another method to generate token for a user, which can be used in frontend to connect to stream client. This method will be called in auth controller after user is created or logged in.