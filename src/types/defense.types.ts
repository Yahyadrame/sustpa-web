// ✅ NOUVEAU — Rôles jury typés
export type JuryRole = "PRESIDENT" | "RAPPORTEUR" | "EXAMINATEUR" | "ENCADRANT";

export interface Defense {
  id: string;
  projectId: string;
  scheduledAt: string;
  room: string | null;
  finalGrade: number | null; // ✅ number (était string | null)
  remarks: string | null;
  minutesUrl: string | null;
  createdAt: string;
  updatedAt: string;
  canManagePV: boolean;
  jury?: JuryMember[];
  project?: {
    id: string;
    title: string;
    type: string;
    status: string;
  };
}

export interface JuryMember {
  id: string;
  defenseId: string;
  teacherId: string;
  juryRole: JuryRole; // ✅ NOUVEAU
  grade: number | null;
  comment: string | null;
  teacher?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ✅ NOUVEAU — Payload assignJury
export interface AssignJuryMember {
  teacherId: string;
  juryRole: JuryRole;
}

export interface AssignJuryPayload {
  members: AssignJuryMember[];
}
