"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentUrl?: string | null;
  // CORRECTION 2 : firstName + lastName séparément pour Avatar
  firstName: string;
  lastName: string;
  onUpload: (file: File) => Promise<string | undefined>;
  onRemove: () => Promise<void>;
  saving: boolean;
}

export function AvatarUpload({
  currentUrl,
  firstName,
  lastName,
  onUpload,
  onRemove,
  saving,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    await onUpload(file);
  };

  const displayUrl = preview ?? currentUrl;
  const displayName = `${firstName} ${lastName}`.trim();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Zone avatar cliquable */}
      <div
        className={cn(
          "relative group cursor-pointer",
          dragging && "ring-4 ring-primary-300 ring-offset-2 rounded-full",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => !saving && inputRef.current?.click()}
      >
        {/* Avatar
            CORRECTION 1 : <img> remplacé par <Image> de next/image
            CORRECTION 2 : Avatar reçoit firstName + lastName séparément
        */}
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={displayName}
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <Avatar firstName={firstName} lastName={lastName} size="xl" />
        )}

        {/* Overlay hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-full flex items-center justify-center",
            "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
            saving && "opacity-100",
          )}
        >
          {saving ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>

        {/*
          CORRECTION 3 : input file sans label → aria-label + title ajoutés.
          Un <label> visible n'est pas possible ici (input caché),
          donc aria-label + title couvrent l'accessibilité.
        */}
        <input
          ref={inputRef}
          id="avatar-upload-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label={`Changer l'avatar de ${displayName}`}
          title={`Changer l'avatar de ${displayName}`}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={saving}
          aria-label="Changer l'avatar"
          title="Changer l'avatar"
          className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary-50"
        >
          <Camera className="h-3.5 w-3.5" />
          Changer
        </button>

        {displayUrl && (
          <button
            onClick={async () => {
              setPreview(null);
              await onRemove();
            }}
            disabled={saving}
            aria-label="Supprimer l'avatar"
            title="Supprimer l'avatar"
            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        JPEG, PNG ou WebP — max 3 Mo
        <br />
        Glissez-déposez ou cliquez pour changer
      </p>
    </div>
  );
}
