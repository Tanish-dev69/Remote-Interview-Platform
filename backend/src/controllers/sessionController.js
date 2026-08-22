import { chatClient, streamClient } from "../lib/stream.js";
import Session from '../models/Session.js';

export async function createSession(req, res) {
    try {
        const { problem, difficulty } = req.body;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        if (!problem || !difficulty) {
            return res.status(400).json({ message: "Problem and difficulty are required" });
        }

        // Generate a unique call id for stream video
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Create session in database
        const session = await Session.create({ problem, difficulty, host: userId, callId });

        // Create stream video call
        await streamClient.video.call("default", callId).getOrCreate({
            data: {
                created_by_id: clerkId, // Fixed casing to match Stream's standard
                custom: { problem, difficulty, sessionId: session._id.toString() }
            },
        });

        // Chat messaging setup
        const chatChannel = chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId]
        });

        // Fixed: changed 'channel' to 'chatChannel' to match the variable above
        await chatChannel.create();

        res.status(201).json({ message: "Session created successfully", session });
    } catch (error) {
        console.error("Error creating session:", error.message);
        res.status(500).json({ message: "Failed to create session" });
    }
}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({ status: "active" })
            .populate("host", "name profileImage email clerkId")
            .sort({ createdAt: -1 });

        // 💉 Wrap it in 'data' so the frontend sessionApi can read it
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error("Error fetching active sessions:", error.message);
        res.status(500).json({ message: "Failed to fetch active sessions" });
    }
}

export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id;

        // Fixed: changed 'participants' to 'participant' to match your Session.js schema
        const sessions = await Session.find({
            status: "completed",
            $or: [{ host: userId }, { participant: userId }]
        })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error("Error fetching recent sessions:", error.message);
        res.status(500).json({ message: "Failed to fetch recent sessions" });
    }
}

export async function getSessionById(req, res) {
    try {
        // Fixed: changed 'parms' to 'params'
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await Session.findById(id)
            .populate("host", "name profileImage email clerkId")
            // Fixed: changed 'participants' to 'participant' (singular) to match your schema
            .populate("participant", "name profileImage email clerkId");

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.status(200).json({ session });
    } catch (error) {
        console.error("Error fetching session by id:", error.message);
        res.status(500).json({ message: "Failed to fetch session" });
    }
}

export async function joinSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.status !== "active") {
            return res.status(400).json({ message: "Cannot join a completed session" });
        }

        if (session.host.toString() === userId.toString()) {
            return res.status(400).json({ message: "Host cannot join their own session as participant" });
        }

        // Check if session is already full
        if (session.participant) {
            return res.status(409).json({ message: "Session is already full" });
        }

        session.participant = userId;
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({ message: "Joined session successfully", session });
    } catch (error) {
        console.error("Error joining session:", error.message);
        res.status(500).json({ message: "Failed to join session" });
    }
}

export async function endSession(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Check if user is host
        if (session.host.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the host can end the session" });
        }

        // Check if session is already completed
        if (session.status === "completed") {
            return res.status(400).json({ message: "Session is already completed" });
        }

        // Delete stream video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete({ hard: true });

        // Delete chat channel
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();

        session.status = "completed";
        await session.save();

        res.status(200).json({ message: "Session ended successfully", session });
    } catch (error) {
        console.error("Error ending session:", error.message);
        res.status(500).json({ message: "Failed to end session" });
    }
}