function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";

  const text = String(value).replace(/\r?\n|\r/g, " ");

  if (text.includes(";") || text.includes('"') || text.includes(",")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function downloadCsvExcel(rows, filename = "export-data.csv") {
  if (!Array.isArray(rows) || rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const separator = ";";

  const csv = [
    headers.map(escapeCsvValue).join(separator),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(separator),
    ),
  ].join("\r\n");

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
