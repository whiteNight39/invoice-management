# Invoice Management API

A backend service for creating, managing, and summarizing invoices with VAT support, built with **Node.js**, **Express**, **TypeScript**, and **Appwrite**. Swagger documentation is included for API reference.

---

## Features

- User authentication with **Appwrite sessions**
- Create invoices with automatic VAT calculation
- Update and retrieve VAT rate per user
- List invoices filtered by status
- Mark invoices as paid
- Invoice summary (total revenue, VAT collected, outstanding invoices)
- Swagger API documentation

---

## Tech Stack

- Node.js & TypeScript
- Express.js
- Appwrite (Database + Authentication)
- Swagger / OpenAPI for API docs
- dotenv for environment configuration

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/)
- [Appwrite](https://appwrite.io/) (v1.8.0+ recommended)
- `.env` file in project root

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/whiteNight39/invoice-management
cd invoice-management
```
2. Install Dependencies:

```bash
npm install
```
3. Copy the .env.example to .env and set your environment variables:
```bash
APPWRITE_ENDPOINT=http://localhost/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-backend-key
DATABASE_ID=your-database-id
INVOICES_COLLECTION_ID=your-invoices-collection-id
VAT_SETTINGS_COLLECTION_ID=your-vat-settings-collection-id
PORT=4000
```
## Running the Server
```
npm run dev
```
Server will run at
```
http://localhost:4000
```
Swagger docs are available at
```aiignore
http://localhost:4000/api-docs
```
## API Overview
- Authentication: All endpoints require a valid Appwrite session JWT in the `Authorization` header.

- Headers:
```aiignore
Authorization: Bearer <jwt>
Content-Type: application/json
```
- Endpoints

| Method | Path               | Description                                                    |
| ------ | ----------------- | -------------------------------------------------------------- |
| PUT    | /vat              | Set or update authenticated user's VAT rate                    |
| POST   | /invoices         | Create a new invoice                                           |
| GET    | /invoices         | Get all invoices (optionally filtered by status)               |
| GET    | /invoices/summary | Get invoice summary (total revenue, VAT, outstanding invoices) |
| GET    | /invoices/:id     | Get a single invoice by ID                                     |
| PATCH  | /invoices/:id/pay | Mark invoice as paid                                           |

Full Swagger documentation available at `/api-docs`.

