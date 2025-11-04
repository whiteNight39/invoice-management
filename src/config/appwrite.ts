import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env first

import { Client, Databases, Messaging, TablesDB } from "node-appwrite";

// Validate required variables to avoid silent failures
if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
    console.error("❌ Missing Appwrite ENV variables:");
    console.error("APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
    process.exit(1); // Stop app from running without config
}

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

export const db = new Databases(client);
export const tablesDB = new TablesDB(client);
export const messaging = new Messaging(client);

export default client;