"use client";

import { useState } from "react";
import { FileText, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionReportFormProps {
  initialReport?: string;
  onSubmit: (report: string) => Promise<void>;
  onCancel?: () => void;
}

export function SessionReportForm({
  initialReport = "",
  onSubmit,
  onCancel,
}: SessionReportFormProps) {
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!report.trim()) return;
    setLoading(true);
    try {
      await onSubmit(report.trim());
    } finally {
      setLoading(false);
    }
  };

  const isReady = report.trim().length >= 10;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {/* Label */}
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 tracking-[-0.01em]">
          <div className="h-6 w-6 rounded-lg bg-primary-50 flex items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-primary-600" />
          </div>
          Compte-rendu de séance
        </label>
        <p className="text-xs text-slate-400 leading-relaxed">
          Résumez les points abordés, les décisions prises et les prochaines
          étapes.
        </p>

        {/* Zone de saisie */}
        <textarea
          rows={8}
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder={`Ex :\n— Points abordés : présentation de l'avancement chapitre 2\n— Décisions : revoir la méthodologie section 2.3\n— Prochaines étapes : corriger avant le 15/03, préparer présentation\n— Prochaine session : 25/03 à 10h00`}
          className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-mono leading-relaxed"
        />

        {/* Compteur + état */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {report.length} / 5000 caractères
          </p>
          <p
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: isReady ? "#1B8A5A" : "#dc2626" }}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Prêt
              </>
            ) : (
              "Minimum 10 caractères"
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!isReady || loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer et archiver
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
