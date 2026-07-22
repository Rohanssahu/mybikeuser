// Mirrors the unified response of GET /bikedoctor/invoice/booking/:bookingId
// (services/invoiceService.js#buildInvoiceResponse on the backend) — the
// exact same shape is consumed by the User App, Dealer App and Admin Panel.

export interface InvoiceServiceLine {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  bookingId: string;
  bookingNumber: string | null;
  invoiceDate: string;
  paymentMethod: string | null;
  paymentStatus: string;
  dealer: {
    name: string | null;
    address: string | null;
    phone: string | null;
    gstNumber: string | null;
    logoUrl: string | null;
  };
  customer: {
    name: string | null;
    mobile: string | null;
  };
  bike: {
    company: string | null;
    model: string | null;
    registrationNumber: string | null;
    engineCc: number | null;
  };
  services: InvoiceServiceLine[];
  charges: {
    pickupCharge: number;
    dropCharge: number;
  };
  subtotal: number;
  tax: {
    rate: number;
    amount: number;
  };
  discount: {
    code: string;
    name: string | null;
    amount: number;
  } | null;
  totalPaid: number;
  settlement: {
    commissionRate: number;
    commissionAmount: number;
    dealerPayout: number;
  };
}
