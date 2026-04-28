"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { reportingApi } from "@/services/reporting.service";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ExportRow } from "@/types/reporting.types";

const YEAR_OPTIONS = [
  { value: "", label: "Toutes les années" },
  ...[0, 1, 2].map((offset) => {
    const y = new Date().getFullYear() - offset;
    return { value: `${y}-${y + 1}`, label: `${y}-${y + 1}` };
  }),
];

const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "PFE", label: "PFE" },
  { value: "MEMOIRE", label: "Mémoire" },
  { value: "THESE", label: "Thèse" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "PROPOSITION", label: "Proposition" },
  { value: "EN_COURS", label: "En cours" },
  { value: "SOUMIS", label: "Soumis" },
  { value: "SOUTENU", label: "Soutenu" },
  { value: "ARCHIVE", label: "Archivé" },
];

// ── Génération CSV (export Excel-compatible) ──────────────────
function exportToCSV(rows: ExportRow[], filename: string) {
  const headers = [
    "Titre",
    "Type",
    "Statut",
    "Année académique",
    "Étudiant",
    "Email étudiant",
    "Créé le",
  ];

  const csvRows = rows.map((r) =>
    [
      `"${r.title}"`,
      r.type,
      r.status,
      r.academicYear,
      `"${(r.studentName ?? "") + " " + (r.studentLastName ?? "")}"`,
      r.studentEmail ?? "",
      new Date(r.createdAt).toLocaleDateString("fr-FR"),
    ].join(";"),
  );

  const bom = "\uFEFF"; // UTF-8 BOM pour Excel
  const csv = bom + [headers.join(";"), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Génération PDF (impression navigateur) ────────────────────
function printToPDF(rows: ExportRow[], filters: Record<string, string>) {
  const filterDesc =
    Object.entries(filters)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ") || "Aucun filtre";

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Rapport SUSTPA</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 20px; }
        h1   { color: #2563eb; font-size: 18px; margin-bottom: 4px; }
        p    { color: #64748b; font-size: 11px; margin-bottom: 16px; }
        table{ width: 100%; border-collapse: collapse; }
        th   { background: #2563eb; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
        td   { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge { padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
      </style>
    </head>
    <body>
      <h1>Rapport des projets académiques — SUSTPA</h1>
      <p>Filtres : ${filterDesc} | Généré le : ${new Date().toLocaleDateString("fr-FR")}</p>
      <p>Total : <strong>${rows.length} projet(s)</strong></p>
      <table>
        <thead>
          <tr>
            <th>Titre</th><th>Type</th><th>Statut</th>
            <th>Année</th><th>Étudiant</th><th>Créé le</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (r) => `
            <tr>
              <td>${r.title}</td>
              <td>${r.type}</td>
              <td>${r.status}</td>
              <td>${r.academicYear}</td>
              <td>${(r.studentName ?? "") + " " + (r.studentLastName ?? "")}</td>
              <td>${new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.print();
}

export function ExportPanel() {
  const toast = useToast();
  const [year, setYear] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState<"csv" | "pdf" | null>(null);

  const fetchData = async () => {
    return reportingApi.exportProjects({
      academicYear: year || undefined,
      type: type || undefined,
      status: status || undefined,
    });
  };

  const handleCSV = async () => {
    setLoading("csv");
    try {
      const rows = await fetchData();
      const date = new Date().toISOString().slice(0, 10);
      exportToCSV(rows, `sustpa-projets-${date}.csv`);
      toast.success(`${rows.length} projets exportés en CSV`);
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setLoading(null);
    }
  };

  const handlePDF = async () => {
    setLoading("pdf");
    try {
      const rows = await fetchData();
      printToPDF(rows, { Année: year, Type: type, Statut: status });
      toast.success("Aperçu PDF ouvert");
    } catch {
      toast.error("Erreur lors de la génération PDF");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary-600" />
          Exporter les données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Filtres */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Année académique"
            options={YEAR_OPTIONS}
            value={year}
            onChange={setYear}
          />
          <Select
            label="Type de projet"
            options={TYPE_OPTIONS}
            value={type}
            onChange={setType}
          />
          <Select
            label="Statut"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        </div>

        {/* Boutons export */}
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleCSV}
            disabled={!!loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
          >
            {loading === "csv" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Exporter Excel / CSV
          </button>

          <button
            onClick={handlePDF}
            disabled={!!loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
          >
            {loading === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Générer PDF
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Les exports incluent les projets correspondant aux filtres
          sélectionnés. Le CSV est compatible avec Excel et LibreOffice Calc.
        </p>
      </CardContent>
    </Card>
  );
}
