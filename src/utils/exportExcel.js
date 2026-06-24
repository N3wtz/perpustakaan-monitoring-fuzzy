import * as XLSX from "xlsx";

function bersihkanNamaSheet(nama) {
  return String(nama || "Sheet")
    .replace(/[\\/?*[\]:]/g, " ")
    .slice(0, 31);
}

export function downloadWorkbookExcel(
  sheets = {},
  filename = "export-data.xlsx",
) {
  const workbook = XLSX.utils.book_new();

  Object.entries(sheets).forEach(([sheetName, rows]) => {
    const dataSheet =
      Array.isArray(rows) && rows.length > 0
        ? rows
        : [{ Keterangan: "Tidak ada data" }];

    const worksheet = XLSX.utils.json_to_sheet(dataSheet);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      bersihkanNamaSheet(sheetName),
    );
  });

  const namaFile = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, namaFile);
}
