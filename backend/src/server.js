import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import clerkWebhook from "./routes/clerkWebhook.js";
import { clerkMiddleware } from '@clerk/express';

import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

dotenv.config();

const app = express();

//middleware
app.use(express.json());
// credentials: true allows cookies to be sent in cross-origin requests, which is necessary for authentication and session management when the frontend and backend are on different domains or ports.
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(clerkMiddleware()); // this adds auth failed to req object: req.auth();

app.use("/api/inngest", serve({client: inngest, functions}));
app.use("/api/webhooks", clerkWebhook);
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);


app.post("/api/webhooks/clerk", async (req, res) => {
  try {
    const evt = req.body;

    await inngest.send({
      name: evt.type,
      data: evt.data,
    });

    res.status(200).send("ok");
  } catch (e) {
    console.error(e);
    res.status(500).send("error");
  }
});


// API routes
app.get("/health", (req, res) => {
  res.json({ message: "api is up and running" });
});


// // SERVE FRONTEND (CORRECT FOR MONOREPO)
// const clientDistPath = path.resolve("..", "frontend", "dist");
// app.use(express.static(clientDistPath));


// //SPA fallback route to serve index.html for any unmatched routes (for client-side routing)
// app.use((req, res) => {
//   res.sendFile(path.resolve(clientDistPath, "index.html"));
// });



// Start the server after connecting to the database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 8080, () => {
      console.log("Server is running on port:", process.env.PORT || 8080); 
});
  } catch (error) {
    console.error("💥 Failed to start server:", error)
  }
};


startServer();