// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Client, Account } from "node-appwrite";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: Missing token" });
        }

        const token = header.replace("Bearer ", "");

        // ✅ Create a new client for the session (no server key)
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT!)
            .setProject(process.env.APPWRITE_PROJECT_ID!)
            .setJWT(token); // attach user session

        const account = new Account(client);

        // Will succeed only if token/session is valid
        const user = await account.get();

        (req as any).user = user; // attach user info
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ message: "Unauthorized or expired session" });
    }
};