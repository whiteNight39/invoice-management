import dotenv from "dotenv";

dotenv.config(); // ✅ load environment variables

export const APPWRITE_DATABASE = {
    DATABASE_ID: process.env.DATABASE_ID!,
    VAT_SETTINGS_TABLE_ID: process.env.VAT_SETTINGS_COLLECTION_ID!,
    INVOICES_TABLE_ID: process.env.INVOICES_COLLECTION_ID!,
};
