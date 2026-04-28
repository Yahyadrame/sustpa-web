"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Avatar }   from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { cn }       from "@/lib/utils";
import type { DeliverableReview } from "@/types/deliverable.types";

interface ReviewPanelProps {
  deliverableId: string;
  reviews:       DeliverableReview[];
  currentStatus: string;
  canReview:     boolean;
  canComment:    boolean;
  onApprove:     (comment?: string)  => Promise<void>;
  onRevision:    (comment: string)   => Promise<void>;
  onComment:     (comment: string)   => Promise<void>;
}

/* ── Config actions — logique inchangée ─────────────────────── */
const ACTION_CONFIG = {
  approve: {
    label:       "Approuver",
    icon:        <CheckCircle2 className="h-4 w-4" />,
    activeBg:    "linear-gradient(135deg, #1B8A5A, #156e48)",
    activeText:  "#FFFFFF",
    activeBorder:"transparent",
    idleBg:      "#edfaf4",
    idleText:    "#1B8A5A",
    idleBorder:  "#a8e9cb",
    btnVariant:  "primary"  as const,
    placeholder: "Commentaire optionnel…",
    required:    false,
  },
  revision: {
    label:       "Demander une révision",
    icon:        <RotateCcw    className="h-4 w-4" />,
    activeBg:    "#d97706",
    activeText:  "#FFFFFF",
    activeBorder:"transparent",
    idleBg:      "#fffbeb",
    idleText:    "#b45309",
    idleBorder:  "#fde68a",
    btnVariant:  "danger"   as const,
    placeholder: "Expliquez ce qui doit être révisé… (obligatoire)",
    required:    true,
  },
  comment: {
    label:       "Ajouter un commentaire",
    icon:        <MessageSquare className="h-4 w-4" />,
    activeBg:    "linear-gradient(135deg, #1B8A5A, #156e48)",
    activeText:  "#FFFFFF",
    activeBorder:"transparent",
    idleBg:      "#F6F8FA",
    idleText:    "#475569",
    idleBorder:  "#E8ECF0",
    btnVariant:  "primary"  as const,
    placeholder: "Votre annotation…",
    required:    true,
  },
};

function getInitials(reviewerId: string) {
  return reviewerId.slice(0, 2).toUpperCase();
}

export function ReviewPanel({
  reviews,
  currentStatus,
  canReview,
  canComment,
  onApprove,
  onRevision,
  onComment,
}: ReviewPanelProps) {
  const [action,   setAction]  = useState<"approve" | "revision" | "comment" | null>(null);
  const [comment,  setComment] = useState("");
  const [loading,  setLoading] = useState(false);
  const [showAll,  setShowAll] = useState(false);

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);
  const hasActions     = canReview || canComment;

  const handleSubmit = async () => {
    if (!action) return;
    if (action !== "approve" && !comment.trim()) return;
    setLoading(true);
    try {
      if (action === "approve")  await onApprove(comment || undefined);
      if (action === "revision") await onRevision(comment);
      if (action === "comment")  await onComment(comment);
      setAction(null);
      setComment("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Boutons d'action ── */}
      {hasActions && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">Actions</p>
          <div className="flex flex-col gap-2">

            {/* Approuver / Réviser — canReview */}
            {canReview && currentStatus === "PENDING" && (
              <>
                {(["approve", "revision"] as const).map((key) => {
                  const cfg    = ACTION_CONFIG[key];
                  const isActive = action === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAction(isActive ? null : key)}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all text-left"
                      style={{
                        background:  isActive ? cfg.activeBg    : cfg.idleBg,
                        color:       isActive ? cfg.activeText  : cfg.idleText,
                        border:      `1px solid ${isActive ? cfg.activeBorder : cfg.idleBorder}`,
                        boxShadow:   isActive ? "0 4px 12px -2px rgba(0,0,0,0.15)" : "none",
                      }}
                    >
                      {cfg.icon}{cfg.label}
                    </button>
                  );
                })}
              </>
            )}

            {/* Annoter — canComment */}
            {canComment && (() => {
              const cfg    = ACTION_CONFIG.comment;
              const isActive = action === "comment";
              return (
                <button
                  type="button"
                  onClick={() => setAction(isActive ? null : "comment")}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all text-left"
                  style={{
                    background: isActive ? cfg.activeBg   : cfg.idleBg,
                    color:      isActive ? cfg.activeText : cfg.idleText,
                    border:     `1px solid ${isActive ? cfg.activeBorder : cfg.idleBorder}`,
                  }}
                >
                  {cfg.icon}{cfg.label}
                </button>
              );
            })()}
          </div>

          {/* Zone saisie contextuelle */}
          {action && (
            <div
              className="space-y-3 rounded-xl p-4"
              style={{ background: "#F6F8FA", border: "1px solid #E8ECF0", animation: "slideDown 0.18s ease-out" }}
            >
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={ACTION_CONFIG[action].placeholder}
                rows={3}
                className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans"
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => { setAction(null); setComment(""); }}>
                  Annuler
                </Button>
                <Button
                  variant={ACTION_CONFIG[action].btnVariant}
                  className="flex-1"
                  disabled={loading || (ACTION_CONFIG[action].required && !comment.trim())}
                  onClick={handleSubmit}
                >
                  {loading
                    ? <span className="inline-block animate-spin">⟳</span>
                    : <Send className="h-3.5 w-3.5" />
                  }
                  {ACTION_CONFIG[action].label}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Historique revues ── */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em]">
          Annotations & revues ({reviews.length})
        </p>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">Aucune annotation pour le moment.</p>
        ) : (
          <div className="space-y-2.5">
            {visibleReviews.map((r) => (
              <div
                key={r.id}
                className="flex gap-3 p-3.5 rounded-xl"
                style={{ background: "#F6F8FA", border: "1px solid #E8ECF0" }}
              >
                <Avatar
                  firstName={getInitials(r.reviewerId)}
                  lastName=""
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 tracking-[-0.01em]">
                      {r.reviewerId.slice(0, 8)}…
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                  </div>
                  {/* Badge statut si décision */}
                  {r.status && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold mt-1"
                      style={
                        r.status === "APPROVED"
                          ? { background: "#edfaf4", color: "#1B8A5A", border: "1px solid #a8e9cb" }
                          : { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }
                      }
                    >
                      {r.status === "APPROVED" ? <CheckCircle2 className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                      {r.status === "APPROVED" ? "Approuvé" : "Révision demandée"}
                    </span>
                  )}
                  {r.comment && (
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{r.comment}</p>
                  )}
                </div>
              </div>
            ))}

            {reviews.length > 3 && (
              <Button
                variant="ghost" size="sm"
                onClick={() => setShowAll((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                {showAll
                  ? <><ChevronUp    className="h-3.5 w-3.5" />Voir moins</>
                  : <><ChevronDown  className="h-3.5 w-3.5" />Voir {reviews.length - 3} de plus</>
                }
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}