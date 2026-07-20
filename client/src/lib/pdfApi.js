<<<<<<< HEAD
const BASE_URL = "https://digital-invoice-generator-1iwa.onrender.com/";

export async function apiDownloadInvoicePdf(token, invoiceId, currency) {
  const qs = currency ? `?currency=${encodeURIComponent(currency)}` : '';

  const res = await fetch(
    `${BASE_URL}api/pdf/${invoiceId}/generate${qs}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
=======
export async function apiDownloadInvoicePdf(token, invoiceId, currency) {
  const qs = currency ? `?currency=${encodeURIComponent(currency)}` : '';
  const res = await fetch(`/api/pdf/${invoiceId}/generate${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
>>>>>>> 4e5da2af4f5cf6e7fa9f096f210818b6bc3b9656

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to download PDF');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return { url, blob };
<<<<<<< HEAD
}
=======
}
>>>>>>> 4e5da2af4f5cf6e7fa9f096f210818b6bc3b9656
