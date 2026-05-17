import type { ApprovalStatus } from "@/lib/constants";

export type ApprovalRequest = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  requested_role: "teacher" | "parent";
  school_id: string;
  school_name: string;
  status: ApprovalStatus;
  reason?: string | null;
  parent_request?: {
    child_name?: string | null;
    child_email?: string | null;
    child_class?: string | null;
    relationship?: string | null;
  } | null;
  created_at: string;
};

export type SchoolAdminOverview = {
  pending_approvals: number;
  total_students: number;
  total_teachers: number;
  total_parents: number;
  active_classes: number;
  teacher_student_relations: number;
  parent_student_relations: number;
};

export type ManagedStudent = {
  id: string;
  full_name: string;
  email: string;
  class_name?: string | null;
  assigned_teachers_count: number;
  linked_parents_count: number;
  status: ApprovalStatus;
  last_active?: string | null;
};

export type ManagedTeacher = {
  id: string;
  full_name: string;
  email: string;
  subjects_or_classes?: string[];
  assigned_students_count: number;
  status: ApprovalStatus;
};

export type ManagedParent = {
  id: string;
  full_name: string;
  email: string;
  linked_students_count: number;
  status: ApprovalStatus;
};

export type ManagedClass = {
  id: string;
  name: string;
  code: string;
  grade_level?: string | null;
  teacher_name?: string | null;
  subject?: string | null;
  student_count: number;
  teachers_count: number;
  pending_homework_count: number;
  weak_topics_summary: string;
};

export type TeacherStudentRelation = {
  teacher_id: string;
  teacher_name: string;
  student_id: string;
  student_name: string;
  class_id?: string | null;
  class_name?: string | null;
  subject_id?: string | null;
  subject_name?: string | null;
};

export type ParentStudentRelation = {
  parent_id: string;
  parent_name: string;
  student_id: string;
  student_name: string;
  relationship?: string | null;
};

export type SchoolAdminRelations = {
  teacher_students: TeacherStudentRelation[];
  parent_students: ParentStudentRelation[];
};
