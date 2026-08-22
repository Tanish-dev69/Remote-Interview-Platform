import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios"; 
import { serve } from "inngest/express";
import { clerkMiddleware } from '@clerk/express';

import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import clerkWebhook from "./routes/clerkWebhook.js";
import { PROBLEMS } from "./data/problems.js";

dotenv.config();

const app = express();

// 1. Clerk Middleware
app.use(clerkMiddleware());

// 2. Body Parser
app.use(express.json());


console.log("Current Token in memory:", process.env.GLOT_TOKEN);

// 3. Hardened CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://remote-interview-platform-1-xh21.onrender.com" // Production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS policy violation"), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// --- UPDATED: Code Execution Route (The "Judge" Bridge) ---
app.post("/api/execute", async (req, res) => {
  const { language, code, problemId } = req.body;
  const GLOT_TOKEN = process.env.GLOT_TOKEN; 

  if (!language || !code || !problemId) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const problem = PROBLEMS[problemId];
  if (!problem) {
    return res.status(404).json({ success: false, error: "Problem definition not found." });
  }

  // 1. Wrap user code with the hidden test runner
  const finalCode = `${code}\n${problem.testRunner[language.toLowerCase()]}`;

  try {
    const response = await axios.post(
      `https://glot.io/api/run/${language.toLowerCase()}/latest`,
      {
        files: [
          {
            name: language.toLowerCase() === "java" ? "Main.java" : "main",
            content: finalCode,
          },
        ],
      },
      {
        headers: {
          Authorization: "Token " + GLOT_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const stdout = response.data.stdout || "";
    const stderr = response.data.stderr || response.data.error || "";

    // 2. Parse results (e.g., CASE_0:PASS)
    const testResults = stdout
      .split("\n")
      .filter((line) => line.startsWith("CASE_"))
      .map((line) => {
        const [id, status] = line.split(":");
        return { id, passed: status === "PASS" };
      });

    res.json({
      success: stderr === "",
      testResults, // Array of pass/fail
      output: stdout,
      error: stderr,
    });
  } catch (error) {
    console.error("Judge execution error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "The code runner encountered an internal error.",
    });
  }
  console.log("Creating session:", req.body);
  res.status(201).json({ success: true, roomId: "some-unique-id" });
});

// 4. API Routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/webhooks", clerkWebhook); 
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

// Health check endpoint for uptime monitors / deployments
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is healthy",
    service: "remote-interview-platform",
    timestamp: new Date().toISOString()
  });
});

// --- GET All Problems (Optional but recommended for your Dashboard) ---
app.get("/api/problems", (req, res) => {
  const problemsList = Object.values(PROBLEMS).map(({ testRunner, starterCode, ...publicData }) => publicData);
  res.json({ success: true, data: problemsList });
});

// --- GET Problem Details ---
app.get("/api/problems/:id", (req, res) => {
  const { id } = req.params;
  const problem = PROBLEMS[id];

  if (!problem) {
    return res.status(404).json({ success: false, error: "Problem not found" });
  }

  // SECURITY: Extract only the data the user needs to see.
  // We exclude 'testRunner' so users can't see the hidden test logic in the network tab.
  const { testRunner, ...publicData } = problem;

  res.json({
    success: true,
    data: publicData
  });
});

// 5. Basic Health & Root Routes 
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InterCode API | System Status</title>
        <style>
            :root {
                --primary: #10b981;
                --bg: #0f172a;
                --surface: #1e293b;
                --text: #f8fafc;
            }
            body {
                background-color: var(--bg);
                color: var(--text);
                font-family: 'Fira Code', 'Courier New', monospace;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                overflow: hidden;
            }
            .terminal {
                background: var(--surface);
                padding: 2.5rem;
                border-radius: 1rem;
                border: 1px solid #334155;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.1);
                max-width: 500px;
                width: 90%;
                position: relative;
            }
            .header-dots {
                display: flex;
                gap: 8px;
                position: absolute;
                top: 15px;
                left: 15px;
            }
            .dot-red { background: #ef4444; width: 12px; height: 12px; border-radius: 50%; }
            .dot-yellow { background: #f59e0b; width: 12px; height: 12px; border-radius: 50%; }
            .dot-green { background: #10b981; width: 12px; height: 12px; border-radius: 50%; }

            h1 {
                font-size: 1.8rem;
                margin: 0 0 1rem 0;
                color: var(--primary);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .status-line {
                margin-bottom: 1.5rem;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .pulse {
                width: 10px;
                height: 10px;
                background: var(--primary);
                border-radius: 50%;
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                animation: pulse-green 2s infinite;
            }
            .stats {
                color: #94a3b8;
                font-size: 0.9rem;
                line-height: 1.6;
                border-top: 1px solid #334155;
                padding-top: 1.5rem;
            }
            .footer-btn {
                margin-top: 2rem;
                display: inline-block;
                padding: 10px 20px;
                background: #10b9811a;
                border: 1px solid var(--primary);
                color: var(--primary);
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .footer-btn:hover {
                background: var(--primary);
                color: var(--bg);
            }

            @keyframes pulse-green {
                0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }
        </style>
    </head>
    <body>
        <div class="terminal">
            <div class="header-dots">
                <div class="dot-red"></div>
                <div class="dot-yellow"></div>
                <div class="dot-green"></div>
            </div>
            <h1>InterCode Backend</h1>
            <div class="status-line">
                <div class="pulse"></div>
                <span>SYSTEM ONLINE</span>
            </div>
            <div class="stats">
                > Initializing Database... Connected<br>
                > Port: ${process.env.PORT || 8080}<br>
                > Origin: Authorized ✅<br>
                > Status: 200 OK
            </div>
            <a href="https://remote-interview-platform-1-xh21.onrender.com" class="footer-btn">Launch Frontend</a>
        </div>
    </body>
    </html>
  `);
});

// 6. Database Connection & Server Start
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("💥 Failed to start server:", error.message);
    process.exit(1); 
  }
};

startServer();