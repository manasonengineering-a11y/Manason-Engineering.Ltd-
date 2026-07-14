/**
 * Dynamic PDF generator and downloader for Manason Engineering
 */
export const triggerFileDownload = (name: string, category: string) => {
  const content = `%PDF-1.4
%
1 0 obj
<< /Title (Manason Engineering - ${name})
   /Author (Manason Engineering Ltd)
   /Subject (${category} Official Brochure) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>
endobj
5 0 obj
<< /Length 150 >>
stream
BT
/F1 18 Tf
50 700 Td
(MANASON ENGINEERING LTD - OFFICIAL DOCUMENT) Tj
/F1 12 Tf
0 -30 Td
(Brochure: ${name}) Tj
0 -20 Td
(Category: ${category}) Tj
0 -20 Td
(Generated dynamically for production-ready access.) Tj
0 -30 Td
(Visit our platform at: manason.engineering) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000120 00000 n 
0000000170 00000 n 
0000000220 00000 n 
0000000370 00000 n 
trailer
<< /Size 6 /Root 2 0 R >>
startxref
570
%%EOF`;

  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.replace(/\s+/g, '_')}_Brochure.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const triggerQuotationDownload = (quote: { id: string; clientName: string; supplierName?: string; productName: string; details: string; priceOfferedByAdmin?: number; price?: number }) => {
  const content = `%PDF-1.4
%
1 0 obj
<< /Title (Manason Engineering - Quotation #${quote.id})
   /Author (Manason Engineering Ltd)
   /Subject (Official Material and Labour Quotation) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
5 0 obj
<< /Length 650 >>
stream
BT
/F1 16 Tf
50 720 Td
(MANASON ENGINEERING LTD - OFFICIAL QUOTATION) Tj
/F2 10 Tf
0 -30 Td
(Quotation ID: ${quote.id}) Tj
0 -20 Td
(Client: ${quote.clientName}) Tj
0 -20 Td
(Supplier: ${quote.supplierName || 'Manason Factory Hub'}) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString()}) Tj
0 -30 Td
/F1 12 Tf
(REQUESTED MATERIAL / SERVICE DETAILS:) Tj
/F2 10 Tf
0 -20 Td
(${quote.productName}) Tj
0 -15 Td
(Specifications: ${quote.details}) Tj
0 -30 Td
/F1 12 Tf
(NEGOTIATED ESCROW VALUATION PRICE:) Tj
/F1 14 Tf
0 -25 Td
(TOTAL OFFER: RWF ${(quote.priceOfferedByAdmin || quote.price || 0).toLocaleString()}) Tj
/F2 9 Tf
0 -35 Td
(Terms: Payment must be deposited into the Board of Engineers Rwanda Escrow ledger.) Tj
0 -15 Td
(Once funds are locked, work dispatches immediately. Dispute arbitration is handled 24/7.) Tj
0 -30 Td
/F1 10 Tf
(Approved Authorized Seal: MANASON AUTOMATED SYSTEM 2026) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000120 00000 n 
0000000170 00000 n 
0000000220 00000 n 
0000000370 00000 n 
trailer
<< /Size 6 /Root 2 0 R >>
startxref
570
%%EOF`;

  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Manason_Quotation_${quote.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
