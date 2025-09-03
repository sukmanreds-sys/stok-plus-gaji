// PDF Export utility function
export const exportToPDF = (
  title: string,
  data: any[],
  headers: string[],
  filename: string
) => {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header-info { margin-bottom: 20px; }
            .export-date { color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="header-info">
            <h1>${title}</h1>
            <p class="export-date">Diekspor pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <table>
            <thead>
                <tr>
                    ${headers.map(header => `<th>${header}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>
                        ${Object.values(row).map(value => `<td>${value || '-'}</td>`).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
            <p>Total Record: ${data.length}</p>
        </div>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Format currency for export
export const formatCurrencyForExport = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date for export
export const formatDateForExport = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};