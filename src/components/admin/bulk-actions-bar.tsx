"use client";

import { useState } from "react";
import { UserCheck, UserX, Download, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelect: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onExportCSV: () => void;
  onSendEmail: (subject: string, message: string) => Promise<void>;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelect,
  onActivate,
  onDeactivate,
  onExportCSV,
  onSendEmail,
}: BulkActionsBarProps) {
  const [emailModal, setEmailModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await onSendEmail(subject, message);
      setEmailModal(false);
      setSubject("");
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 bg-slate-900 text-white",
          "rounded-2xl px-4 py-3 shadow-xl border border-slate-700",
          "animate-slide-up",
        )}
      >
        {/* Compteur */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
          <span className="h-5 w-5 bg-primary-500 rounded-full text-xs font-bold flex items-center justify-center">
            {selectedCount}
          </span>
          <span className="text-sm font-medium">
            sélectionné{selectedCount > 1 ? "s" : ""}
          </span>
        </div>

        {/* CORRECTION 3 : title + aria-label sur chaque bouton icône-texte */}
        <button
          onClick={onActivate}
          title="Activer les comptes sélectionnés"
          aria-label="Activer les comptes sélectionnés"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:bg-slate-800 transition-colors"
        >
          <UserCheck className="h-3.5 w-3.5" /> Activer
        </button>
        <button
          onClick={onDeactivate}
          title="Désactiver les comptes sélectionnés"
          aria-label="Désactiver les comptes sélectionnés"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-slate-800 transition-colors"
        >
          <UserX className="h-3.5 w-3.5" /> Désactiver
        </button>
        <button
          onClick={onExportCSV}
          title="Exporter la sélection en CSV"
          aria-label="Exporter la sélection en CSV"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-400 hover:bg-slate-800 transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
        <button
          onClick={() => setEmailModal(true)}
          title="Envoyer un email groupé"
          aria-label="Envoyer un email groupé"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-400 hover:bg-slate-800 transition-colors"
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </button>

        {/* Annuler — bouton icône seul : title + aria-label obligatoires */}
        <div className="pl-3 border-l border-slate-700">
          <button
            onClick={onClearSelect}
            title="Annuler la sélection"
            aria-label="Annuler la sélection"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal email groupé */}
      <Dialog
        open={emailModal}
        onClose={() => setEmailModal(false)}
        title={`Envoyer un email à ${selectedCount} utilisateur${selectedCount > 1 ? "s" : ""}`}
        size="md"
      >
        <div className="space-y-4">
          {/* CORRECTION 4 : id + htmlFor pour associer label ↔ input (accessibilité) */}
          <div className="space-y-1.5">
            <label
              htmlFor="bulk-email-subject"
              className="block text-sm font-medium text-slate-700"
            >
              Sujet
            </label>
            <input
              id="bulk-email-subject"
              className="input-base"
              placeholder="Objet de l'email…"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="bulk-email-message"
              className="block text-sm font-medium text-slate-700"
            >
              Message
            </label>
            <textarea
              id="bulk-email-message"
              rows={5}
              className="input-base resize-none"
              placeholder="Rédigez votre message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEmailModal(false)}>
              Annuler
            </Button>
            <Button
              isLoading={sending}
              disabled={!subject.trim() || !message.trim()}
              onClick={handleSend}
            >
              <Mail className="h-4 w-4" />
              Envoyer
            </Button>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
}
