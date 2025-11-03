import { Client, Databases, Messaging } from "node-appwrite";

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!); // ✅ allowed in backend SDK

export const db = new Databases(client);
export const messaging = new Messaging(client);

export default client;
