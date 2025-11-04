import {InvoiceStatus} from "../types";
import {Invoice} from "../types/invoice.interface";

export interface CreateInvoiceDto {
    customerName: string;
    customerEmail?: string;
    amount: number;
    description?: string;
}

export interface GetInvoicesRequestDto {
    status?: InvoiceStatus;
}

export interface GetInvoicesResponseDto {
    status: InvoiceStatus;
    data: Invoice[];
    total: number;
}

export interface SummaryDto {
    totalRevenue: number;
    totalVAT: number;
    outstandingInvoices: Invoice[]; // or just count if preferred
}
