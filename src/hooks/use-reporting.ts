"use client";
import { useState, useEffect } from "react";
import { reportingApi } from "@/services/reporting.service";
import type {
  GlobalStats,
  TeacherStats,
  StudentStats,
} from "@/types/reporting.types";
import type { AppRole } from "@/types/auth.types";

export function useReporting(role: AppRole | undefined) {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!role) return;
    setLoading(true);

    const load = async () => {
      try {
        // MODIFIÉ : RESPONSIBLE → RESPONSIBLE
        if (["RESPONSIBLE", "ADMIN"].includes(role)) {
          const data = await reportingApi.getGlobalStats();
          setGlobalStats(data);
        }

        // RESPONSIBLE peut aussi voir les stats enseignant (cumul encadrant)
        if (["TEACHER", "RESPONSIBLE"].includes(role)) {
          const data = await reportingApi.getTeacherStats();
          setTeacherStats(data);
        }

        if (role === "STUDENT") {
          const data = await reportingApi.getStudentStats();
          setStudentStats(data);
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [role]);

  return { globalStats, teacherStats, studentStats, loading };
}
