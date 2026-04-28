import { cn, getInitials } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Avatar — SUSTPA
   Pastilles initiales avec palette de couleurs SUSTPA
───────────────────────────────────────────────────────────── */

interface AvatarProps {
  firstName: string;
  lastName: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const SIZES = {
  xs: "h-6  w-6  text-[10px]",
  sm: "h-8  w-8  text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
  "2xl": "h-20 w-20 text-2xl",
};

/* Palette SUSTPA alignée avec les couleurs du système */
const COLORS = [
  "bg-primary-100 text-primary-700", // vert émeraude
  "bg-blue-100    text-blue-700",
  "bg-violet-100  text-violet-700",
  "bg-amber-100   text-amber-700",
  "bg-rose-100    text-rose-700",
  "bg-cyan-100    text-cyan-700",
  "bg-indigo-100  text-indigo-700",
  "bg-teal-100    text-teal-700",
];

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % COLORS.length;
}

export function Avatar({
  firstName,
  lastName,
  src,
  size = "md",
  className,
}: AvatarProps) {
  const initials = getInitials(firstName, lastName);
  const colorClass = COLORS[getColorIndex(firstName + lastName)];

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn(
          "rounded-full object-cover ring-2 ring-white shrink-0",
          SIZES[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center",
        "font-semibold tracking-[-0.01em]",
        "ring-2 ring-white select-none shrink-0",
        SIZES[size],
        colorClass,
        className,
      )}
      title={`${firstName} ${lastName}`}
    >
      <span aria-hidden="true">{initials}</span>
      <span className="sr-only">{`${firstName} ${lastName}`}</span>
    </div>
  );
}

/* ─── AvatarGroup ───────────────────────────────────────────── */
interface AvatarGroupProps {
  users: Array<{ firstName: string; lastName: string; src?: string | null }>;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export function AvatarGroup({
  users,
  max = 4,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((u, i) => (
        <Avatar key={i} {...u} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            "text-xs font-semibold tracking-tight",
            "bg-[#F6F8FA] text-slate-600 ring-2 ring-white shrink-0",
            SIZES[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
