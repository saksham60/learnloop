import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Building2,
  ClipboardCheck,
  FileText,
  Flag,
  GraduationCap,
  Home,
  Layers3,
  LineChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UserRoundSearch,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type AppRole =
  | "student"
  | "teacher"
  | "parent"
  | "school_admin"
  | "platform_admin"
  | "pending";

export type ApprovalStatus = "active" | "pending_approval" | "rejected" | "suspended";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LearnLoop AI";
export const APP_TAGLINE = "Think. Try. Reflect. Grow.";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://learnloop-wpdv.onrender.com";

export const featureFlags = {
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
  googleAuth: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== "false",
  emailAuth: process.env.NEXT_PUBLIC_ENABLE_EMAIL_AUTH !== "false",
  studentApp: process.env.NEXT_PUBLIC_ENABLE_STUDENT_APP !== "false",
  teacherDashboard: process.env.NEXT_PUBLIC_ENABLE_TEACHER_DASHBOARD !== "false",
  adminDashboard: process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD !== "false",
  parentDashboard: process.env.NEXT_PUBLIC_ENABLE_PARENT_DASHBOARD === "true",
  socraticMode: process.env.NEXT_PUBLIC_ENABLE_SOCRATIC_MODE !== "false",
  homework: process.env.NEXT_PUBLIC_ENABLE_HOMEWORK !== "false",
  compass: process.env.NEXT_PUBLIC_ENABLE_LEARNING_COMPASS !== "false",
  progressQa: process.env.NEXT_PUBLIC_ENABLE_PROGRESS_QA !== "false",
  growth: process.env.NEXT_PUBLIC_ENABLE_GROWTH_MODULES !== "false",
  offlineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === "true",
};

export const roleDestinations: Record<AppRole, string> = {
  student: "/student",
  teacher: "/teacher",
  parent: "/parent",
  school_admin: "/school-admin",
  platform_admin: "/master",
  pending: "/onboarding/role",
};

export const approvalDestinations: Record<ApprovalStatus, string | null> = {
  active: null,
  pending_approval: "/onboarding/pending-approval",
  rejected: "/onboarding/rejected",
  suspended: "/onboarding/suspended",
};

export const studentNav: NavItem[] = [
  { title: "Today", href: "/student", icon: Home, description: "Daily companion dashboard" },
  {
    title: "Companion",
    href: "/student/companion",
    icon: BrainCircuit,
    description: "Guided learning conversations",
  },
  { title: "Homework", href: "/student/homework", icon: FileText, description: "Attempt-first coaching" },
  { title: "Focus", href: "/student/focus", icon: Flag, description: "Learning Compass priorities" },
  { title: "Progress", href: "/student/progress", icon: LineChart, description: "Ask My Progress" },
  { title: "Growth", href: "/student/growth", icon: Sparkles, description: "Habits, sports, skills" },
];

export const teacherNav: NavItem[] = [
  { title: "Overview", href: "/teacher", icon: Home, description: "Classroom signal board" },
  { title: "Classes", href: "/teacher/classes", icon: Users, description: "Per-class insights" },
  { title: "Homework", href: "/teacher/homework", icon: BookOpen, description: "Assignments and analytics" },
  { title: "Content", href: "/teacher/content", icon: Layers3, description: "Upload and process content" },
  { title: "Analytics", href: "/teacher/analytics", icon: BarChart3, description: "Weak topics and trends" },
];

export const schoolAdminNav: NavItem[] = [
  { title: "Overview", href: "/school-admin", icon: Home, description: "School control center" },
  { title: "Approvals", href: "/school-admin/approvals", icon: ClipboardCheck, description: "Review access requests" },
  { title: "Students", href: "/school-admin/students", icon: GraduationCap, description: "Student roster and status" },
  { title: "Teachers", href: "/school-admin/teachers", icon: Users, description: "Teacher roster and assignments" },
  { title: "Parents", href: "/school-admin/parents", icon: UserRoundSearch, description: "Parent links and approvals" },
  { title: "Classes", href: "/school-admin/classes", icon: Building2, description: "Class structure and ownership" },
  { title: "Relations", href: "/school-admin/relations", icon: ShieldCheck, description: "Teacher and parent links" },
];

export const masterNav: NavItem[] = [
  { title: "Overview", href: "/master", icon: Home, description: "Platform-level control tower" },
  { title: "Schools", href: "/master/schools", icon: Building2, description: "Provision and manage schools" },
  { title: "School Admins", href: "/master/school-admins", icon: ShieldCheck, description: "Assign school administrators" },
  { title: "Users", href: "/master/users", icon: Users, description: "Cross-school user directory" },
  { title: "Settings", href: "/master/settings", icon: Settings, description: "Platform settings and health" },
];

export const parentNav: NavItem[] = [
  { title: "Overview", href: "/parent", icon: Home, description: "Child progress snapshot" },
  { title: "Progress", href: "/parent#progress", icon: LineChart, description: "Child learning trend placeholder" },
  { title: "Homework", href: "/parent#homework", icon: FileText, description: "Homework summary placeholder" },
  { title: "Teacher Notes", href: "/parent#notes", icon: BookOpen, description: "Teacher note placeholder" },
];

export const legacyAdminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: ShieldCheck, description: "Legacy admin placeholder" },
  { title: "Users", href: "/admin/users", icon: Users, description: "User roles and onboarding" },
  { title: "Classes", href: "/admin/classes", icon: GraduationCap, description: "School structure" },
  { title: "Settings", href: "/admin/settings", icon: Settings, description: "Feature and org settings" },
];

export const adminNav = legacyAdminNav;
