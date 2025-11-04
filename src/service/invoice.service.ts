// src/service/invoice.service.ts
import {APPWRITE_DATABASE, tablesDB} from "../config";
import {ID, Query} from "node-appwrite";
import {BaseResponse, CreateInvoiceDto, GetInvoicesRequestDto, GetInvoicesResponseDto, SummaryDto} from "../dto";
import { InvoiceStatus } from "../types";
import {Invoice} from "../types/invoice.interface";

export class InvoiceService {

    static async setUserVatRate(vatRate: number, userId: string): Promise<BaseResponse> {
        const { DATABASE_ID, VAT_SETTINGS_TABLE_ID } = APPWRITE_DATABASE;

        if (vatRate < 0 || vatRate > 100) {
            return {
                status: 400,
                success: false,
                message: "vatRate must be a number between 0 and 100",
            };
        }

        try {
            // Get the user's VAT settings row
            const existing = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: VAT_SETTINGS_TABLE_ID,
                queries: [Query.equal("userId", userId)]
            });

            if (existing.total === 0) {
                // If not exists, create a new row
                await tablesDB.createRow({
                    databaseId: DATABASE_ID,
                    tableId: VAT_SETTINGS_TABLE_ID,
                    rowId: ID.unique(),
                    data: {
                        userId,
                        vatRate,
                    },
                });

                return {
                    status: 201,
                    success: true,
                    message: "VAT settings created successfully",
                };
            }

            // 3️⃣ Update existing row
            const row = existing.rows[0];
            if (!row) {
                return {
                    status: 404,
                    success: false,
                    message: "VAT settings row not found for user",
                };
            }
            await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: VAT_SETTINGS_TABLE_ID,
                rowId: row.$id,
                data: { vatRate },
            });

            return {
                status: 200,
                success: true,
                message: "VAT rate updated successfully",
            };
        } catch (error: any) {
            console.error("Error updating VAT rate:", error);
            return {
                status: 500,
                success: false,
                message: error?.message || "Failed to update VAT rate",
            };
        }
    }

    static async createInvoice(dto: CreateInvoiceDto, userId: string): Promise<BaseResponse> {
        const { DATABASE_ID, VAT_SETTINGS_TABLE_ID, INVOICES_TABLE_ID } = APPWRITE_DATABASE;

        // ✅ Input validation
        if (!dto.customerName || dto.customerName.trim() === "") {
            return {
                status: 400,
                success: false,
                message: "Customer name is required",
            };
        }
        if (dto.amount <= 0) {
            return {
                status: 400,
                success: false,
                message: "Invoice amount must be greater than 0",
            };
        }

        try {
            // 1️⃣ Get user's VAT settings
            const vatSettings = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: VAT_SETTINGS_TABLE_ID,
                queries: [Query.equal("userId", userId)]
            });

            if (vatSettings.total !== 1 || !vatSettings.rows[0]) {
                return {
                    status: 400,
                    success: false,
                    message: "VAT settings not configured for this user.",
                };
            }

            const [settings] = vatSettings.rows;
            const vatRate = settings.vatRate;

            // 2️⃣ Calculate VAT + total
            const vatAmount = (dto.amount * vatRate) / 100;
            const totalAmount = dto.amount + vatAmount;

            // 3️⃣ Create invoice document
            const createdInvoice = await tablesDB.createRow({
                databaseId: DATABASE_ID,
                tableId: INVOICES_TABLE_ID,
                rowId: ID.unique(),
                data: {
                    userId,
                    customerName: dto.customerName,
                    customerEmail: dto.customerEmail ?? null,
                    amount: dto.amount,
                    vatRate,
                    vatAmount,
                    totalAmount,
                    description: dto.description ?? "",
                    status: InvoiceStatus.UNPAID
                }
            });

            return {
                status: 201, // ✅ 201 Created
                success: true,
                message: "Invoice created successfully",
                data: this.mapRowToInvoice(createdInvoice)
            };
        }
        catch (error: any) {
            console.error("Error creating invoice:", error);
            return {
                status: 500,
                success: false,
                message: error?.message || "Failed to create invoice",
            };
        }
    }

    static async getInvoiceById(invoiceId: string, userId: string): Promise<BaseResponse> {
        const { DATABASE_ID, INVOICES_TABLE_ID } = APPWRITE_DATABASE;

        // ✅ Validate invoiceId
        if (!invoiceId || invoiceId.trim() === "") {
            return {
                status: 400,
                success: false,
                message: "Invoice ID is required",
            };
        }

        try {
            // 1️⃣ Fetch the invoice row
            const invoiceRow = await tablesDB.getRow({
                databaseId: DATABASE_ID,
                tableId: INVOICES_TABLE_ID,
                rowId: invoiceId,
            });

            // 2️⃣ Map the row to Invoice
            const invoice = this.mapRowToInvoice(invoiceRow);

            // 3️⃣ Authorization check
            if (invoice.userId !== userId) {
                return {
                    status: 403, // Forbidden
                    success: false,
                    message: "Unauthorized: invoice does not belong to your business",
                };
            }

            // 4️⃣ Return invoice
            return {
                status: 200,
                success: true,
                message: "Invoice retrieved successfully",
                data: invoice,
            };
        } catch (error: any) {
            console.error("Error fetching invoice:", error);

            // Appwrite returns 404 if row does not exist
            if (error?.code === 404) {
                return {
                    status: 404,
                    success: false,
                    message: "Invoice not found",
                };
            }

            return {
                status: 500,
                success: false,
                message: error?.message || "Failed to retrieve invoice",
            };
        }
    }

    static async getInvoices(userId: string, request?: GetInvoicesRequestDto): Promise<BaseResponse> {
        const { DATABASE_ID, INVOICES_TABLE_ID } = APPWRITE_DATABASE;

        // ✅ Validate userId
        if (!userId || userId.trim() === "") {
            return {
                status: 400,
                success: false,
                message: "User ID is required",
            };
        }

        try {
            // Fetch all invoices for this user
            const allRows = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: INVOICES_TABLE_ID,
                queries: [Query.equal("userId", userId)],
            });

            if (allRows.total === 0) {
                return {
                    status: 200,
                    success: true,
                    message: "No invoices found",
                    data: [],
                };
            }

            // Map Appwrite rows to Invoice interface
            const allInvoices = allRows.rows.map(InvoiceService.mapRowToInvoice);

            // If a status filter is provided, return only that status
            if (request?.status) {
                const filtered = allInvoices.filter(
                    (inv) => inv.status === request.status
                );
                const responseDto: GetInvoicesResponseDto = {
                    status: request.status,
                    data: filtered,
                    total: filtered.length,
                };
                return {
                    status: 200,
                    success: true,
                    message: `Invoices with status ${request.status} retrieved`,
                    data: [responseDto],
                };
            }

            // Otherwise, group invoices by status
            const grouped = allInvoices.reduce((acc, invoice) => {
                if (!acc[invoice.status]) acc[invoice.status] = [];
                acc[invoice.status].push(invoice);
                return acc;
            }, {} as Record<InvoiceStatus, Invoice[]>);

            // Convert grouped object to array of DTOs
            const groupedDtos: GetInvoicesResponseDto[] = Object.entries(grouped).map(
                ([status, data]) => ({
                    status: status as InvoiceStatus,
                    data,
                    total: data.length,
                })
            );

            return {
                status: 200,
                success: true,
                message: "Invoices retrieved successfully",
                data: groupedDtos,
            };
        } catch (error: any) {
            console.error("Error fetching invoices:", error);
            return {
                status: 500,
                success: false,
                message: error?.message || "Failed to retrieve invoices",
            };
        }
    }

    static async markInvoiceAsPaid(invoiceId: string, userId: string): Promise<BaseResponse> {
        const { DATABASE_ID, INVOICES_TABLE_ID, VAT_SETTINGS_TABLE_ID } = APPWRITE_DATABASE;

        // Validate input
        if (!invoiceId || !userId) {
            return {
                status: 400,
                success: false,
                message: "Invoice ID and User ID are required",
            };
        }

        try {
            // Fetch invoice
            const invoiceResponse = await this.getInvoiceById(invoiceId, userId);

            if (!invoiceResponse.success || !invoiceResponse.data) {
                return {
                    status: 404,
                    success: false,
                    message: "Invoice not found or unauthorized",
                };
            }

            const invoice = invoiceResponse.data as Invoice;

            // Check if already paid
            if (invoice.status === InvoiceStatus.PAID) {
                return {
                    status: 400,
                    success: false,
                    message: "Invoice is already marked as paid",
                };
            }

            // Fetch VAT settings
            const vatSettings = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: VAT_SETTINGS_TABLE_ID,
                queries: [Query.equal("userId", userId)],
            });

            if (vatSettings.total !== 1 || !vatSettings.rows[0]) {
                return {
                    status: 400,
                    success: false,
                    message: "VAT settings not configured for this user",
                };
            }

            const currentVatRate = vatSettings.rows[0].vatRate;

            // Recompute VAT if rate changed
            let vatAmount = invoice.vatAmount;
            let totalAmount = invoice.totalAmount;

            if (currentVatRate !== invoice.vatRate) {
                vatAmount = (invoice.amount * currentVatRate) / 100;
                totalAmount = invoice.amount + vatAmount;
            }

            // Update invoice status
            const updatedRow = await tablesDB.updateRow({
                databaseId: DATABASE_ID,
                tableId: INVOICES_TABLE_ID,
                rowId: invoiceId,
                data: {
                    status: InvoiceStatus.PAID,
                    vatRate: currentVatRate,
                    vatAmount,
                    totalAmount,
                },
            });

            return {
                status: 200,
                success: true,
                message: "Invoice marked as paid successfully",
                data: this.mapRowToInvoice(updatedRow),
            };
        } catch (error: any) {
            console.error("Error marking invoice as paid:", error);
            return {
                status: 500,
                success: false,
                message: error?.message || "Failed to mark invoice as paid",
            };
        }
    }

    static async getSummary(authenticatedUserId: string): Promise<BaseResponse> {
        const { DATABASE_ID, INVOICES_TABLE_ID } = APPWRITE_DATABASE;

        if (!authenticatedUserId) {
            return {
                status: 400,
                success: false,
                message: "User ID is required",
            };
        }

        try {
            // 1️⃣ Fetch all invoices for this user
            const allRows = await tablesDB.listRows({
                databaseId: DATABASE_ID,
                tableId: INVOICES_TABLE_ID,
                queries: [Query.equal("userId", authenticatedUserId)],
            });

            const allInvoices = allRows.rows.map(InvoiceService.mapRowToInvoice);

            // 2️⃣ Compute totals
            const totalRevenue = allInvoices.reduce((sum, inv) => sum + inv.amount, 0); // revenue before VAT
            const totalVAT = allInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0);
            const totalOutstanding = allInvoices
                .filter(inv => inv.status === InvoiceStatus.UNPAID)
                .reduce((sum, inv) => sum + inv.totalAmount, 0);

            const paidInvoicesCount = allInvoices.filter(inv => inv.status === InvoiceStatus.PAID).length;
            const unpaidInvoicesCount = allInvoices.filter(inv => inv.status === InvoiceStatus.UNPAID).length;

            const summary: SummaryDto & { paidInvoicesCount: number; unpaidInvoicesCount: number; totalOutstanding: number } = {
                totalRevenue,
                totalVAT,
                totalOutstanding,
                paidInvoicesCount,
                unpaidInvoicesCount,
                outstandingInvoices: allInvoices.filter(inv => inv.status === InvoiceStatus.UNPAID),
            };

            return {
                status: 200,
                success: true,
                message: "Invoice summary fetched successfully",
                data: summary,
            };
        } catch (error: any) {
            console.error("Error fetching invoice summary:", error);
            return {
                status: 500,
                success: false,
                message: error?.message || "Failed to fetch invoice summary",
            };
        }
    }


    private static mapRowToInvoice(row: any): Invoice {
        return {
            $id: row.$id,
            $createdAt: row.$createdAt,
            $updatedAt: row.$updatedAt,
            userId: row.userId,
            customerName: row.customerName,
            customerEmail: row.customerEmail ?? undefined,
            amount: row.amount,
            vatRate: row.vatRate,
            vatAmount: row.vatAmount,
            totalAmount: row.totalAmount,
            description: row.description ?? "",
            status: row.status,
        };
    }

}
