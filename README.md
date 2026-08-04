# SmartCart POS - Intelligent Point of Sale System

SmartCart POS is a production-grade, offline-first Point of Sale (POS) and inventory management system designed for Kirana stores, corner markets, and retail shops. Built with React 18, TypeScript, Tailwind CSS, and powered by Hamza Jabbar for smart sales forecasting and inventory intelligence.

---

## 🌟 Key Features

### 🛒 High-Speed Checkout & Cashier POS
- **Fast Product Search & Category Filtering**: Instantly look up items by name, SKU, or category.
- **Barcode Scanner Support**: Camera-based camera barcode scanning and instant barcode lookup.
- **Weight-Based Calculations**: Seamless pricing for items measured in grams/kilograms or units.
- **Flexible Payments**: Multi-method payment processing (Cash, Credit/Debit Card, UPI / Mobile Wallet, Store Credit).
- **Thermal Receipt Printing**: Styled ESC/POS 80mm receipt generation with direct browser print support.

### 📦 Inventory & Stock Management
- **Stock Tracking & Low-Stock Alerts**: Visual threshold indicators for inventory needing restocking.
- **Quick Stock Adjustments**: Fast bulk restocking and stock level modifications.
- **Automatic SKU & Barcode Generation**: Built-in utility to auto-generate unique barcodes for custom store products.

### 📶 Offline-First Architecture & Sync Queue
- **Uninterrupted Operations**: Keep ringing up sales even during internet outages or server downtime.
- **IndexedDB Persistence**: All orders, products, and inventory updates persist locally.
- **Automatic Background Sync**: Auto-syncs pending transactions when network connectivity is restored.

### 📊 Analytics & Reporting
- **Daily Sales Metrics**: Monitor Gross Sales, Average Order Value (AOV), Total Orders, and Payment Method breakdowns.
- **Interactive Visual Charts**: Powered by Recharts for hourly sales distribution and top-selling product categories.
- **CSV Data Export**: One-click download of daily transaction receipts for accounting and auditing.

### 🤖 Gemini AI Sales & Demand Forecasting
- **Smart Demand Predictions**: AI-analyzed inventory projections for the upcoming 7 and 30 days.
- **Automated Reorder Alerts**: AI recommendations on stock quantities to reorder before running out.
- **Trend Analysis**: Category-level purchasing insights powered by Google Gemini.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Data Visualization**: Recharts
- **Offline Storage**: IndexedDB (idb)
- **AI Integration**: Google Gemini API (`@google/genai`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hamzajabbar019/smartcart-pos.git
   cd smartcart-pos
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm start
```
