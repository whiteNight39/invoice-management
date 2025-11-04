import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config";

dotenv.config();
import "./config/appwrite";
import invoiceRoutes from "./routes/invoice.routes";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(express.json());

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Invoice API Docs"
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

// ------------------- Routes -------------------
app.use("/invoices", invoiceRoutes);
app.use("/auth", authRoutes);

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});