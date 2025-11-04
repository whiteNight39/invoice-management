// src/routes/invoice.routes.ts
import { Router } from "express";
import { InvoiceController } from "../controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /invoices/vat:
 *   put:
 *     summary: Set or update the authenticated user's VAT rate
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vatRate:
 *                 type: number
 *                 example: 7.5
 *                 description: VAT rate as a percentage (0-100)
 *     responses:
 *       200:
 *         description: VAT rate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       201:
 *         description: VAT settings created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       400:
 *         description: Invalid VAT rate provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 */
router.put("/vat", authMiddleware, InvoiceController.setVatRate);

/**
 * @openapi
 * /invoices:
 *   post:
 *     summary: Create a new invoice
 *     description: Creates a new invoice with automatic VAT calculation based on user's VAT settings
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInvoiceDto'
 *           example:
 *             customerName: "Acme Corp"
 *             customerEmail: "billing@acme.com"
 *             amount: 1000
 *             description: "Website development services"
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Bad request - validation error or VAT settings not configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.post("/", InvoiceController.createInvoice);

/**
 * @openapi
 * /invoices:
 *   get:
 *     summary: Get all invoices
 *     description: Retrieve all invoices for the authenticated user, optionally filtered by status
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/InvoiceStatus'
 *         required: false
 *         description: Filter invoices by status (PAID or UNPAID)
 *         example: UNPAID
 *     responses:
 *       200:
 *         description: List of invoices grouped by status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GetInvoicesResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/", InvoiceController.getInvoices);

/**
 * @openapi
 * /invoices/summary:
 *   get:
 *     summary: Get invoice summary
 *     description: Get summary of total revenue, VAT collected, and outstanding invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue from all invoices (before VAT)
 *                 totalVAT:
 *                   type: number
 *                   description: Total VAT collected
 *                 totalOutstanding:
 *                   type: number
 *                   description: Total amount outstanding from unpaid invoices
 *                 paidInvoicesCount:
 *                   type: number
 *                   description: Number of paid invoices
 *                 unpaidInvoicesCount:
 *                   type: number
 *                   description: Number of unpaid invoices
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", InvoiceController.getSummary);

/**
 * @openapi
 * /invoices/{invoiceId}:
 *   get:
 *     summary: Get a specific invoice
 *     description: Retrieve a single invoice by its ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The invoice ID
 *         example: "64f5a8b2c9d4e1f2a3b4c5d6"
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - invoice does not belong to user
 */
router.get("/:invoiceId", InvoiceController.getInvoiceById);

/**
 * @openapi
 * /invoices/{invoiceId}/pay:
 *   patch:
 *     summary: Mark invoice as paid
 *     description: Marks an invoice as paid, recomputes VAT if rate has changed, and sends a notification
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The invoice ID
 *         example: "64f5a8b2c9d4e1f2a3b4c5d6"
 *     responses:
 *       200:
 *         description: Invoice marked as paid successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         description: Invoice already paid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - invoice does not belong to user
 */
router.patch("/:invoiceId/pay", InvoiceController.markInvoiceAsPaid);

export default router;