/**
 * Utility to export an array of objects to a CSV file and trigger download.
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without .csv)
 * @param {Object} headers - Key-value pair mapping object keys to CSV headers (optional)
 */
export function exportToCSV(data, filename, headers = null) {
  if (!data || !data.length) {
    return;
  }

  // Determine headers
  const keys = Object.keys(data[0]);
  const headerRow = headers ? keys.map(k => headers[k] || k) : keys;
  
  // Format rows
  const csvRows = [];
  csvRows.push(headerRow.join(','));

  for (const row of data) {
    const values = keys.map(key => {
      let val = row[key];
      // Handle nested objects or nulls
      if (val === null || val === undefined) {
        val = '';
      } else if (typeof val === 'object') {
        if (val instanceof Date) {
          val = val.toISOString();
        } else {
          val = JSON.stringify(val);
        }
      } else {
        val = String(val);
      }
      
      // Escape quotes and wrap in quotes to handle commas in values
      val = val.replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(','));
  }

  // Create Blob and trigger download
  const csvString = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }); // \uFEFF is BOM for UTF-8 Excel support
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
