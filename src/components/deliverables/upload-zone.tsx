"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileText, X, AlertCircle, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (file: File, title: string) => Promise<void>;
  uploading: boolean;
  className?: string;
}

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".zip"];
const MAX_SIZE_MB = 25;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  const isDoc =
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (isDoc) return <FileText className="h-6 w-6 text-blue-500" />;
  const emoji: Record<string, string> = {
    "application/pdf": "📄",
    "application/zip": "📦",
    "application/x-zip-compressed": "📦",
  };
  return <span className="text-2xl">{emoji[mimeType] ?? "📎"}</span>;
}

export function UploadZone({
  onUpload,
  uploading,
  className,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const validateFile = (f: File): string | null => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext))
      return `Format non autorisé. Acceptés : ${ALLOWED_EXTENSIONS.join(", ")}`;
    if (f.size > MAX_SIZE_MB * 1024 * 1024)
      return `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo)`;
    return null;
  };

  const handleFile = (f: File) => {
    const error = validateFile(f);
    if (error) {
      setFileError(error);
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(f);
    setTitle(f.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) return;
    await onUpload(file, title.trim());
    setFile(null);
    setTitle("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Input caché */}
      <input
        ref={inputRef}
        id="file-upload-input"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.zip"
        aria-label="Sélectionner un fichier à déposer"
        onChange={onInputChange}
      />

      {/* Zone de dépôt */}
      {!file && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Zone de dépôt. Glissez-déposez ou appuyez sur Entrée pour sélectionner."
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
          style={
            dragOver
              ? {
                  background: "#edfaf4",
                  border: "2px dashed #1B8A5A",
                  transform: "scale(1.01)",
                }
              : { background: "#F6F8FA", border: "2px dashed #C8CDD5" }
          }
          onMouseEnter={(e) => {
            if (!dragOver) e.currentTarget.style.borderColor = "#a8e9cb";
          }}
          onMouseLeave={(e) => {
            if (!dragOver) e.currentTarget.style.borderColor = "#C8CDD5";
          }}
        >
          <div className="space-y-3">
            <div
              className="mx-auto h-14 w-14 rounded-2xl flex items-center justify-center transition-all"
              style={{ background: dragOver ? "#d2f4e4" : "#E8ECF0" }}
            >
              <Upload
                className="h-6 w-6 transition-colors"
                style={{ color: dragOver ? "#1B8A5A" : "#94a3b8" }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 tracking-[-0.01em]">
                {dragOver
                  ? "Déposez le fichier ici"
                  : "Glissez-déposez ou cliquez pour sélectionner"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, Word, ZIP — max {MAX_SIZE_MB} Mo
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Aperçu fichier */}
      {file && (
        <div
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{ background: "#edfaf4", border: "1.5px solid #a8e9cb" }}
        >
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "#FFFFFF",
              border: "1px solid #a8e9cb",
              boxShadow: "0 2px 8px -2px rgb(0 0 0/0.08)",
            }}
          >
            <FileIcon mimeType={file.type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate tracking-[-0.01em]">
              {file.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatBytes(file.size)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded-full flex items-center justify-center"
              style={{ background: "#1B8A5A" }}
            >
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <button
              type="button"
              aria-label="Supprimer le fichier"
              onClick={() => {
                setFile(null);
                setTitle("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
              style={{ background: "#FFFFFF", border: "1px solid #E8ECF0" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Erreur */}
      {fileError && (
        <div
          className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 overflow-hidden relative"
          style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-red-500" />
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 ml-1" />
          <span className="text-red-700 text-xs">{fileError}</span>
        </div>
      )}

      {/* Titre du livrable */}
      {file && (
        <div
          className="space-y-1.5"
          style={{ animation: "slideUp 0.18s ease-out" }}
        >
          <label
            htmlFor="deliverable-title"
            className="block text-sm font-medium text-slate-700 tracking-[-0.01em]"
          >
            Titre du livrable <span className="text-red-500">*</span>
          </label>
          <input
            id="deliverable-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Rapport intermédiaire — Chapitre 1"
            className="w-full rounded-[0.625rem] border-[1.5px] border-[#E8ECF0] bg-white px-4 py-2.75 text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary-600 focus:shadow-[0_0_0_3px_rgb(27_138_90/0.10)] transition-all font-sans tracking-[-0.01em]"
            maxLength={255}
          />
        </div>
      )}

      {/* Bouton soumettre */}
      {file && (
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || uploading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            animation: "slideUp 0.18s ease-out",
            background: "linear-gradient(135deg, #1B8A5A, #156e48)",
            boxShadow: "0 4px 12px -2px rgb(27 138 90/0.30)",
          }}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Déposer le livrable
            </>
          )}
        </button>
      )}
    </div>
  );
}
