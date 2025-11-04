// src/controller/invoice.controller.ts
import { Request, Response } from "express";
import { InvoiceService } from "../service";
import { CreateInvoiceDto, GetInvoicesRequestDto } from "../dto";

export class InvoiceController {

    static async setVatRate(req: Request, res: Response) {
        try {
            const user = (req as any).user; // injected by authMiddleware

            const { vatRate } = req.body;

            const response = await InvoiceService.setUserVatRate(vatRate, user.$id);
            return res.status(response.status).json(response);
        } catch (error: any) {
            console.error("VatController error:", error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error?.message || "Failed to set VAT rate",
            });
        }
    }

    static async createInvoice(req: Request, res: Response) {
        try {
            const userId = (req as any).user.$id; // from authMiddleware
            const dto: CreateInvoiceDto = req.body;

            const invoice = await InvoiceService.createInvoice(dto, userId);
            return res.status(201).json({success: true, invoice});
        } catch (error: any) {
            return res.status(400).json({success: false, message: error.message});
        }
    }

    static async getInvoiceById(req: Request, res: Response) {
        try {
            const userId = (req as any).user.$id;
            const { invoiceId } = req.params;
            if (!invoiceId) {
                return res.status(400).json({ success: false, message: "Missing invoiceId parameter" });
            }

            const invoice = await InvoiceService.getInvoiceById(invoiceId, userId);
            return res.status(200).json({ success: true, invoice });
        } catch (error: any) {
            return res.status(404).json({ success: false, message: error.message });
        }
    }

    static async getInvoices(req: Request, res: Response) {
        try {
            const userId = (req as any).user.$id;
            const requestDto: GetInvoicesRequestDto = req.query as any; // optional filter

            const invoices = await InvoiceService.getInvoices(userId, requestDto);
            return res.status(200).json({ success: true, invoices });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    static async markInvoiceAsPaid(req: Request, res: Response) {
        try {
            const userId = (req as any).user.$id;
            const { invoiceId } = req.params;
            if (!invoiceId) {
                return res.status(400).json({ success: false, message: "Missing invoiceId parameter" });
            }

            const updatedInvoice = await InvoiceService.markInvoiceAsPaid(invoiceId, userId);
            return res.status(200).json({ success: true, invoice: updatedInvoice });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getSummary(req: Request, res: Response) {
        try {
            const userId = (req as any).user.$id;

            const summary = await InvoiceService.getSummary(userId);
            return res.status(200).json({ success: true, summary });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}