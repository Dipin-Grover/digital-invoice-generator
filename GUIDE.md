# Usage Guide — Digital Invoice Generator

This guide explains how to run and use the Digital Invoice Generator end-to-end: **register/login → manage clients/items → create invoices → export PDF → email invoices → reports → settings → currency**.

---

## 1) Run the Project Locally

### Prerequisites
- Node.js (LTS recommended)
- A MongoDB database (local MongoDB or MongoDB Atlas)

### Backend setup (`server/`)
1. Create `server/.env` with at least:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000

# Optional (for email feature)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_user
EMAIL_PASS=your_pass
EMAIL_FROM=your_from_address
```

2. Install and start backend:

```bash
cd server
npm install
npm start
```

Backend runs at: `http://localhost:5000`

### Frontend setup (`client/` — primary UI)
1. Install and start UI:

```bash
cd client
npm install
npm run dev
```

The UI runs on the Vite dev server (URL shown in terminal).

---

## 2) First-Time Use: Register an Account

### Where
- Open the UI in your browser
- Go to **Register** (`/register`)

### What to enter
- Name
- Email
- Password

### What happens
- Your account is created in MongoDB
- You are logged in automatically
- A JWT token is returned and stored by the UI for authenticated requests

---

## 3) Login

### Where
- Go to **Login** (`/login`)

### What happens
- You enter email/password
- Server verifies credentials
- UI receives a JWT token and treats you as authenticated

### Common login issues
- If you get `JWT_SECRET is not set`, set `JWT_SECRET` inside `server/.env` and restart the backend.
- If you get DB connection errors, verify `MONGO_URI`.

---

## 4) Dashboard

### Purpose
The dashboard summarizes your invoicing activity:
- Recent invoices
- Totals by status
- Quick navigation to create invoices and manage data

### What you can do
- Navigate to:
  - **Create Invoice**
  - **Clients**
  - **Emails**
  - **Reports**
  - **Settings**

---

## 5) Clients (Client Management)

### Where
- **Clients** page (`/clients`)

### What you can do
- **Add a client** (name, email, address, phone)
- **Edit a client**
- **Delete a client**

### Why clients matter
Invoices are typically issued to clients. You select a client when creating an invoice.

---

## 6) Items (Products/Services)

### Where
- **Settings** page (`/settings`) → **Item catalog** section

### What items represent
Items are reusable products/services with:
- Description
- Quantity
- Price

**Important:** Stored amounts in the backend are assumed to be in **INR (base currency)**.

---

## 7) Creating an Invoice

### Where
- **Create Invoice** (`/invoices/new`)

### Typical workflow
1. Choose a **Client**
2. Add **line items** (product/service rows)
3. Enter:
   - Invoice number
   - Due date
   - Status (draft/sent/paid)
4. Review the computed totals
5. Save/Create invoice

### Next step: choose a PDF template
After creating a draft invoice, the UI may take you to:
- `/invoices/:id/template`

This lets you pick a PDF template, preview the PDF, and finalize the invoice.

### What happens internally
- The UI constructs the invoice payload
- The backend stores:
  - invoice fields
  - references to client and items
  - invoice total (in INR)

---

## 8) Invoice Detail Page

### Where
- Open an invoice from dashboard/list
- Route: `/invoices/:id`

### What you can do
- View invoice metadata (number, due date, status)
- View client information
- View line items and totals

### Key actions
- **Download PDF** (generates and downloads the invoice PDF)
- **Send email** (opens the Email Composer for that invoice)

---

## 9) Export as PDF

### Where
- On the Invoice Detail page (`/invoices/:id`) → **Download PDF**

### What happens
- UI calls backend endpoint:
  - `GET /api/pdf/:id/generate`
- Backend generates a PDF and returns it as a downloadable file

### Currency matching (important)
If you selected a currency in the UI (e.g., USD), the UI can request:
- `GET /api/pdf/:id/generate?currency=USD`

So the exported PDF matches what you see in the UI.

---

## 10) Email Invoice to Client

### Where
- On the Invoice Detail page

### What happens
- The Email Composer lets you review/edit:
  - Recipient email (supports comma-separated list)
  - Subject
  - Email content
  - Optional CC/BCC (under an advanced toggle)

- When you press **Send**, the UI uses the backend to:
  - Generate the invoice PDF in-memory
  - Send the email via SMTP (configured in `server/.env`)
  - Store a history record so you can audit what was attempted

### Currency matching
Same pattern as PDF:
- `POST /api/email/:id/send?currency=USD`

### If email fails
- Verify `.env` SMTP values: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

### Email history
You can see email attempts in two places:
- **Per-invoice history** inside the Email Composer
- **Global history** on **Emails** page (`/emails`)

---

## 11) Reports

### Where
- **Reports** page (`/reports`)

### What it provides
- Aggregations across invoices (totals, counts, status breakdown)

### Helpful tips
- Use the date presets (last 7 days / last 30 days / this month)
- Export a CSV to analyze in Excel/Google Sheets

---

## 12) Settings

### Where
- **Settings** page (`/settings`)

### Typical uses
- Update business/profile details
- Manage the item catalog
- Configure tax defaults and payment term defaults

---

## 13) Currency Selector (UI)

### Where
- In the top navigation bar

### What it does
- Lets you choose display currency (e.g., INR, USD, EUR)
- Stores selection in the browser so it persists across refresh (`localStorage`)
- Fetches live FX rates from backend:
  - `GET /api/fx/latest`

### Notes
- Base currency is **INR**
- UI converts amounts for display; stored DB values remain INR

---

## 14) Theme Toggle (UI)

### Where
- In the top navigation bar

### What it does
- Switch between light and dark themes

---

## 15) Logout

### What it does
- Clears the local auth token
- Returns you to public routes (e.g., landing/login)

---

## Troubleshooting

### Login returns 500
- Ensure `server/.env` includes `JWT_SECRET`
- Restart backend after changing `.env`

### Email says "sent" but does not arrive
- The app can only confirm that your SMTP provider accepted the message.
- If emails do not show in inbox/spam, verify:
  - SMTP provider credentials are correct
  - Sender address in `EMAIL_FROM` is allowed by provider
  - Provider-side logs (Brevo/SendGrid/etc.)
  - Recipient spam filters

### `/api/fx/latest` returns 500
- Your network may be blocking the external FX dataset. The app can still work; FX display may fail until network is available.

### MongoDB connection issues
- Confirm `MONGO_URI` is valid
- Ensure IP access is allowed in MongoDB Atlas

---

## Quick Feature Checklist
- Register
- Login
- Create clients
- Create invoice
- View invoice
- Download PDF
- Send invoice via email
- View reports
- Adjust settings
- Switch currency (UI)
- Toggle theme (UI)
