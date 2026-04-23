import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CalculationResult, InputParameters } from "../types";

const INK = "#0f172a";
const MUTED = "#64748b";

/**
 * Generate a professional 2-page PDF report mirroring the Python reportlab
 * output: input parameters, results, chart image, and calculation log.
 */
export async function generatePdfReport(
  params: InputParameters,
  result: CalculationResult,
  chartPngDataUrl: string | null,
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ---------- Title ----------
  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MARINE CABLE SIZING REPORT", pageWidth / 2, 60, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  const now = new Date();
  doc.text(
    `Generated ${now.toLocaleDateString()} • ${now.toLocaleTimeString()}`,
    pageWidth / 2,
    80,
    { align: "center" },
  );

  // ---------- Inputs table ----------
  autoTable(doc, {
    startY: 110,
    head: [["Parameter", "Value", "Unit"]],
    body: [
      ["Load Current", String(params.load_Amp), "A"],
      ["Cable Run Length", String(params.run_Length), "m"],
      ["System Voltage", String(params.voltage), "V"],
      ["Maximum Voltage Drop", String(params.voltage_Drop), "%"],
      ["Power Factor", String(params.pf), ""],
      ["Core Type", params.core_Type, ""],
      ["Ambient Temperature", String(params.ambient_Temp), "°C"],
      ["Selected CSA", params.selected_CSA, ""],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    theme: "grid",
    margin: { left: 50, right: 50 },
  });

  // ---------- Results table ----------
  // @ts-expect-error lastAutoTable is attached at runtime
  const afterInputsY = doc.lastAutoTable.finalY ?? 200;

  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CALCULATION RESULTS", 50, afterInputsY + 30);

  autoTable(doc, {
    startY: afterInputsY + 40,
    head: [["Parameter", "Value", "Unit"]],
    body: [
      ["Selected Cable Type", `BVA-XXXN/1C${result.csa}`, ""],
      ["Number of Runs", String(result.num_runs), ""],
      ["CSA", String(result.csa), "mm²"],
      ["Rated Current", String(result.rated_Current), "A"],
      ["Voltage Drop", result.Vd_Percent.toFixed(2), "%"],
      ["Conductor Temperature", result.newConTemp.toFixed(2), "°C"],
      ["Resistance (R)", result.R.toFixed(4), "Ω/km"],
      ["Reactance (X)", result.X.toFixed(4), "Ω/km"],
    ],
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    theme: "grid",
    margin: { left: 50, right: 50 },
  });

  // ---------- Page 2: Chart + Log ----------
  doc.addPage();
  doc.setTextColor(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CALCULATION LOG & ANALYSIS", pageWidth / 2, 60, {
    align: "center",
  });

  let cursorY = 90;

  if (chartPngDataUrl) {
    doc.setFontSize(12);
    doc.text("VOLTAGE DROP ANALYSIS", 50, cursorY);
    cursorY += 10;
    try {
      const imgW = pageWidth - 100;
      const imgH = imgW * 0.5;
      doc.addImage(chartPngDataUrl, "PNG", 50, cursorY, imgW, imgH);
      cursorY += imgH + 16;
    } catch {
      // ignore image errors
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(INK);
  doc.text("DETAILED CALCULATION LOG", 50, cursorY);
  cursorY += 14;

  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(INK);
  const lineHeight = 11;
  const pageHeight = doc.internal.pageSize.getHeight();
  for (const line of result.log) {
    if (cursorY > pageHeight - 50) {
      doc.addPage();
      cursorY = 60;
    }
    doc.text(line || " ", 50, cursorY);
    cursorY += lineHeight;
  }

  doc.save(
    `cable_selection_report_${now.toISOString().slice(0, 10)}.pdf`,
  );
}
