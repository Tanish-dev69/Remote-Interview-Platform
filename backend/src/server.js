import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";

import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

import { inngest, functions } from "./lib/inngest.js";

dotenv.config();

const app = express();

//middleware
app.use(express.json());
// credentials: true allows cookies to be sent in cross-origin requests, which is necessary for authentication and session management when the frontend and backend are on different domains or ports.
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({client:inngest, functions}));


// API routes
app.get("/health", (req, res) => {
  res.json({ message: "api is up and running" });
});

app.get("/books", (req, res) => {
  res.json({ message: "this is the books endpoint" });
});

// SERVE FRONTEND (CORRECT FOR MONOREPO)
const clientDistPath = path.resolve("..", "frontend", "dist");
app.use(express.static(clientDistPath));


//SPA fallback route to serve index.html for any unmatched routes (for client-side routing)
app.use((req, res) => {
  res.sendFile(path.resolve(clientDistPath, "index.html"));
});



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