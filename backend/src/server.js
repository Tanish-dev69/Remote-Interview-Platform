import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { ENV } from "./lib/.env.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.get("/health", (req, res) => {
  res.status(200).json({ message:"api is up and running" });
});

app.get("/books", (req, res) => {
  res.status(200).json({ message:"this is the books endpoint" });
});




//make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  const clientDistPath = path.join(process.cwd(), "frontend", "dist");
  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}


app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));