# Shiv Furniture ERP

Shiv Furniture ERP is a comprehensive, full-stack Enterprise Resource Planning (ERP) system built specifically for a furniture manufacturing business. It tracks the complete operational lifecycle from raw material procurement to manufacturing, inventory management, and final sales delivery.

This project is built with a modern tech stack (Next.js, Prisma, Tailwind CSS, Clerk Auth) and features a built-in **AI Copilot** powered by Groq (Llama-3.3-70b) that understands your real-time database context to provide intelligent business insights.

---

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Prisma
- **Authentication:** Clerk
- **Styling:** Tailwind CSS + UI components
- **State Management:** Zustand
- **AI Engine:** Groq API (`llama-3.3-70b-versatile`)
- **Icons:** Lucide React

---

## 🔄 Core Business Workflow

The ERP is designed to model a real-world manufacturing and fulfillment process. Understanding this workflow is critical to understanding how the modules interact.

### The Complete Chain
\`Customer Order\` → \`Inventory Check\` → \`Procurement/Manufacturing\` → \`Fulfillment\`

1. **Sales Order (SO) Created**
   - A customer orders a finished product (e.g., an Office Steel Chair).
   - Status: \`DRAFT\` -> \`CONFIRMED\`.
   - *Inventory Impact:* When confirmed, the required quantity is **Reserved** (but not yet consumed).

2. **Inventory Check & Routing**
   - If **Free Quantity** (On Hand - Reserved) is sufficient, the order can be fulfilled from stock.
   - If insufficient, the product must be procured based on its **Procurement Strategy**:
     - **Make To Stock (MTS)**: Inventory should theoretically be kept topped up.
     - **Make To Order (MTO)**: Production/Purchasing is triggered strictly by the Sales Order.

3. **Procurement (Buying Raw Materials)**
   - If raw materials (e.g., Plywood, Steel Legs) are low, a **Purchase Order (PO)** is created for a Vendor.
   - Status: \`DRAFT\` -> \`CONFIRMED\` -> \`RECEIVED\`.
   - *Inventory Impact:* When received, **On Hand Quantity** for those raw materials increases.

4. **Manufacturing (Building Finished Goods)**
   - A **Manufacturing Order (MO)** is created to build the finished product.
   - The MO strictly follows the **Bill of Materials (BOM)** to calculate required components.
   - If raw materials are insufficient, the MO is *Blocked*.
   - **Work Orders** define the production routing (e.g., Welding -> Assembly -> Quality Check).
   - *Inventory Impact:* When the MO is \`COMPLETED\`, the raw materials are **Consumed** (decreased), and the finished goods are **Produced** (increased).

5. **Fulfillment (Delivery)**
   - Once the finished goods are in stock, the Sales Order can be delivered.
   - Status: \`CONFIRMED\` -> \`DELIVERED\`.
   - *Inventory Impact:* **Reserved Quantity** and **On Hand Quantity** both decrease simultaneously.

---

## 📦 System Modules

### 1. Inventory & Products
Tracks three product types: \`RAW_MATERIAL\`, \`SEMI_FINISHED\`, and \`FINISHED_GOOD\`.
- Real-time tracking of On Hand vs. Reserved vs. Free quantities.
- **Stock Ledger:** An immutable, double-entry style log of every inventory movement (Purchases, Sales, Manufacturing, Adjustments).

### 2. Purchase (Procurement)
Manages vendor relationships and Purchase Orders.
- Vendors can have their own login (`VENDOR` role) to view and confirm POs assigned to them.
- Tracks costs and automates inventory receipts.

### 3. Sales
Manages customer relationships and Sales Orders.
- Tracks line-item profitability and delivery status.
- Automatically reserves inventory to prevent double-selling.

### 4. Manufacturing
Manages production runs.
- **Bills of Material (BOM):** Defines the exact components and routing operations needed to build a product.
- **Work Orders:** Granular tracking of time and status for specific assembly steps.

### 5. AI Copilot
A context-aware AI assistant built directly into the ERP sidebar.
- **Real-Time Data:** Queries the Prisma database live to answer questions.
- **Smart Routing:** Understands intents like \`inventory-analysis\`, \`risk-analysis\`, and \`procurement-advisor\`.
- **Intelligent Formatting:** Differentiates between simple factual lookups ("How many products do we have?") and deep analysis ("Why is MO-102 blocked?").

### 6. Role-Based Access Control (RBAC)
Robust security ensuring users only see what they should:
- \`ADMIN\`, \`OWNER\`: Full access.
- \`SALES\`: Create/manage Sales Orders, view products.
- \`PURCHASE\`: Manage Purchase Orders and Vendors.
- \`MANUFACTURING\`: Manage MOs, BOMs, and Work Orders.
- \`INVENTORY\`: Manage stock levels and stock ledger.
- \`VENDOR\`: Restricted view—can only see and confirm POs assigned to them specifically.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Neon PostgreSQL Database
- Clerk Account (for Auth)
- Groq Account (for AI)

### Environment Variables
Create a \`.env\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://..."

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI Copilot
GROQ_API_KEY="gsk_..."
\`\`\`

### Installation & Run
\`\`\`bash
# Install dependencies
npm install

# Push database schema
npx prisma db push

# Run the development server
npm run dev
\`\`\`

---

## 🛡️ Security & Auditing

- **Server Actions & Middleware:** Every route and API is protected by Clerk authentication and RBAC middleware.
- **Audit Logs:** Every critical action (creating orders, confirming statuses, modifying users) is logged in the \`AuditLog\` table, preserving the "Who, What, and When" for total accountability.
