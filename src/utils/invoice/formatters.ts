// Shared formatting rules for every invoice surface (in-app preview, PDF,
// print, thermal receipt). Keep this the single source of truth for how
// currency/date/GST are rendered so the same invoice never looks different
// across Download PDF, Print and the on-screen preview.

export const formatCurrency = (amount?: number | null): string => {
  const value = Number(amount) || 0;
  return `₹ ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return `${datePart}, ${timePart}`;
};

export const formatGST = (rate?: number | null): string => `${Number(rate) || 0}%`;
