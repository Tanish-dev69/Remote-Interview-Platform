import express from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// API routes
app.get("/health", (req, res) => {
  res.json({ message: "api is up and running" });
});

app.get("/books", (req, res) => {
  res.json({ message: "this is the books endpoint" });
});

//Fixed frontend path
const clientDistPath = path.resolve("frontend", "dist");

app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(clientDistPath, "index.html"));
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is running on port:", process.env.PORT);
});
