import { requireAuth } from '@clerk/express'
import User from '../models/User.js'

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const userId = req.auth().userId;
            
            if(!clerkId) return res.status(401).json({ message: "Unauthorized - invalid token" });
            
            // find the user in the database using the clerkId
            const user = await User.findOne({ clerkId});

            if(!user) return res.status(404).json({ message: "Unauthorized - user not found" });

            //attach user to request
            req.user = user;

            next();

        } catch (error) {
            console.error("Error in protectRoute middleware:", error);
            res.status(500).json({ message: "Internal server error" });

        }
    },
];
