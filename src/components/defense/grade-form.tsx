/* ══════════════════════════════════════════════════════════════
   src/components/defense/grade-form.tsx
   Logique slider + isFinal + mention 100% préservée
══════════════════════════════════════════════════════════════ */
"use client";

import { useState } from "react";
import { Star, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn }     from "@/lib/utils";

interface GradeFormProps {
  currentGrade?: string | null;
  onSubmit:  (grade: number, remarks?: string, comment?: string) => Promise<void>;
  isFinal:   boolean;
  onCancel?: () => void;
}

export function GradeForm({ currentGrade, onSubmit, isFinal, onCancel }: GradeFormProps) {
  const [grade,   setGrade]   = useState<number>(Number(currentGrade) || 0);
  const [remarks, setRemarks] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  /* Mention — logique inchangée */
  const mention =
    grade >= 16 ? { label: "Très Bien",   color: "#1B8A5A",  bg: "#edfaf4", border: "#a8e9cb" } :
    grade >= 14 ? { label: "Bien",         color: "#2563eb",  bg: "#eff6ff", border: "#bfdbfe" } :
    grade >= 12 ? { label: "Assez Bien",   color: "#7c3aed",  bg: "#f5f3ff", border: "#ddd6fe" } :
    grade >= 10 ? { label: "Passable",     color: "#d97706",  bg: "#fffbeb", border: "#fde68a" } :
                  { label: "Insuffisant",  color: "#dc2626",  bg: "#fff1f2", border: "#fecaca" };

  const handleSubmit = async () => {
    setLoading(true);
    try { await onSubmit(grade, remarks || undefined, comment || undefined); }
    finally { setLoading(false); }
  };

  const labelText = `Note ${isFinal ? "finale" : "individuelle"} sur 20`;

  return (
    <div className="space-y-5">
      {/* Saisie note */}
      <div className="space-y-3">
        <label htmlFor="grade-number" className="block text-sm font-medium text-slate-700 tracking-[-0.01em]">
          Note {isFinal ? "finale" : "individuelle"} / 20 <span className="text-red-500">*</span>
        </label>

        <div className="flex items-center gap-4">
          <input
            id="grade-range"
            type="range" min={0} max={20} step={0.5}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            aria-label={labelText} title={labelText}
            className="flex-1 h-2 cursor-pointer"
            style={{ accentColor: "#1B8A5A" }}
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              id="grade-number"
              type="number" min={0} max={20} step={0.5}
              value={grade}
              onChange={(e) => setGrade(Math.min(20, Math.max(0, Number(e.target.value))))}
              aria-label={labelText} title={labelText} placeholder="0"
              className="w-16 rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-2 py-2 text-center text-lg font-bold focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all"
            />
            <span className="text-slate-400 font-medium">/20</span>
          </div>
        </div>

        {/* Mention */}
        <div
          className="flex items-center gap-2 py-3 px-4 rounded-xl"
          style={{ background: mention.bg, border: `1px solid ${mention.border}` }}
        >
          <Star className="h-4 w-4 shrink-0" style={{ color: mention.color }} />
          <span className="text-sm font-bold" style={{ color: mention.color }}>{mention.label}</span>
          <span className="ml-auto text-2xl font-black text-slate-800 tracking-[-0.04em]">{grade}</span>
        </div>
      </div>

      {/* Commentaire individuel (jury) */}
      {!isFinal && (
        <div className="space-y-1.5">
          <label htmlFor="grade-comment" className="block text-sm font-medium text-slate-700 tracking-[-0.01em]">
            Commentaire personnel <span className="text-xs text-slate-400">(optionnel)</span>
          </label>
          <textarea
            id="grade-comment" rows={3}
            value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Votre appréciation personnelle…"
            className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
          />
        </div>
      )}

      {/* Remarques finales (Responsable) */}
      {isFinal && (
        <div className="space-y-1.5">
          <label htmlFor="grade-remarks" className="block text-sm font-medium text-slate-700 tracking-[-0.01em]">
            Remarques officielles <span className="text-xs text-slate-400">(optionnel)</span>
          </label>
          <textarea
            id="grade-remarks" rows={4}
            value={remarks} onChange={(e) => setRemarks(e.target.value)}
            placeholder="Remarques qui figureront au procès-verbal…"
            className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        {onCancel && <Button variant="secondary" onClick={onCancel}>Annuler</Button>}
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</>
            : <><Save   className="h-4 w-4" />{isFinal ? "Valider la note finale" : "Soumettre ma note"}</>
          }
        </Button>
      </div>
    </div>
  );
}