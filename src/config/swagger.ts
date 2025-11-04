import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Invoice Management API',
            version: '1.0.0',
            description: 'API for managing invoices with automatic VAT calculation',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:4000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                InvoiceStatus: {
                    type: 'string',
                    enum: ['PAID', 'UNPAID'],
                    description: 'Represents whether an invoice has been settled or not'
                },

                // ==========================================
                // Invoice Entity Schema (Response)
                // ==========================================
                Invoice: {
                    type: 'object',
                    description: 'Represents an invoice stored in the system',
                    properties: {
                        $id: { type: 'string', description: 'Unique identifier for the invoice', example: '67a2c1300f2a948ef41bf87b' },
                        userId: { type: 'string', description: 'User ID of the invoice owner' },
                        customerName: { type: 'string', description: 'Name of the customer being billed', example: 'Acme Corporation' },
                        customerEmail: { type: 'string', nullable: true, description: 'Email used to send invoice copy', example: 'billing@acme.com' },
                        amount: { type: 'number', description: 'Amount before VAT', example: 1000 },
                        vatRate: { type: 'number', description: 'VAT percentage configured for the user', example: 7.5 },
                        vatAmount: { type: 'number', description: 'Amount of VAT added automatically', example: 75 },
                        totalAmount: { type: 'number', description: 'Grand total (amount + VAT)', example: 1075 },
                        description: { type: 'string', description: 'Description of services rendered', example: 'Website development services' },
                        status: { $ref: '#/components/schemas/InvoiceStatus' },
                        $createdAt: { type: 'string', format: 'date-time', example: '2025-02-01T10:45:22.000Z' },
                        $updatedAt: { type: 'string', format: 'date-time', example: '2025-02-01T10:45:22.000Z' }
                    }
                },

                // ==========================================
                // DTO for POST /invoices
                // ==========================================
                CreateInvoiceDto: {
                    type: 'object',
                    description: 'Payload for creating a new invoice',
                    required: ['customerName', 'amount'],
                    properties: {
                        customerName: { type: 'string', description: 'Full name of the customer or company', example: 'Acme Corporation' },
                        customerEmail: { type: 'string', description: 'Optional email address for invoice delivery', example: 'billing@acme.com' },
                        amount: { type: 'number', description: 'Amount to be invoiced (VAT will be automatically applied)', example: 1000, minimum: 0 },
                        description: { type: 'string', description: 'Description of the project or services provided', example: 'Website development services' }
                    }
                },

                // ==========================================
                // Request schema for filtering invoices
                // ==========================================
                GetInvoicesRequestDto: {
                    type: 'object',
                    description: 'Optional filter parameters when fetching invoices',
                    properties: {
                        status: { $ref: '#/components/schemas/InvoiceStatus', description: 'Filter invoices by status (PAID or UNPAID)' }
                    }
                },

                // ==========================================
                // Response schema for listing invoices
                // ==========================================
                GetInvoicesResponse: {
                    type: 'object',
                    description: 'Paginated invoice listing response',
                    properties: {
                        status: { $ref: '#/components/schemas/InvoiceStatus' },
                        data: { type: 'array', items: { $ref: '#/components/schemas/Invoice' } },
                        total: { type: 'number', description: 'Total number of invoices found', example: 25 }
                    }
                },

                // ==========================================
                // DTO for invoice summary
                // ==========================================
                SummaryDto: {
                    type: 'object',
                    description: 'Summary of total revenue, VAT collected, and outstanding invoices',
                    properties: {
                        totalRevenue: { type: 'number', description: 'Total revenue from all invoices (before VAT)', example: 10000 },
                        totalVAT: { type: 'number', description: 'Total VAT collected', example: 750 },
                        outstandingInvoices: { type: 'array', description: 'Invoices that are not yet paid', items: { $ref: '#/components/schemas/Invoice' } }
                    }
                }
            }
        },

        security: [
            {
                bearerAuth: []
            }
        ]
    },

    apis: ['./src/routes/*.ts', './src/controllers/*.ts', "./src/dto/*.ts"] // Path to route JSDocs
};

export const swaggerSpec = swaggerJsdoc(options);
