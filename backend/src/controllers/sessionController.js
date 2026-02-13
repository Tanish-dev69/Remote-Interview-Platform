import { chatClient , streamClient } from "../lib/stream.js";
import Session from '../models/Session.js';
export async function createSession(req, res) {
    try{
        const { problem, difficulty } = req.body;   
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        if(!problem || !difficulty) {
            return res.status(400).json({ message: "Problem and difficulty are required" });
        }

        // generate a unique call id for stream video
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // create session in database
        const session = await Session.create({problem, difficulty, host: userId, callId});

        // create stream video call
        await streamClient.video.call("default", callId).getOrCreate({
            data: {
                created_By_id: clerkId,
                custom: {problem, difficulty, sessionId: session._id.toString()}
            },
        });

        //chat messaging
        const chatChannel = chatClient.channel("messaging", callId, {
            name: `${problem} Session`,
            created_by_id: clerkId,
            members: [clerkId]
        })
        
        await channel.create();
        
        res.status(201).json({ message: "Session created successfully", session});
    } catch (error) {
        console.log("Error creating session:", error.message);
        res.status(500).json({ message: "Failed to create session" });
    }    
}

export async function getActiveSessions(_, res) {
    try {
        const sessions = await Session.find({status: "active"})
        .populate("host", "name profileImage email clerkId")
        .sort({ createdAt: -1 })
        .limit(20);

        res.status(200).json({ sessions });
    } catch (error) {
        console.log("Error fetching active sessions:", error.message);
        res.status(500).json({ message: "Failed to fetch active sessions" });
    }
}

export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user._id;

        //get sessions where user is either host or participant
        const sessions = await Session.find({
            status:"completed",
            $or: [{host: userId}, {participants: userId}]
        })
        .sort({ createdAt: -1 })
        .limit(20);

        res.status(200).json({ sessions });
    } catch (error) {
        console.log("Error fetching recent sessions:", error.message);
        res.status(500).json({ message: "Failed to fetch recent sessions" });
    }
}

export async function getSessionById(req, res) {
    try {
        const {id} = req.parms;

        const session = await Session.findById(id)
        .populate("host", "name profileImage email clerkId")
        .populate("participants", "name profileImage email clerkId");

        if(!session) {
            return res.status(404).json({ message: "Session not found" });
        } 
        res.status(200).json({ session });
    } catch (error) {
        console.log("Error fetching session by id:", error.message);
        res.status(500).json({ message: "Failed to fetch session" });
    }
}

export async function joinSession(req, res) {
    try {
        const {id} = req.params;
        const userId = req.user._id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id);

        if(!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        //check if session is already full - has a participant
        if(session.participant) return res.status(400).json({ message: "Session is already full" });

        session.participant = userId;
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({ message: "Joined session successfully", session });
    } catch (error) {
        console.log("Error joining session:", error.message);
        res.status(500).json({ message: "Failed to join session" });
    }
}

export async function endSession(req, res) {
    try {
        const {id} = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id);

        if(!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        //check if user is host
        if(session.host.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the host can end the session" });
        }

        //check if session is already completed
        if(session.status === "completed") {
            return res.status(400).json({ message: "Session is already completed" });
        }

        session.status = "completed";
        await session.save();


        //delete stream video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete({hard: true});

        //delete chat channel
        const channel = chatClient.channel("messaging", session.callId);
        await channel.delete();

        res.status(200).json({ message: "Session ended successfully", session });
    } catch (error) {
        console.log("Error ending session:", error.message);
        res.status(500).json({ message: "Failed to end session" });
    }
}