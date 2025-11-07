# 💻 QB Integration Frontend

Frontend UI for QuickBooks Integration — built with **Next.js (App Router)**, **MUI**, and **Formik + Yup**.

Handles:
- Invoice listing, search, sort, and pagination  
- Creating new invoices with validation  
- QuickBooks OAuth 2.0 connection  
- Responsive and minimal UI built with Material UI

---

## ⚙️ Setup Instructions

### 1️⃣ Clone and install
```bash
git clone https://github.com/NeyamulOmy/qb-integration-fe.git
cd qb-integration-fe
npm install
```
### 2️⃣ Configure environment
Create a .env.local file in the project root:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5050
```
Replace the URL if your backend is hosted elsewhere (e.g. Render).

### 3️⃣ Run the frontend
```bash
npm run dev
```
Frontend runs at → http://localhost:3000

If your backend is running on port 5050, you’ll see invoices load from the API automatically.
