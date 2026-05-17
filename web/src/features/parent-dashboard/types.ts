import type { HomeworkSummary } from "@/features/homework/types";
import type { StudentFocusSignal } from "@/features/student-dashboard/types";

export type ParentLinkedTeacher = {
  id: string;
  name: string;
  subject_name?: string | null;
  class_name?: string | null;
};

export type ParentTeacherNote = {
  id: string;
  teacher_name: string;
  subject_name?: string | null;
  student_name: string;
  note: string;
  next_step?: string | null;
  updated_at: string;
};

export type ParentChildSnapshot = {
  id: string;
  full_name: string;
  school_name?: string | null;
  class_name?: string | null;
  relationship?: string | null;
  pending_homework_count: number;
  active_focus_count: number;
  recent_activity_count: number;
  next_homework?: HomeworkSummary | null;
  focus_areas: StudentFocusSignal[];
  linked_teachers: ParentLinkedTeacher[];
  support_tip: string;
};

export type ParentDashboardData = {
  children: ParentChildSnapshot[];
  teacher_notes: ParentTeacherNote[];
  source: "demo" | "fallback";
  fallback_message?: string;
  last_updated: string;
};
