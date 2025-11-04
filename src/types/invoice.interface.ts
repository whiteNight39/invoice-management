import {InvoiceStatus} from "./invoice.enum";

export interface Invoice {
    $id: string;
    userId: string;
    customerName: string;
    customerEmail?: string;
    amount: number;
    vatRate: number;
    vatAmount: number;
    totalAmount: number;
    description?: string;
    status: InvoiceStatus;
    $createdAt: string;
    $updatedAt: string;
}