import express from "express";
import dotenv from "dotenv";

dotenv.config();

import "./config/appwrite";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
